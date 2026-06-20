const { pool } = require("../config/db");

const createEvent = async (payload) => {
  const query = `
    INSERT INTO events (name, description, venue, date, total_seats, available_seats, poster_url)
    VALUES ($1, $2, $3, $4, $5, $5, $6)
    RETURNING *;
  `;
  const values = [
    payload.name,
    payload.description,
    payload.venue,
    payload.date,
    payload.total_seats,
    payload.poster_url || null
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

const listEvents = async () => {
  const { rows } = await pool.query("SELECT * FROM events ORDER BY date ASC");
  return rows;
};

const getEventById = async (id) => {
  const { rows } = await pool.query("SELECT * FROM events WHERE id = $1", [id]);
  return rows[0] || null;
};

const reserveSeats = async (eventId, seats) => {
  const query = `
    UPDATE events
    SET available_seats = available_seats - $2
    WHERE id = $1 AND available_seats >= $2
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [eventId, seats]);
  return rows[0] || null;
};

module.exports = { createEvent, listEvents, getEventById, reserveSeats };
