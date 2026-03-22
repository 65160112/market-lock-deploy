const Payment = require("../models/paymentModel");
const Booking = require("../models/bookingModel");
const MarketLock = require("../models/marketLockModel");
const multer = require("multer");
const path = require("path");

// ตั้งค่า multer สำหรับอัปโหลดสลิป
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/slips/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `slip_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("อนุญาตเฉพาะไฟล์รูปภาพเท่านั้น"));
    }
    cb(null, true);
  },
});

const paymentController = {
  uploadSlip: upload.single("slip"),

  // GET /payments — Admin: ทั้งหมด, User: ของตัวเอง
  async getAllPayments(req, res) {
    try {
      if (req.user.role === "admin") {
        const payments = await Payment.findAll();
        return res.json(payments);
      }
      // ดึงการจองของ user แล้วหา payment
      const bookings = await Booking.findByUser(req.user.id);
      const bookingIds = bookings.map((b) => b.id);
      const allPayments = await Payment.findAll();
      const myPayments = allPayments.filter((p) =>
        bookingIds.includes(p.booking_id)
      );
      res.json(myPayments);
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },

  // GET /payments/pending — Admin only
  async getPendingPayments(req, res) {
    try {
      const payments = await Payment.getPendingPayments();
      res.json(payments);
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },

  // GET /payments/:id
  async getPaymentById(req, res) {
    try {
      const payment = await Payment.findById(req.params.id);
      if (!payment) return res.status(404).json({ message: "ไม่พบการชำระเงิน" });
      res.json(payment);
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },

  // POST /payments — แนบสลิปโอนเงิน
  async submitPayment(req, res) {
    try {
      const { booking_id, bank_name, transferred_at } = req.body;

      if (!booking_id || !bank_name || !transferred_at) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });
      }

      const booking = await Booking.findById(booking_id);
      if (!booking) return res.status(404).json({ message: "ไม่พบการจอง" });

      if (
        req.user.role !== "admin" &&
        booking.user_id !== req.user.id
      ) {
        return res.status(403).json({ message: "ไม่มีสิทธิ์ชำระเงินการจองนี้" });
      }

      const existing = await Payment.findByBooking(booking_id);
      if (existing) {
        return res.status(409).json({ message: "การจองนี้มีการแนบสลิปแล้ว" });
      }

      const slip_image = req.file ? req.file.filename : null;
      if (!slip_image) {
        return res.status(400).json({ message: "กรุณาแนบสลิปการโอนเงิน" });
      }

      const paymentId = await Payment.create({
        booking_id,
        amount: booking.total_price,
        slip_image,
        bank_name,
        transferred_at,
      });

      res.status(201).json({
        message: "ส่งสลิปการชำระเงินสำเร็จ รอการตรวจสอบ",
        payment_id: paymentId,
      });
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },

  // PATCH /payments/:id/verify — Admin only
  async verifyPayment(req, res) {
    try {
      const { status, admin_note } = req.body; // 'approved' | 'rejected'
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "สถานะไม่ถูกต้อง" });
      }

      const payment = await Payment.findById(req.params.id);
      if (!payment) return res.status(404).json({ message: "ไม่พบการชำระเงิน" });

      await Payment.updateStatus(req.params.id, status, admin_note);

      if (status === "approved") {
        await Booking.updateStatus(payment.booking_id, "confirmed");
        const booking = await Booking.findById(payment.booking_id);
        await MarketLock.updateStatus(
          booking.lock_id,
          "occupied",
          booking.user_id
        );
      } else if (status === "rejected") {
        await Booking.updateStatus(payment.booking_id, "cancelled");
        const booking = await Booking.findById(payment.booking_id);
        await MarketLock.updateStatus(booking.lock_id, "available", null);
      }

      res.json({ message: `ยืนยันการชำระเงิน: ${status}` });
    } catch (err) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
  },
};

module.exports = paymentController;