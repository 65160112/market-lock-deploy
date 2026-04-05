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