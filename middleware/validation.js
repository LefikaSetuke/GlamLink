
//Ensures clean error handling 
import { validateBooking } from '../models/bookingSchema.js';

//validate booking data
export function bookingValidationMiddleware(req, res, next) {
	const booking = req.body.booking;
	if (!booking || !validateBooking(booking)) {
		return res.status(400).json({ error: 'Invalid booking data' });
	}
	next();
}

