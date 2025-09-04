//This file acts as the core engine for booking operations
const db = require("../config/firebase");
const Booking = require("../models/booking");
const whatsappService = require("./whatsappService");

class BookingService {
    async createBooking(bookingData) {
        try {
            const booking = new Booking(bookingData);
            const bookingId = await db.save("bookings", booking);

            await whatsappService.sendMessage(
                bookingData.phoneNumber, `Booking confirmed!\n\nService: ${booking.service}\nStylist: ${booking.stylist}\nTime: ${booking.time}\n\nThank you for choosing GlamLink!`
            );
            return {bookingId, ...booking};
        }   catch (error) {
            throw new Error(`Booking creation failed: ${error.message}`);
        }
    }
}

module.exports = new BookingService();