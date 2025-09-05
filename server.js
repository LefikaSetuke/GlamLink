require("dotenv").config();
const express = require ("express");
const bodyParser = require("body-parser");
const webhookController = require("./controllers/webhookController.js");

const app = express();

//Middleware
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Glamlink WhatsApp bot is running");
});

app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  //Extract query params
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFIED");
    res.status(200).send(challenge);
  } else {
    console.log("WEBHOOK VERIFICATION FAILED");
    res.sendStatus(403);
  }
});

//POST/webhook
app.post("/webhook", (req, res) => webhookController.handleWebHook(req, res));

//Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
