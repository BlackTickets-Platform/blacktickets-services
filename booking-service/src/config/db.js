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
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL,
      event_id INT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
      seats INT NOT NULL CHECK (seats > 0),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE(user_id, event_id, status)
    );
  `;
  await pool.query(query);
};

module.exports = { pool, initDb };
