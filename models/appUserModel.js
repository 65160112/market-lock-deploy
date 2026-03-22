const db = require("../config/database");

const AppUser = {
  async findById(id) {
    const [rows] = await db.query("SELECT * FROM app_users WHERE id = ?", [id]);
    return rows[0];
  },

  async findByEmail(email) {
    const [rows] = await db.query(
      "SELECT * FROM app_users WHERE email = ?",
      [email]
    );
    return rows[0];
  },

  async findByUsername(username) {
    const [rows] = await db.query(
      "SELECT * FROM app_users WHERE username = ?",
      [username]
    );
    return rows[0];
  },

  async create({ username, email, password, role, full_name, phone }) {
    const [result] = await db.query(
      `INSERT INTO app_users (username, email, password, role, full_name, phone, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [username, email, password, role, full_name, phone]
    );
    return result.insertId;
  },

  async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    await db.query(`UPDATE app_users SET ${setClause} WHERE id = ?`, [
      ...values,
      id,
    ]);
  },

  async delete(id) {
    await db.query("DELETE FROM app_users WHERE id = ?", [id]);
  },

  async findAll() {
    const [rows] = await db.query(
      "SELECT id, username, email, role, full_name, phone, created_at FROM app_users ORDER BY created_at DESC"
    );
    return rows;
  },
};

module.exports = AppUser;