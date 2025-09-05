const flowEngine = require("../engine/flowEngine");
const {sendMessage} = require("../services/whatsappService");

class WebhookController {
  async handleWebhook(req, res) {
    try {
      const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      if (!message) return res.sendStatus(200);

      const from = message.from;
      const text = message.text?.body || "";

      const reply = await flowEngine.handleMessage(from, text, "bookingFlow");

      if (reply) {
        await sendMessage(from, reply);
      }

      return res.sendStatus(200);
    } catch (error) {
      console.error("Webhook Error:", error.message);
      return res.sendStatus(500);
    }
  }
}

module.exports = new WebhookController();
