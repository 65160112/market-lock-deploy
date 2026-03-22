const db = require("../config/database");

const MarketLock = {
  async findAll() {
    const [rows] = await db.query(`
      SELECT ml.*, u.full_name AS zone_owner_name
      FROM market_locks ml
      LEFT JOIN app_users u ON ml.owner_id = u.id
      ORDER BY ml.zone, ml.lock_number
    `);
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      "SELECT * FROM market_locks WHERE id = ?",
      [id]
    );
    return rows[0];
  },

  async findByStatus(status) {
    const [rows] = await db.query(
      "SELECT * FROM market_locks WHERE status = ?",
      [status]
    );
    return rows;
  },

  async create({ zone, lock_number, size, price_per_month, description }) {
    const [result] = await db.query(
      `INSERT INTO market_locks (zone, lock_number, size, price_per_month, description, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'available', NOW())`,
      [zone, lock_number, size, price_per_month, description]
    );
    return result.insertId;
  },

  async updateStatus(id, status, owner_id = null) {
    await db.query(
      "UPDATE market_locks SET status = ?, owner_id = ? WHERE id = ?",
      [status, owner_id, id]
    );
  },

  async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((k) => `${k} = ?`).join(", ");
    await db.query(`UPDATE market_locks SET ${setClause} WHERE id = ?`, [
      ...values,
      id,
    ]);
  },

  async delete(id) {
    await db.query("DELETE FROM market_locks WHERE id = ?", [id]);
  },

  async getMapLayout() {
    const [rows] = await db.query(`
      SELECT id, zone, lock_number, size, status, price_per_month
      FROM market_locks
      ORDER BY zone, lock_number
    `);
    return rows;
  },
};

module.exports = MarketLock;