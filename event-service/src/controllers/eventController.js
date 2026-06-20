const {
  createEvent,
  listEvents,
  getEventById,
  reserveSeats
} = require("../models/eventModel");
const { uploadPoster } = require("../services/posterStorage");

const create = async (req, res, next) => {
  try {
    const { name, description, venue, date, total_seats, poster_url } = req.body;
    if (!name || !venue || !date || !total_seats) {
      return res.status(400).json({ message: "name, venue, date and total_seats are required" });
    }

    const uploadedPosterUrl = req.file ? await uploadPoster(req.file) : null;

    const event = await createEvent({
      name,
      description: description || "",
      venue,
      date,
      total_seats: Number(total_seats),
      poster_url: uploadedPosterUrl || poster_url || null
    });
    return res.status(201).json(event);
  } catch (error) {
    return next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const events = await listEvents();
    return res.json(events);
  } catch (error) {
    return next(error);
  }
};

const detail = async (req, res, next) => {
  try {
    const event = await getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    return res.json(event);
  } catch (error) {
    return next(error);
  }
};

const reserve = async (req, res, next) => {
  try {
    const seats = Number(req.body.seats || 1);
    if (seats < 1) {
      return res.status(400).json({ message: "seats must be at least 1" });
    }

    const event = await reserveSeats(req.params.id, seats);
    if (!event) {
      return res.status(409).json({ message: "Not enough seats available" });
    }

    return res.json(event);
  } catch (error) {
    return next(error);
  }
};

module.exports = { create, list, detail, reserve };
