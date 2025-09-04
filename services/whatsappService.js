const axios = require("axios");

class WhatsAppService {
  constructor() {
    this.apiUrl = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    this.token = process.env.WHATSAPP_TOKEN;
  }

  /**
   * Send a WhatsApp message
   * @param {string} to - Recipient phone number
   * @param {string} message - Message body
   */
  async sendMessage(to, message) {
    try {
      await axios.post(
        this.apiUrl,
        {
          messaging_product: "whatsapp",
          to,
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      throw new Error(`WhatsApp Send Error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

module.exports = new WhatsAppService();
