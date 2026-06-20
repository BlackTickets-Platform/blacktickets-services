const axios = require("axios");

const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL;

if (!BOOKING_SERVICE_URL) {
  throw new Error("BOOKING_SERVICE_URL environment variable is required.");
}

const createBooking = async ({ eventId, seats, userId, token }) => {
  const url = `${BOOKING_SERVICE_URL}/bookings`;
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await axios.post(
    url,
    {
      event_id: eventId,
      seats,
    },
    {
      headers,
    }
  );

  return response.data;
};

module.exports = { createBooking };