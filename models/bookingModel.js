const db = require("../config/database");

const Booking = {
  async findAll() {
    const [rows] = await db.query(`
      SELECT b.*, 
             u.full_name AS user_name, u.email AS user_email,
             ml.zone, ml.lock_number,
             p.admin_note AS manager_note
      FROM bookings b
      JOIN app_users u ON b.user_id = u.id
      JOIN market_locks ml ON b.lock_id = ml.id
      LEFT JOIN payments p ON b.id = p.booking_id
      ORDER BY b.created_at DESC
    `);
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT b.*, u.full_name AS user_name, ml.zone, ml.lock_number, p.admin_note AS manager_note
       FROM bookings b
       JOIN app_users u ON b.user_id = u.id
       JOIN market_locks ml ON b.lock_id = ml.id
       LEFT JOIN payments p ON b.id = p.booking_id
       WHERE b.id = ?`,
      [id]
    );
    return rows[0];
  },

  async findByUser(user_id) {
    const [rows] = await db.query(
      `SELECT b.*, ml.zone, ml.lock_number, ml.price_per_month, p.admin_note AS manager_note
       FROM bookings b
       JOIN market_locks ml ON b.lock_id = ml.id
       LEFT JOIN payments p ON b.id = p.booking_id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [user_id]
    );
    return rows;
  },

  async create({ user_id, lock_id, start_date, end_date, total_price, note }) {
    const [result] = await db.query(
      `INSERT INTO bookings (user_id, lock_id, start_date, end_date, total_price, note, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [user_id, lock_id, start_date, end_date, total_price, note]
    );
    return result.insertId;
  },

  async updateStatus(id, status) {
    await db.query("UPDATE bookings SET status = ? WHERE id = ?", [
      status,
      id,
    ]);
  },

  async delete(id) {
    await db.query("DELETE FROM bookings WHERE id = ?", [id]);
  },

  async getStats() {
    const [rows] = await db.query(`
      SELECT 
        COUNT(*) AS total_bookings,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
        SUM(CASE WHEN status = 'confirmed' THEN total_price ELSE 0 END) AS total_revenue
      FROM bookings
    `);
    return rows[0];
  },

  async getMonthlyRevenue() {
    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        SUM(total_price) AS revenue,
        COUNT(*) AS bookings_count
      FROM bookings
      WHERE status = 'confirmed'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `);
    return rows;
  },
};

module.exports = Booking;