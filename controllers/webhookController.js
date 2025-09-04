import { saveClientBooking } from "../services/firebaseService.js";

// Simple in-memory session store
const sessions = {};


export async function whatsappWebhookHandler(req, res) {
  const userPhone = req.body.From.replace("whatsapp:", "");
  const userMessage = req.body.Body;
  const userName = req.body.ProfileName || "Unknown";
  const stylists = require("../Flows/bookingFlow.json").stylists;

  // Session management
  let session = sessions[userPhone] || {};

  function getStylistsServicesMessage() {
    return stylists.map(stylist => {
      const services = stylist.services.map(s => `${s.name} (R${s.price})`).join(', ');
      return `- ${stylist.stylistName}: ${services}`;
    }).join('\n');
  }

  function getAvailableSlots(stylistName, serviceName) {
    const stylist = stylists.find(s => s.stylistName.toLowerCase() === stylistName.toLowerCase());
    if (!stylist) return [];
    const service = stylist.services.find(s => s.name.toLowerCase() === serviceName.toLowerCase());
    if (!service) return [];
    return stylist.availableSlots;
  }

  // Chat flow logic
  function handleUserMessage(userMessage, session) {
    if (!session.step) {
      session.step = 'ask_service';
      return {
        reply: "Here are our stylists and their services:\n" + getStylistsServicesMessage() +
          "\n\nPlease reply with the stylist and service you'd like to book (e.g., 'Nomhle Makeup').",
        session
      };
    }

    if (session.step === 'ask_service') {
      // Parse stylist and service from user message
      const [stylistName, serviceName] = userMessage.split(' ');
      session.stylistName = stylistName;
      session.serviceName = serviceName;
      session.step = 'ask_time';
      const slots = getAvailableSlots(stylistName, serviceName);
      return {
        reply: `${stylistName}'s available slots for ${serviceName} are:\n- ${slots.join('\n- ')}\n\nPlease reply with your preferred time slot.`,
        session
      };
    }

    if (session.step === 'ask_time') {
      session.time = userMessage;
      session.step = 'ask_details';
      return {
        reply: "Please provide your name and phone number to confirm your booking.",
        session
      };
    }

    if (session.step === 'ask_details') {
      // Save booking to database
      const [name, phoneNumber] = userMessage.split(',').map(s => s.trim());
      session.name = name;
      session.phoneNumber = phoneNumber;
      session.step = 'done';
      return {
        reply: `Thank you, ${name}! Your ${session.serviceName} appointment with ${session.stylistName} at ${session.time} has been booked.`,
        session
      };
    }

    return { reply: "Booking complete!", session };
  }

  // Process user message
  const { reply, session: updatedSession } = handleUserMessage(userMessage, session);
  sessions[userPhone] = updatedSession;

  // Save booking 
  if (updatedSession.step === 'done') {
    const booking = {
      service: updatedSession.serviceName,
      stylist: updatedSession.stylistName,
      time: updatedSession.time,
      payments: [],
      phoneNumber: updatedSession.phoneNumber,
      name: updatedSession.name
    };
    try {
      await saveClientBooking(userPhone, updatedSession.name, booking);
    } catch (error) {
      return res.status(500).send("Error saving booking");
    }
  }

  // Send reply back to WhatsApp
  res.status(200).send(reply);
}
