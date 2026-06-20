const {
  createBooking,
  listBookingsByUserId,
  getBookingById,
  hasActiveBooking
} = require("../models/bookingModel");
const { sendBookingNotification } = require("../services/notificationQueue");

const create = async (req, res, next) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "Only users can book tickets" });
    }

    const eventId = Number(req.body.event_id);
    const seats = Number(req.body.seats || 1);

    if (!eventId || seats < 1) {
      return res.status(400).json({ message: "event_id and valid seats are required" });
    }

    const alreadyBooked = await hasActiveBooking(req.user.id, eventId);
    if (alreadyBooked) {
      return res.status(409).json({ message: "You already booked this event" });
    }

    const reserveResponse = await fetch(
      `${process.env.EVENT_SERVICE_URL}/events/${eventId}/reserve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-service-token": process.env.INTERNAL_SERVICE_TOKEN || ""
        },
        body: JSON.stringify({ seats })
      }
    );

    if (!reserveResponse.ok) {
      return res.status(409).json({ message: "Seats unavailable" });
    }

    const booking = await createBooking({
      userId: req.user.id,
      eventId,
      seats,
      status: "confirmed"
    });

    try {
      await sendBookingNotification({
        eventType: "BOOKING_CONFIRMED",
        bookingId: String(booking.id),
        userId: String(booking.user_id),
        eventId: String(booking.event_id),
        timestamp: new Date().toISOString()
      });
    } catch (notificationError) {
      console.error("Failed to send booking notification:", notificationError);
    }

    return res.status(201).json(booking);
  } catch (error) {
    return next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const bookings = await listBookingsByUserId(req.user.id);
    return res.json(bookings);
  } catch (error) {
    return next(error);
  }
};

const detail = async (req, res, next) => {
  try {
    const booking = await getBookingById(req.params.id, req.user.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    return res.json(booking);
  } catch (error) {
    return next(error);
  }
};

module.exports = { create, list, detail };
