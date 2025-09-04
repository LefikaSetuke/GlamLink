export function validateBooking(booking) {

  // Validate bookingStatus
  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  if (
    typeof booking.bookingStatus !== 'string' ||
    !validStatuses.includes(booking.bookingStatus)
  ) {
    return false;
  }
  if (
    typeof booking.phoneNumber !== 'string' || 
    typeof booking.name !== 'string' ||
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