import { db } from '../config/firebase.js';
import { validateBooking } from '../models/bookingSchema.js';
import { query, where, getDocs } from "firebase/firestore";
import { collection, doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

export async function saveClientBooking(phone, name, booking) {
  
  const bookingToSave = { ...booking, phoneNumber: phone, name, bookingStatus: 'pending' };
  if (!booking || !validateBooking(bookingToSave)) {
    throw new Error('Invalid booking or client data');
  }
  try {
    const clientRef = doc(collection(db, "Clients"), phone);
    await setDoc(clientRef, { name }, { merge: true });
    await updateDoc(clientRef, {
      bookings: arrayUnion(bookingToSave)
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
    payments: userResponses.payments,
    phoneNumber: phone,
    bookingStatus: userResponses.bookingStatus || 'pending'
  };
  await saveClientBooking(phone, name, booking);
  // Send WhatsApp confirmation message here
}

export async function isStylistAvailable(stylist, time) {
  const bookingsRef = collection(db, "Clients");
  const q = query(bookingsRef, where("bookings", "array-contains", { stylist, time }));
  const snapshot = await getDocs(q);
  // If any booking matches, stylist is not available
  for (const docSnap of snapshot.docs) {
    const clientData = docSnap.data();
    if (clientData.bookings) {
      for (const booking of clientData.bookings) {
        if (booking.stylist === stylist && booking.time === time && booking.bookingStatus !== "cancelled") {
          return false;
        }
      }
    }
  }
  return true;
}