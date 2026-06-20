const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined
});

const initDb = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      venue VARCHAR(255) NOT NULL,
      date TIMESTAMP NOT NULL,
      total_seats INT NOT NULL CHECK (total_seats > 0),
      available_seats INT NOT NULL CHECK (available_seats >= 0)
    );
  `;
  await pool.query(query);
  await pool.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS poster_url TEXT");

  const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM events");
  if (rows[0].count > 0) {
    return;
  }

  const sampleEvents = [
    {
      name: "Tech Conference 2026",
      description: "Annual technology conference featuring latest innovations",
      venue: "Convention Center",
      date: "2026-06-15T09:00:00Z",
      totalSeats: 500,
      availableSeats: 450
    },
    {
      name: "Music Festival",
      description: "Summer music festival with multiple artists",
      venue: "Central Park",
      date: "2026-07-20T18:00:00Z",
      totalSeats: 1000,
      availableSeats: 800
    },
    {
      name: "Business Summit",
      description: "Executive business networking event",
      venue: "Grand Hotel",
      date: "2026-08-10T08:30:00Z",
      totalSeats: 200,
      availableSeats: 150
    },
    {
      name: "Sports Championship",
      description: "National sports championship finals",
      venue: "Sports Arena",
      date: "2026-08-20T08:30:00Z",
      totalSeats: 200,
      availableSeats: 150
    },
    {
      name: "Comedy Night",
      description: "Stand-up comedy show with top comedians",
      venue: "Comedy Club",
      date: "2026-09-05T20:00:00Z",
      totalSeats: 300,
      availableSeats: 280
    },
    {
      name: "Food & Wine Expo",
      description: "Culinary extravaganza with top chefs",
      venue: "Exhibition Center",
      date: "2026-10-15T12:00:00Z",
      totalSeats: 1500,
      availableSeats: 1200
    }
  ];

  for (const item of sampleEvents) {
    await pool.query(
      `INSERT INTO events (name, description, venue, date, total_seats, available_seats)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [item.name, item.description, item.venue, item.date, item.totalSeats, item.availableSeats]
    );
  }
};

module.exports = { pool, initDb };
