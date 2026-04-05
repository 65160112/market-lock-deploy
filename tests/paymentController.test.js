const paymentController = require('../controllers/paymentController');
const Payment = require('../models/paymentModel');
const Booking = require('../models/bookingModel');
const MarketLock = require('../models/marketLockModel');

jest.mock('../models/paymentModel');
jest.mock('../models/bookingModel');
jest.mock('../models/marketLockModel');

describe('paymentController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, user: { id: 1, role: 'vendor' }, file: null };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  // ─── getAllPayments ────────────────────────────────────

  describe('getAllPayments', () => {
    test('admin ดูได้ทั้งหมด', async () => {
      req.user.role = 'admin';
      Payment.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      await paymentController.getAllPayments(req, res);
      expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
    });

    test('user ดูได้เฉพาะของตัวเอง', async () => {
      req.user = { id: 3, role: 'vendor' };
      Booking.findByUser.mockResolvedValue([{ id: 10 }, { id: 11 }]);
      Payment.findAll.mockResolvedValue([
        { id: 1, booking_id: 10 },
        { id: 2, booking_id: 99 },
      ]);
      await paymentController.getAllPayments(req, res);
      const result = res.json.mock.calls[0][0];
      expect(result).toHaveLength(1);
      expect(result[0].booking_id).toBe(10);
    });

    test('error ได้ 500', async () => {
      req.user.role = 'admin';
      Payment.findAll.mockRejectedValue(new Error('db error'));
      await paymentController.getAllPayments(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── getPendingPayments ───────────────────────────────

  describe('getPendingPayments', () => {
    test('ดึง pending payments สำเร็จ', async () => {
      Payment.getPendingPayments.mockResolvedValue([{ id: 1, status: 'pending' }]);
      await paymentController.getPendingPayments(req, res);
      expect(res.json).toHaveBeenCalledWith([{ id: 1, status: 'pending' }]);
    });

    test('error ได้ 500', async () => {
      Payment.getPendingPayments.mockRejectedValue(new Error('db error'));
      await paymentController.getPendingPayments(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── getPaymentById ───────────────────────────────────

  describe('getPaymentById', () => {
    test('ไม่พบ payment ได้ 404', async () => {
      req.params.id = '99';
      Payment.findById.mockResolvedValue(null);
      await paymentController.getPaymentById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('พบ payment ได้ข้อมูล', async () => {
      req.params.id = '1';
      Payment.findById.mockResolvedValue({ id: 1, amount: 1500 });
      await paymentController.getPaymentById(req, res);
      expect(res.json).toHaveBeenCalledWith({ id: 1, amount: 1500 });
    });

    test('error ได้ 500', async () => {
      req.params.id = '1';
      Payment.findById.mockRejectedValue(new Error('db error'));
      await paymentController.getPaymentById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── submitPayment ────────────────────────────────────

  describe('submitPayment', () => {
    test('ข้อมูลไม่ครบ ได้ 400', async () => {
      req.body = { booking_id: 1 };
      await paymentController.submitPayment(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('ไม่พบ booking ได้ 404', async () => {
      req.body = { booking_id: 99, bank_name: 'กสิกร', transferred_at: '2025-01-01 10:00:00' };
      Booking.findById.mockResolvedValue(null);
      await paymentController.submitPayment(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('ไม่ใช่เจ้าของ booking ได้ 403', async () => {
      req.user = { id: 2, role: 'vendor' };
      req.body = { booking_id: 1, bank_name: 'กสิกร', transferred_at: '2025-01-01 10:00:00' };
      Booking.findById.mockResolvedValue({ id: 1, user_id: 5, total_price: 1500 });
      await paymentController.submitPayment(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('มีการแนบสลิปแล้ว ได้ 409', async () => {
      req.user = { id: 5, role: 'vendor' };
      req.body = { booking_id: 1, bank_name: 'กสิกร', transferred_at: '2025-01-01 10:00:00' };
      Booking.findById.mockResolvedValue({ id: 1, user_id: 5, total_price: 1500 });
      Payment.findByBooking.mockResolvedValue({ id: 1 });
      await paymentController.submitPayment(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    test('ไม่แนบสลิป ได้ 400', async () => {
      req.user = { id: 5, role: 'vendor' };
      req.body = { booking_id: 1, bank_name: 'กสิกร', transferred_at: '2025-01-01 10:00:00' };
      req.file = null;
      Booking.findById.mockResolvedValue({ id: 1, user_id: 5, total_price: 1500 });
      Payment.findByBooking.mockResolvedValue(null);
      await paymentController.submitPayment(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'กรุณาแนบสลิปการโอนเงิน' }));
    });

    test('ส่งสลิปสำเร็จ ได้ 201', async () => {
      req.user = { id: 5, role: 'vendor' };
      req.body = { booking_id: 1, bank_name: 'กสิกร', transferred_at: '2025-01-01 10:00:00' };
      req.file = { filename: 'slip_123.jpg' };
      Booking.findById.mockResolvedValue({ id: 1, user_id: 5, total_price: 1500 });
      Payment.findByBooking.mockResolvedValue(null);
      Payment.create.mockResolvedValue(7);
      await paymentController.submitPayment(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ payment_id: 7 }));
    });

    test('error ได้ 500', async () => {
      req.body = { booking_id: 1, bank_name: 'กสิกร', transferred_at: '2025-01-01 10:00:00' };
      Booking.findById.mockRejectedValue(new Error('db error'));
      await paymentController.submitPayment(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── verifyPayment ────────────────────────────────────

  describe('verifyPayment', () => {
    test('status ไม่ถูกต้อง ได้ 400', async () => {
      req.params.id = '1';
      req.body = { status: 'unknown' };
      await paymentController.verifyPayment(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('ไม่พบ payment ได้ 404', async () => {
      req.params.id = '99';
      req.body = { status: 'approved' };
      Payment.findById.mockResolvedValue(null);
      await paymentController.verifyPayment(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('อนุมัติสำเร็จ booking เป็น confirmed ล็อคเป็น occupied', async () => {
      req.params.id = '1';
      req.body = { status: 'approved', admin_note: 'โอนแล้ว' };
      Payment.findById.mockResolvedValue({ id: 1, booking_id: 10 });
      Payment.updateStatus.mockResolvedValue();
      Booking.updateStatus.mockResolvedValue();
      Booking.findById.mockResolvedValue({ id: 10, lock_id: 3, user_id: 5 });
      MarketLock.updateStatus.mockResolvedValue();
      await paymentController.verifyPayment(req, res);
      expect(Booking.updateStatus).toHaveBeenCalledWith(10, 'confirmed');
      expect(MarketLock.updateStatus).toHaveBeenCalledWith(3, 'occupied', 5);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'ยืนยันการชำระเงิน: approved' }));
    });

    test('ปฏิเสธสำเร็จ booking เป็น cancelled ล็อคเป็น available', async () => {
      req.params.id = '1';
      req.body = { status: 'rejected', admin_note: 'สลิปไม่ชัด' };
      Payment.findById.mockResolvedValue({ id: 1, booking_id: 10 });
      Payment.updateStatus.mockResolvedValue();
      Booking.updateStatus.mockResolvedValue();
      Booking.findById.mockResolvedValue({ id: 10, lock_id: 3, user_id: 5 });
      MarketLock.updateStatus.mockResolvedValue();
      await paymentController.verifyPayment(req, res);
      expect(Booking.updateStatus).toHaveBeenCalledWith(10, 'cancelled');
      expect(MarketLock.updateStatus).toHaveBeenCalledWith(3, 'available', null);
    });

    test('error ได้ 500', async () => {
      req.params.id = '1';
      req.body = { status: 'approved' };
      Payment.findById.mockRejectedValue(new Error('db error'));
      await paymentController.verifyPayment(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});