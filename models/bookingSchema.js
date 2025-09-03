export function validateBooking(booking) {
  if (
    typeof booking.service !== 'string' ||
    typeof booking.stylist !== 'string' ||
    typeof booking.time !== 'string' ||
    !Array.isArray(booking.payments)
  ) {
    return false;
  }
  for (const payment of booking.payments) {
    if (
      typeof payment.amount !== 'number' ||
      typeof payment.method !== 'string' ||
      typeof payment.status !== 'string'
    ) {
      return false;
    }
  }
  return true;
}