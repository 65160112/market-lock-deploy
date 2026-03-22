const bookingController = require('../controllers/bookingController');
const Booking = require('../models/bookingModel');
const MarketLock = require('../models/marketLockModel');

jest.mock('../models/bookingModel');
jest.mock('../models/marketLockModel');

describe('bookingController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, user: { id: 1, role: 'tenant' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  describe('getAllBookings', () => {
    test('admin ดูได้ทั้งหมด', async () => {
      req.user.role = 'admin';
      Booking.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      await bookingController.getAllBookings(req, res);
      expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
    });

    test('user ดูได้เฉพาะของตัวเอง', async () => {
      req.user.role = 'tenant';
      Booking.findByUser.mockResolvedValue([{ id: 1 }]);
      await bookingController.getAllBookings(req, res);
      expect(Booking.findByUser).toHaveBeenCalledWith(1);
    });

    test('error ให้ 500', async () => {
      req.user.role = 'admin';
      Booking.findAll.mockRejectedValue(new Error('db error'));
      await bookingController.getAllBookings(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getStats', () => {
    test('ดึง stats สำเร็จ', async () => {
      Booking.getStats.mockResolvedValue({ total_bookings: 5 });
      Booking.getMonthlyRevenue.mockResolvedValue([]);
      await bookingController.getStats(req, res);
      expect(res.json).toHaveBeenCalledWith({ stats: { total_bookings: 5 }, monthly: [] });
    });
  });

  describe('getBookingById', () => {
    test('ไม่พบการจอง ได้ 404', async () => {
      req.params.id = '99';
      Booking.findById.mockResolvedValue(null);
      await bookingController.getBookingById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('ไม่ใช่เจ้าของและไม่ใช่ admin ได้ 403', async () => {
      req.params.id = '1';
      req.user = { id: 2, role: 'tenant' };
      Booking.findById.mockResolvedValue({ id: 1, user_id: 5 });
      await bookingController.getBookingById(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('เจ้าของดูได้', async () => {
      req.params.id = '1';
      req.user = { id: 5, role: 'tenant' };
      Booking.findById.mockResolvedValue({ id: 1, user_id: 5 });
      await bookingController.getBookingById(req, res);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('createBooking', () => {
    test('ข้อมูลไม่ครบ ได้ 400', async () => {
      req.body = { lock_id: 1 };
      await bookingController.createBooking(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('ล็อคไม่มีในระบบ ได้ 404', async () => {
      req.body = { lock_id: 99, start_date: '2025-01-01', end_date: '2025-03-01' };
      MarketLock.findById.mockResolvedValue(null);
      await bookingController.createBooking(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('ล็อคไม่ว่าง ได้ 409', async () => {
      req.body = { lock_id: 1, start_date: '2025-01-01', end_date: '2025-03-01' };
      MarketLock.findById.mockResolvedValue({ id: 1, status: 'occupied', price_per_month: 1500 });
      await bookingController.createBooking(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    test('จองสำเร็จ ได้ 201', async () => {
      req.body = { lock_id: 1, start_date: '2025-01-01', end_date: '2025-03-01', note: '' };
      MarketLock.findById.mockResolvedValue({ id: 1, status: 'available', price_per_month: 1500 });
      Booking.create.mockResolvedValue(10);
      MarketLock.updateStatus.mockResolvedValue();
      await bookingController.createBooking(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateBookingStatus', () => {
    test('status ไม่ถูกต้อง ได้ 400', async () => {
      req.params.id = '1';
      req.body = { status: 'unknown' };
      await bookingController.updateBookingStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('ไม่พบ booking ได้ 404', async () => {
      req.params.id = '99';
      req.body = { status: 'confirmed' };
      Booking.findById.mockResolvedValue(null);
      await bookingController.updateBookingStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('อัปเดตสถานะ confirmed สำเร็จ', async () => {
      req.params.id = '1';
      req.body = { status: 'confirmed' };
      Booking.findById.mockResolvedValue({ id: 1, lock_id: 2, user_id: 3 });
      Booking.updateStatus.mockResolvedValue();
      MarketLock.updateStatus.mockResolvedValue();
      await bookingController.updateBookingStatus(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'อัปเดตสถานะการจองสำเร็จ' });
    });

    test('อัปเดตสถานะ cancelled คืนสถานะล็อคเป็น available', async () => {
      req.params.id = '1';
      req.body = { status: 'cancelled' };
      Booking.findById.mockResolvedValue({ id: 1, lock_id: 2, user_id: 3 });
      Booking.updateStatus.mockResolvedValue();
      MarketLock.updateStatus.mockResolvedValue();
      await bookingController.updateBookingStatus(req, res);
      expect(MarketLock.updateStatus).toHaveBeenCalledWith(2, 'available', null);
    });
  });

  describe('cancelBooking', () => {
    test('ไม่พบ booking ได้ 404', async () => {
      req.params.id = '99';
      Booking.findById.mockResolvedValue(null);
      await bookingController.cancelBooking(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('ไม่ใช่เจ้าของ ได้ 403', async () => {
      req.params.id = '1';
      req.user = { id: 2, role: 'tenant' };
      Booking.findById.mockResolvedValue({ id: 1, user_id: 5, lock_id: 1 });
      await bookingController.cancelBooking(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('ยกเลิกสำเร็จ', async () => {
      req.params.id = '1';
      req.user = { id: 5, role: 'tenant' };
      Booking.findById.mockResolvedValue({ id: 1, user_id: 5, lock_id: 2 });
      Booking.updateStatus.mockResolvedValue();
      MarketLock.updateStatus.mockResolvedValue();
      await bookingController.cancelBooking(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'ยกเลิกการจองสำเร็จ' });
    });
  });
});