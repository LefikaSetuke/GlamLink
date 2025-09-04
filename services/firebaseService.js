import { db, FieldValue } from '../config/firebase.js';
import { validateBooking } from '../models/bookingSchema.js';

export async function saveClientBooking(phone, name, booking) {
  if (
    typeof phone !== 'string' ||
    typeof name !== 'string' ||
    !booking ||
    !validateBooking(booking)
  ) {
    throw new Error('Invalid booking or client data');
  }
  try {
    const clientRef = db.collection("Clients").doc(phone);
    await clientRef.set({ name }, { merge: true });
    await clientRef.update({
      bookings: FieldValue.arrayUnion(booking)
    });
  } catch (error) {
    console.error("Error saving booking:", error);
    throw error;
  }
}

export async function handleBookingConfirmation(incomingMessage, userResponses) {
  const phone = incomingMessage.from.replace('whatsapp:', '');
  const name = userResponses.name;
  const booking = {
    service: userResponses.service,
    stylist: userResponses.stylist,
    time: userResponses.time,
    payments: userResponses.payments
  };
  await saveClientBooking(phone, name, booking);
  // Optionally send WhatsApp confirmation message here
}