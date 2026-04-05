const db = require("../config/database");

const Payment = {
  async findAll() {
    const [rows] = await db.query(`
      SELECT p.*, b.user_id, u.full_name AS user_name,
             ml.zone, ml.lock_number
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN app_users u ON b.user_id = u.id
      JOIN market_locks ml ON b.lock_id = ml.id
      ORDER BY p.created_at DESC
    `);
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      "SELECT * FROM payments WHERE id = ?",
      [id]
    );
    return rows[0];
  },

  async findByBooking(booking_id) {
    const [rows] = await db.query(
      "SELECT * FROM payments WHERE booking_id = ?",
      [booking_id]
    );
    return rows[0];
  },

  async create({ booking_id, amount, slip_image, bank_name, transferred_at }) {
    const [result] = await db.query(
      `INSERT INTO payments (booking_id, amount, slip_image, bank_name, transferred_at, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
      [booking_id, amount, slip_image, bank_name, transferred_at]
    );
    return result.insertId;
  },

  async updateStatus(id, status, admin_note = null) {
    await db.query(
      "UPDATE payments SET status = ?, admin_note = ?, verified_at = NOW() WHERE id = ?",
      [status, admin_note, id]
    );
  },

  async getPendingPayments() {
    const [rows] = await db.query(`
      SELECT p.*, b.note AS booking_note, u.full_name AS user_name, ml.zone, ml.lock_number
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN app_users u ON b.user_id = u.id
      JOIN market_locks ml ON b.lock_id = ml.id
      WHERE p.status = 'pending'
      ORDER BY p.created_at ASC
    `);
    return rows;
  },
};

module.exports = Payment;