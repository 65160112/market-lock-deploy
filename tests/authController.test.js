const authController = require('../controllers/authController');
const AppUser = require('../models/appUserModel');
const bcrypt = require('bcrypt');

jest.mock('../models/appUserModel');
jest.mock('bcrypt');

describe('authController', () => {

  let req, res;

  beforeEach(() => {
    req = { body: {}, session: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // ─── REGISTER ───────────────────────────────────────

  describe('register', () => {
    test('TC-U-001: สมัครสมาชิกสำเร็จ', async () => {
      req.body = { username: 'john', email: 'john@test.com', password: '123456', full_name: 'John', phone: '0800000000', role: 'vendor' };
      AppUser.findByEmail.mockResolvedValue(null);
      AppUser.findByUsername.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed');
      AppUser.create.mockResolvedValue(1);

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'สมัครสมาชิกสำเร็จ' }));
    });

    test('TC-U-002: สมัครสมาชิกโดยไม่กรอก full_name', async () => {
      req.body = { username: 'john', email: 'john@test.com', password: '123456' };

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' }));
    });

    test('TC-U-003: อีเมลซ้ำในระบบ', async () => {
      req.body = { username: 'john', email: 'john@test.com', password: '123456', full_name: 'John' };
      AppUser.findByEmail.mockResolvedValue({ id: 1 });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'อีเมลนี้ถูกใช้งานแล้ว' }));
    });

    test('TC-U-004: username ซ้ำในระบบ', async () => {
      req.body = { username: 'john', email: 'john@test.com', password: '123456', full_name: 'John' };
      AppUser.findByEmail.mockResolvedValue(null);
      AppUser.findByUsername.mockResolvedValue({ id: 1 });

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' }));
    });

    test('TC-U-005: role ที่ไม่อนุญาต ให้ default เป็น tenant', async () => {
      req.body = { username: 'john', email: 'john@test.com', password: '123456', full_name: 'John', role: 'admin' };
      AppUser.findByEmail.mockResolvedValue(null);
      AppUser.findByUsername.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed');
      AppUser.create.mockResolvedValue(2);

      await authController.register(req, res);

      expect(AppUser.create).toHaveBeenCalledWith(expect.objectContaining({ role: 'tenant' }));
    });
  });

  // ─── LOGIN ───────────────────────────────────────────

  describe('login', () => {
    test('TC-U-006: login สำเร็จ', async () => {
      req.body = { email: 'john@test.com', password: '123456' };
      const mockUser = { id: 1, email: 'john@test.com', password: 'hashed', role: 'vendor', username: 'john', full_name: 'John' };
      AppUser.findByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      await authController.login(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'เข้าสู่ระบบสำเร็จ' }));
      expect(req.session.user).toBeDefined();
    });

    test('TC-U-007: ไม่กรอก email หรือ password', async () => {
      req.body = { email: '' };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('TC-U-008: email ไม่มีในระบบ', async () => {
      req.body = { email: 'noone@test.com', password: '123456' };
      AppUser.findByEmail.mockResolvedValue(null);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('TC-U-009: password ไม่ถูกต้อง', async () => {
      req.body = { email: 'john@test.com', password: 'wrong' };
      AppUser.findByEmail.mockResolvedValue({ id: 1, password: 'hashed' });
      bcrypt.compare.mockResolvedValue(false);

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  // ─── LOGOUT ──────────────────────────────────────────

  describe('logout', () => {
    test('TC-U-010: logout สำเร็จ', async () => {
      req.session.destroy = jest.fn((cb) => cb(null));
      res.clearCookie = jest.fn();

      await authController.logout(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'ออกจากระบบสำเร็จ' }));
    });

    test('TC-U-011: logout ล้มเหลว session error', async () => {
      req.session.destroy = jest.fn((cb) => cb(new Error('session error')));

      await authController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ─── ME ──────────────────────────────────────────────

  describe('me', () => {
    test('TC-U-012: ดูข้อมูลตัวเองสำเร็จ', async () => {
      req.session.user = { id: 1, username: 'john', role: 'vendor' };

      await authController.me(req, res);

      expect(res.json).toHaveBeenCalledWith({ user: req.session.user });
    });
  });
});
