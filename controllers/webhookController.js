const flowEngine = require("../engine/flowEngine");

class WebhookController {
  async handleWebhook(req, res) {
    try {
      const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      if (!message) return res.sendStatus(200);

      const from = message.from;
      const text = message.text?.body || "";

      const reply = await flowEngine.handleMessage(from, text, "bookingFlow");

      return res.status(200).json({ reply });
    } catch (error) {
      console.error("Webhook Error:", error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new WebhookController();
