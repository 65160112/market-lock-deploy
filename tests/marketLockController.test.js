const marketLockController = require('../controllers/marketLockController');
const MarketLock = require('../models/marketLockModel');

jest.mock('../models/marketLockModel');

describe('marketLockController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, user: { id: 1, role: 'admin' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  describe('getAllLocks', () => {
    test('ดึงล็อคทั้งหมดสำเร็จ', async () => {
      MarketLock.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      await marketLockController.getAllLocks(req, res);
      expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
    });

    test('error ได้ 500', async () => {
      MarketLock.findAll.mockRejectedValue(new Error('db error'));
      await marketLockController.getAllLocks(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getMapLayout', () => {
    test('ดึง map layout สำเร็จ', async () => {
      MarketLock.getMapLayout.mockResolvedValue([{ id: 1, zone: 'A' }]);
      await marketLockController.getMapLayout(req, res);
      expect(res.json).toHaveBeenCalledWith([{ id: 1, zone: 'A' }]);
    });
  });

  describe('getLockById', () => {
    test('ไม่พบล็อค ได้ 404', async () => {
      req.params.id = '99';
      MarketLock.findById.mockResolvedValue(null);
      await marketLockController.getLockById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('พบล็อค ได้ข้อมูล', async () => {
      req.params.id = '1';
      MarketLock.findById.mockResolvedValue({ id: 1, zone: 'A' });
      await marketLockController.getLockById(req, res);
      expect(res.json).toHaveBeenCalledWith({ id: 1, zone: 'A' });
    });
  });

  describe('createLock', () => {
    test('ข้อมูลไม่ครบ ได้ 400', async () => {
      req.body = { zone: 'A' };
      await marketLockController.createLock(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('สร้างล็อคสำเร็จ ได้ 201', async () => {
      req.body = { zone: 'A', lock_number: '01', price_per_month: 1500 };
      MarketLock.create.mockResolvedValue(5);
      await marketLockController.createLock(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'สร้างล็อคสำเร็จ', id: 5 });
    });
  });

  describe('updateLock', () => {
    test('อัปเดตล็อคสำเร็จ', async () => {
      req.params.id = '1';
      req.body = { price_per_month: 2000 };
      MarketLock.update.mockResolvedValue();
      await marketLockController.updateLock(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'อัปเดตล็อคสำเร็จ' });
    });
  });

  describe('deleteLock', () => {
    test('ลบล็อคสำเร็จ', async () => {
      req.params.id = '1';
      MarketLock.delete.mockResolvedValue();
      await marketLockController.deleteLock(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'ลบล็อคสำเร็จ' });
    });

    test('error ได้ 500', async () => {
      req.params.id = '1';
      MarketLock.delete.mockRejectedValue(new Error('db error'));
      await marketLockController.deleteLock(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});