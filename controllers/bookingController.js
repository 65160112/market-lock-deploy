const Booking = require("../models/bookingModel");
const MarketLock = require("../models/marketLockModel");

const bookingController = {
  // GET /bookings — Admin: ดูทั้งหมด / User: ดูของตัวเอง
  async getAllBookings(req, res) {
    try {
      if (req.user.role === "admin" || req.user.role === "manager") {
        const bookings = await Booking.findAll();
        return res.json(bookings);
      }
      const bookings = await Booking.findByUser(req.user.id);
      res.json(bookings);
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },

  // GET /bookings/stats — Admin only
  async getStats(req, res) {
    try {
      const stats = await Booking.getStats();
      const monthly = await Booking.getMonthlyRevenue();
      res.json({ stats, monthly });
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },

  // GET /bookings/:id
  async getBookingById(req, res) {
    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) return res.status(404).json({ message: "ไม่พบการจอง" });

      // ตรวจสิทธิ์ ไม่ใช่เจ้าของหรือ admin
      if (
        req.user.role !== "admin" &&
        booking.user_id !== req.user.id
      ) {
        return res.status(403).json({ message: "ไม่มีสิทธิ์ดูข้อมูลนี้" });
      }

      res.json(booking);
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },

  // POST /bookings — สร้างการจอง
  async createBooking(req, res) {
    try {
      const { lock_id, start_date, end_date, note } = req.body;

      if (!lock_id || !start_date || !end_date) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
      }

      const lock = await MarketLock.findById(lock_id);
      if (!lock) return res.status(404).json({ message: "ไม่พบล็อคที่ต้องการ" });
      if (lock.status !== "available") {
        return res.status(409).json({ message: "ล็อคนี้ไม่ว่างในขณะนี้" });
      }

      // คำนวณราคา (เดือน)
      const start = new Date(start_date);
      const end = new Date(end_date);
      const months =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());
      const totalMonths = months <= 0 ? 1 : months;
      const total_price = totalMonths * lock.price_per_month;

      const bookingId = await Booking.create({
        user_id: req.user.id,
        lock_id,
        start_date,
        end_date,
        total_price,
        note,
      });

      // เปลี่ยนสถานะล็อคเป็น pending
      await MarketLock.updateStatus(lock_id, "pending");

      res.status(201).json({
        message: "จองล็อคสำเร็จ รอชำระเงิน",
        booking_id: bookingId,
        total_price,
      });
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },

  // PATCH /bookings/:id/status — Admin/Manager only
  async updateBookingStatus(req, res) {
    try {
      const { status } = req.body;
      const validStatuses = ["confirmed", "approved", "rejected", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "สถานะไม่ถูกต้อง" });
      }

      const booking = await Booking.findById(req.params.id);
      if (!booking) return res.status(404).json({ message: "ไม่พบการจอง" });

      await Booking.updateStatus(req.params.id, status, req.user.id);

      // อัปเดตสถานะล็อค
      if (status === "confirmed") {
        await MarketLock.updateStatus(booking.lock_id, "occupied", booking.user_id);
      } else if (status === "cancelled") {
        await MarketLock.updateStatus(booking.lock_id, "available", null);
      }

      res.json({ message: "อัปเดตสถานะการจองสำเร็จ" });
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },

  // DELETE /bookings/:id — ยกเลิกการจอง (เจ้าของหรือ admin)
  async cancelBooking(req, res) {
    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) return res.status(404).json({ message: "ไม่พบการจอง" });

      if (
        req.user.role !== "admin" &&
        booking.user_id !== req.user.id
      ) {
        return res.status(403).json({ message: "ไม่มีสิทธิ์ยกเลิกการจองนี้" });
      }

      await Booking.updateStatus(req.params.id, "cancelled");
      await MarketLock.updateStatus(booking.lock_id, "available", null);

      res.json({ message: "ยกเลิกการจองสำเร็จ" });
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },
};

module.exports = bookingController;