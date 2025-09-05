import fs from 'fs';
import path from 'path';
import readline from 'readline';

// Load JSON file
const flowPath = path.resolve('./Flows/BookingFlow.json');
const flow = JSON.parse(fs.readFileSync(flowPath, 'utf8'));

// Session data
const session = {
  data: {
    stylists: flow.stylists,
    selectedStylist: null,
    selectedSlot: null
  }
};

// Helper to format arrays/objects
function formatValue(value) {
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return value.map(s => s.name ? `${s.name} (${s.price})` : s).join(', ');
  return value ?? '';
}

// Resolve placeholders
function resolveMessage(message) {
  return message.replace(/\{session\.data\.(.*?)\}/g, (_, keyPath) => {
    const keys = keyPath.split(".");
    let value = session.data;
    for (let k of keys) {
      k = k.replace(/['"]/g, "");
      if (value && k in value) {
        value = value[k];
      } else {
        return `{${keyPath}}`;
      }
    }
    return formatValue(value);
  });
}

// Readline setup
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

// Start chatbot
async function browseStylists() {
  console.log(resolveMessage(flow.nodes.greeting.message));
  while (true) {
    console.log("\nMain Menu:\n1. Browse Stylists\n2. View My Bookings\n3. Contact Support");
    const choice = await ask("Choose an option: ");

    if (choice === "1") {
      await selectService();
    } else if (choice === "2") {
      console.log("\nYou currently have no bookings.");
    } else if (choice === "3") {
      console.log("\nFor support, call +26671018609");
    } else {
      console.log("Invalid choice, try again.");
    }
  }
}

// Select service
async function selectService() {
  console.log("\nSelect a service to filter stylists:\n1. Makeup\n2. Nails\n3. Hair Cut\n4. Hairstyles\n5. All Services");
  const choice = await ask("Choose a service: ");
  let filteredStylists = session.data.stylists;

  const serviceMap = { "1": "Makeup", "2": "Nails", "3": "Hair Cut", "4": "Hairstyles", "5": "All Services" };
  const service = serviceMap[choice] || "All Services";

  if (service !== "All Services") {
    filteredStylists = filteredStylists.filter(s => s.services.some(serv => serv.name === service));
  }

  await browseStylistsFiltered(filteredStylists);
}

// Show filtered stylists
async function browseStylistsFiltered(stylists) {
  console.log("\nAvailable Stylists:");
  stylists.forEach((s, i) => console.log(`${i + 1}. ${s.stylistName}`));

  const sel = await ask("Select a stylist (number): ");
  const idx = parseInt(sel) - 1;
  if (idx >= 0 && idx < stylists.length) {
    session.data.selectedStylist = stylists[idx];
    await showStylistDetails();
  } else {
    console.log("Invalid selection.");
  }
}

// Show stylist details and book
async function showStylistDetails() {
  const s = session.data.selectedStylist;
  console.log(`\nStylist: ${s.stylistName}`);
  console.log(`Phone: ${s.phoneNumber}`);
  console.log(`Services: ${formatValue(s.services)}`);
  console.log(`Available Slots: ${formatValue(s.availableSlots)}`);
  console.log(`Payment Methods: ${formatValue(s.paymentMethods)}`);

  console.log("\n1. Book a Slot\n2. Back to Stylists\n3. Main Menu");
  const choice = await ask("Choose an option: ");

  if (choice === "1") {
    await bookSlot();
  } else if (choice === "2") {
    await selectService();
  }
}

// Book a slot
async function bookSlot() {
  const s = session.data.selectedStylist;
  console.log("\nAvailable Slots:");
  s.availableSlots.forEach((slot, i) => console.log(`${i + 1}. ${slot}`));

  const sel = await ask("Select a slot (number): ");
  const idx = parseInt(sel) - 1;
  if (idx >= 0 && idx < s.availableSlots.length) {
    session.data.selectedSlot = s.availableSlots[idx];
    confirmBooking();
  } else {
    console.log("Invalid slot.");
  }
}

// Confirm booking
function confirmBooking() {
  const s = session.data.selectedStylist;
  console.log("\n Booking confirmed!");
  console.log(`Stylist: ${s.stylistName}`);
  console.log(`Slot: ${session.data.selectedSlot}`);
  console.log(`Phone: ${s.phoneNumber}`);
  console.log(`Payment Methods: ${formatValue(s.paymentMethods)}`);
}

browseStylists();
