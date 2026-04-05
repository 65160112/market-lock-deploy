const appUserController = require('../controllers/appUserController');
const AppUser = require('../models/appUserModel');
const bcrypt = require('bcrypt');

jest.mock('../models/appUserModel');
jest.mock('bcrypt');

describe('appUserController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, user: { id: 1, role: 'admin' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    test('ข้อมูลไม่ครบ ได้ 400', async () => {
      req.body = { username: 'john', email: 'j@j.com' };
      await appUserController.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    });

    test('role ไม่ถูกต้อง ได้ 400', async () => {
      req.body = { username: 'john', email: 'j@j.com', password: '123', full_name: 'John', role: 'admin' };
      await appUserController.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'บทบาทไม่ถูกต้อง' });
    });

    test('email ซ้ำ ได้ 409', async () => {
      req.body = { username: 'john', email: 'j@j.com', password: '123', full_name: 'John', role: 'vendor' };
      AppUser.findByEmail.mockResolvedValue({ id: 1 });
      await appUserController.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    });

    test('username ซ้ำ ได้ 409', async () => {
      req.body = { username: 'john', email: 'j@j.com', password: '123', full_name: 'John', role: 'vendor' };
      AppUser.findByEmail.mockResolvedValue(null);
      AppUser.findByUsername.mockResolvedValue({ id: 2 });
      await appUserController.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' });
    });

    test('สร้าง user สำเร็จ ได้ 201', async () => {
      req.body = { username: 'john', email: 'j@j.com', password: '123', full_name: 'John', role: 'vendor', phone: '0812345678' };
      AppUser.findByEmail.mockResolvedValue(null);
      AppUser.findByUsername.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashed123');
      AppUser.create.mockResolvedValue(5);
      await appUserController.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'สร้างผู้ใช้สำเร็จ', userId: 5 });
    });

    test('error ได้ 500', async () => {
      req.body = { username: 'john', email: 'j@j.com', password: '123', full_name: 'John', role: 'vendor' };
      AppUser.findByEmail.mockRejectedValue(new Error('db error'));
      await appUserController.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getAllUsers', () => {
    test('admin ดูผู้ใช้ทั้งหมดสำเร็จ', async () => {
      AppUser.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      await appUserController.getAllUsers(req, res);
      expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
    });

    test('error ได้ 500', async () => {
      AppUser.findAll.mockRejectedValue(new Error('db error'));
      await appUserController.getAllUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getUserById', () => {
    test('ไม่พบ user ได้ 404', async () => {
      req.params.id = '99';
      AppUser.findById.mockResolvedValue(null);
      await appUserController.getUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('พบ user และไม่ส่ง password ออก', async () => {
      req.params.id = '1';
      AppUser.findById.mockResolvedValue({ id: 1, username: 'john', password: 'hashed' });
      await appUserController.getUserById(req, res);
      const called = res.json.mock.calls[0][0];
      expect(called.password).toBeUndefined();
    });

    test('error ได้ 500', async () => {
      req.params.id = '1';
      AppUser.findById.mockRejectedValue(new Error('db error'));
      await appUserController.getUserById(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateUser', () => {
    test('ไม่ใช่เจ้าของและไม่ใช่ admin ได้ 403', async () => {
      req.params.id = '5';
      req.user = { id: 2, role: 'vendor' };
      req.body = { full_name: 'New Name' };
      await appUserController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('เจ้าของอัปเดตตัวเองได้', async () => {
      req.params.id = '2';
      req.user = { id: 2, role: 'vendor' };
      req.body = { full_name: 'New Name' };
      AppUser.update.mockResolvedValue();
      await appUserController.updateUser(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'อัปเดตข้อมูลสำเร็จ' });
    });

    test('อัปเดตพร้อม password ให้ hash ก่อน', async () => {
      req.params.id = '2';
      req.user = { id: 2, role: 'vendor' };
      req.body = { password: 'newpass' };
      bcrypt.hash.mockResolvedValue('newhashed');
      AppUser.update.mockResolvedValue();
      await appUserController.updateUser(req, res);
      expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 10);
    });

    test('error ได้ 500', async () => {
      req.params.id = '1';
      req.user = { id: 1, role: 'admin' };
      req.body = { full_name: 'New Name' };
      AppUser.update.mockRejectedValue(new Error('db error'));
      await appUserController.updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteUser', () => {
    test('ลบ user สำเร็จ', async () => {
      req.params.id = '3';
      AppUser.delete.mockResolvedValue();
      await appUserController.deleteUser(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'ลบผู้ใช้งานสำเร็จ' });
    });

    test('error ได้ 500', async () => {
      req.params.id = '3';
      AppUser.delete.mockRejectedValue(new Error('db error'));
      await appUserController.deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});