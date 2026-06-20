const { pool } = require("../config/db");

const createBooking = async ({ userId, eventId, seats, status = "confirmed" }) => {
  const query = `
    INSERT INTO bookings (user_id, event_id, status, seats)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const { rows } = await pool.query(query, [userId, eventId, status, seats]);
  return rows[0];
};

const listBookingsByUserId = async (userId) => {
  const { rows } = await pool.query(
    "SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return rows;
};

const getBookingById = async (id, userId) => {
  const { rows } = await pool.query(
    "SELECT * FROM bookings WHERE id = $1 AND user_id = $2",
    [id, userId]
  );
  return rows[0] || null;
};

const hasActiveBooking = async (userId, eventId) => {
  const { rows } = await pool.query(
    "SELECT id FROM bookings WHERE user_id = $1 AND event_id = $2 AND status = 'confirmed'",
    [userId, eventId]
  );
  return rows.length > 0;
};

module.exports = { createBooking, listBookingsByUserId, getBookingById, hasActiveBooking };
