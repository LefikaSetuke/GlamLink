import express from "express";
import { whatsappWebhookHandler } from "./controllers/webhookController.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// WhatsApp webhook endpoint
app.post("/whatsapp", whatsappWebhookHandler);

// (Optional) Direct API for booking
import { saveClientBooking } from "./models/bookingSchema.js";
app.post("/api/book", async (req, res) => {
  const { phone, name, booking } = req.body;
  if (!phone || !name || !booking) {
    return res
      .status(400)
      .json({ error: "phone, name, and booking are required" });
  }
  try {
    await saveClientBooking(phone, name, booking);
    res.status(201).json({ message: "Booking saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
