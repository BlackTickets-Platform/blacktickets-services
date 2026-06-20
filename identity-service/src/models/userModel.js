const { pool } = require("../config/db");

const createUser = async ({ email, passwordHash, name, role = "user" }) => {
  const query = `
    INSERT INTO users (email, password_hash, name, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, name, role, created_at;
  `;
  const { rows } = await pool.query(query, [email, passwordHash, name, role]);
  return rows[0];
};

const findUserByEmail = async (email) => {
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return rows[0] || null;
};

const findUserById = async (id) => {
  const query = "SELECT id, email, name, role, created_at FROM users WHERE id = $1";
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
};

const updateUserProfile = async (id, { name }) => {
  const query = `
    UPDATE users
    SET name = COALESCE($2, name)
    WHERE id = $1
    RETURNING id, email, name, role, created_at;
  `;
  const { rows } = await pool.query(query, [id, name]);
  return rows[0] || null;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserProfile
};
