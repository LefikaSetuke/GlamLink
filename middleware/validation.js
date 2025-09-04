function validateBooking(booking) {
  const errors = [];

  if (!booking.clientName || typeof booking.clientName !== "string") {
    errors.push("Client name is required and must be a string.");
  }
  if (!booking.phoneNumber || typeof booking.phoneNumber !== "string") {
    errors.push("Phone number is required and must be a string.");
  }
  if (!booking.service || typeof booking.service !== "string") {
    errors.push("Service is required and must be a string.");
  }
  if (!booking.stylist || typeof booking.stylist !== "string") {
    errors.push("Stylist is required and must be a string.");
  }
  if (!booking.time || typeof booking.time !== "string") {
    errors.push("Time is required and must be a string.");
  }

  if (!Array.isArray(booking.payments)) {
    errors.push("Payments must be an array.");
  } else {
    booking.payments.forEach((payment, i) => {
      if (typeof payment.amount !== "number" || payment.amount <= 0) {
        errors.push(`Payment[${i}] amount must be a positive number.`);
      }
      if (!["card", "cash", "mobile_money"].includes(payment.method)) {
        errors.push(`Payment[${i}] method is invalid.`);
      }
      if (!["pending", "completed", "failed"].includes(payment.status)) {
        errors.push(`Payment[${i}] status is invalid.`);
      }
    });
  }

  return { isValid: errors.length === 0, errors };
}

module.exports = { validateBooking };
