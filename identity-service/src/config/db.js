const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

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
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  await pool.query(query);

  // Production: Require all environment variables to be set
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const userEmail = process.env.USER_EMAIL;
  const userPassword = process.env.USER_PASSWORD;

  if (!adminEmail || !adminPassword || !userEmail || !userPassword) {
    throw new Error('Missing required environment variables: ADMIN_EMAIL, ADMIN_PASSWORD, USER_EMAIL, USER_PASSWORD');
  }

  const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  const adminHash = await bcrypt.hash(adminPassword, bcryptRounds);
  const userHash = await bcrypt.hash(userPassword, bcryptRounds);

  await pool.query(
    `INSERT INTO users (email, password_hash, name, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO NOTHING`,
    [adminEmail, adminHash, "Default Admin"]
  );

  await pool.query(
    `INSERT INTO users (email, password_hash, name, role)
     VALUES ($1, $2, $3, 'user')
     ON CONFLICT (email) DO NOTHING`,
    [userEmail, userHash, "Default User"]
  );
};

module.exports = { pool, initDb };
