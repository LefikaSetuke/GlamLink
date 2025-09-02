import { setDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase.js'; // Note the .js extension

export async function saveClientBooking(phone, name, booking) {
  try {
    const clientRef = doc(db, "Clients", phone);
    await setDoc(clientRef, { name }, { merge: true });
    await updateDoc(clientRef, {
      bookings: arrayUnion(booking)
    });
  } catch (error) {
    console.error("Error saving booking:", error);
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
  // sendWhatsAppMessage(phone, "Your appointment has been booked!");
}