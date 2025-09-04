const bookingService = require("../services/bookingService");

class BookingController {
    async create(req, res) {
        try {
            const result = await bookingService.createBooking(req.body);
            return res.status(201).json({success: true, booking: result});
        }   catch (error) {
            return res.status(500).json({success: false, message:error.message});
        }
    }
}

module.exports = new BookingController();