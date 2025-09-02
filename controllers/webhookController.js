import { saveClientBooking } from './bookingController.js';

export async function whatsappWebhookHandler(req, res) {
  const userPhone = req.body.From.replace('whatsapp:', '');
  const userName = req.body.ProfileName || 'Unknown';

  // Example: Collect booking details from the message/session
  const booking = {
    service: req.body.service,
    stylist: req.body.stylist,
    time: req.body.time,
    payments: req.body.payments // array of payment objects
  };

  try {
    await saveClientBooking(userPhone, userName, booking);
    res.status(200).send('Booking saved!');
  } catch (error) {
    res.status(500).send('Error saving booking');
  }
}