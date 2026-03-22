const db = require('../config/database');

jest.mock('../config/database');

const AppUser    = require('../models/appUserModel');
const Booking    = require('../models/bookingModel');
const MarketLock = require('../models/marketLockModel');
const Payment    = require('../models/paymentModel');

describe('Models', () => {

  beforeEach(() => jest.clearAllMocks());

  // ─── AppUser Model ────────────────────────────────────

  describe('AppUser', () => {
    test('findById — คืนค่า user', async () => {
      db.query.mockResolvedValue([[{ id: 1, username: 'john' }]]);
      const result = await AppUser.findById(1);
      expect(result).toEqual({ id: 1, username: 'john' });
    });

    test('findByEmail — คืนค่า user', async () => {
      db.query.mockResolvedValue([[{ id: 1, email: 'john@test.com' }]]);
      const result = await AppUser.findByEmail('john@test.com');
      expect(result).toEqual({ id: 1, email: 'john@test.com' });
    });

    test('findByUsername — คืนค่า user', async () => {
      db.query.mockResolvedValue([[{ id: 1, username: 'john' }]]);
      const result = await AppUser.findByUsername('john');
      expect(result).toEqual({ id: 1, username: 'john' });
    });

    test('create — คืน insertId', async () => {
      db.query.mockResolvedValue([{ insertId: 5 }]);
      const id = await AppUser.create({ username: 'john', email: 'j@j.com', password: 'h', role: 'tenant', full_name: 'John', phone: '08' });
      expect(id).toBe(5);
    });

    test('update — เรียก query สำเร็จ', async () => {
      db.query.mockResolvedValue([{}]);
      await expect(AppUser.update(1, { full_name: 'New' })).resolves.not.toThrow();
    });

    test('delete — เรียก query สำเร็จ', async () => {
      db.query.mockResolvedValue([{}]);
      await expect(AppUser.delete(1)).resolves.not.toThrow();
    });

    test('findAll — คืน array', async () => {
      db.query.mockResolvedValue([[{ id: 1 }, { id: 2 }]]);
      const result = await AppUser.findAll();
      expect(result).toHaveLength(2);
    });
  });

  // ─── Booking Model ────────────────────────────────────

  describe('Booking', () => {
    test('findAll — คืน array', async () => {
      db.query.mockResolvedValue([[{ id: 1 }, { id: 2 }]]);
      const result = await Booking.findAll();
      expect(result).toHaveLength(2);
    });

    test('findById — คืนค่า booking', async () => {
      db.query.mockResolvedValue([[{ id: 1, user_id: 3 }]]);
      const result = await Booking.findById(1);
      expect(result).toEqual({ id: 1, user_id: 3 });
    });

    test('findByUser — คืน array', async () => {
      db.query.mockResolvedValue([[{ id: 1 }, { id: 2 }]]);
      const result = await Booking.findByUser(3);
      expect(result).toHaveLength(2);
    });

    test('create — คืน insertId', async () => {
      db.query.mockResolvedValue([{ insertId: 10 }]);
      const id = await Booking.create({ user_id: 1, lock_id: 2, start_date: '2025-01-01', end_date: '2025-03-01', total_price: 3000, note: '' });
      expect(id).toBe(10);
    });

    test('updateStatus — เรียก query สำเร็จ', async () => {
      db.query.mockResolvedValue([{}]);
      await expect(Booking.updateStatus(1, 'confirmed')).resolves.not.toThrow();
    });

    test('delete — เรียก query สำเร็จ', async () => {
      db.query.mockResolvedValue([{}]);
      await expect(Booking.delete(1)).resolves.not.toThrow();
    });

    test('getStats — คืน stats object', async () => {
      db.query.mockResolvedValue([[{ total_bookings: 5, confirmed: 3, pending: 1, cancelled: 1, total_revenue: 9000 }]]);
      const result = await Booking.getStats();
      expect(result.total_bookings).toBe(5);
    });

    test('getMonthlyRevenue — คืน array', async () => {
      db.query.mockResolvedValue([[{ month: '2025-01', revenue: 3000, bookings_count: 2 }]]);
      const result = await Booking.getMonthlyRevenue();
      expect(result).toHaveLength(1);
    });
  });

  // ─── MarketLock Model ─────────────────────────────────

  describe('MarketLock', () => {
    test('findAll — คืน array', async () => {
      db.query.mockResolvedValue([[{ id: 1 }, { id: 2 }]]);
      const result = await MarketLock.findAll();
      expect(result).toHaveLength(2);
    });

    test('findById — คืนค่า lock', async () => {
      db.query.mockResolvedValue([[{ id: 1, zone: 'A' }]]);
      const result = await MarketLock.findById(1);
      expect(result).toEqual({ id: 1, zone: 'A' });
    });

    test('findByStatus — คืน array', async () => {
      db.query.mockResolvedValue([[{ id: 1, status: 'available' }]]);
      const result = await MarketLock.findByStatus('available');
      expect(result).toHaveLength(1);
    });

    test('create — คืน insertId', async () => {
      db.query.mockResolvedValue([{ insertId: 3 }]);
      const id = await MarketLock.create({ zone: 'A', lock_number: '01', size: '2x3', price_per_month: 1500, description: '' });
      expect(id).toBe(3);
    });

    test('updateStatus — เรียก query สำเร็จ', async () => {
      db.query.mockResolvedValue([{}]);
      await expect(MarketLock.updateStatus(1, 'occupied', 5)).resolves.not.toThrow();
    });

    test('update — เรียก query สำเร็จ', async () => {
      db.query.mockResolvedValue([{}]);
      await expect(MarketLock.update(1, { price_per_month: 2000 })).resolves.not.toThrow();
    });

    test('delete — เรียก query สำเร็จ', async () => {
      db.query.mockResolvedValue([{}]);
      await expect(MarketLock.delete(1)).resolves.not.toThrow();
    });

    test('getMapLayout — คืน array', async () => {
      db.query.mockResolvedValue([[{ id: 1, zone: 'A', lock_number: '01', status: 'available' }]]);
      const result = await MarketLock.getMapLayout();
      expect(result).toHaveLength(1);
    });
  });

  // ─── Payment Model ────────────────────────────────────

  describe('Payment', () => {
    test('findAll — คืน array', async () => {
      db.query.mockResolvedValue([[{ id: 1 }, { id: 2 }]]);
      const result = await Payment.findAll();
      expect(result).toHaveLength(2);
    });

    test('findById — คืนค่า payment', async () => {
      db.query.mockResolvedValue([[{ id: 1, amount: 1500 }]]);
      const result = await Payment.findById(1);
      expect(result).toEqual({ id: 1, amount: 1500 });
    });

    test('findByBooking — คืนค่า payment', async () => {
      db.query.mockResolvedValue([[{ id: 1, booking_id: 5 }]]);
      const result = await Payment.findByBooking(5);
      expect(result).toEqual({ id: 1, booking_id: 5 });
    });

    test('create — คืน insertId', async () => {
      db.query.mockResolvedValue([{ insertId: 7 }]);
      const id = await Payment.create({ booking_id: 1, amount: 1500, slip_image: 'slip.jpg', bank_name: 'กสิกร', transferred_at: '2025-01-01' });
      expect(id).toBe(7);
    });

    test('updateStatus — เรียก query สำเร็จ', async () => {
      db.query.mockResolvedValue([{}]);
      await expect(Payment.updateStatus(1, 'approved', 'โอนแล้ว')).resolves.not.toThrow();
    });

    test('getPendingPayments — คืน array', async () => {
      db.query.mockResolvedValue([[{ id: 1, status: 'pending' }]]);
      const result = await Payment.getPendingPayments();
      expect(result).toHaveLength(1);
    });
  });
});