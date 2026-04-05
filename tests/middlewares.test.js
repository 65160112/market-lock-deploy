const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const errorMiddleware = require('../middlewares/errorMiddleware');

describe('middlewares', () => {

  let req, res, next;

  beforeEach(() => {
    req = { session: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  // ─── authMiddleware ───────────────────────────────────

  describe('authMiddleware', () => {
    test('TC-U-013: มี session user ให้ผ่าน', () => {
      req.session.user = { id: 1, role: 'vendor' };

      authMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual({ id: 1, role: 'vendor' });
    });

    test('TC-U-014: ไม่มี session ให้ 401', () => {
      req.session = {};

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ─── roleMiddleware ───────────────────────────────────

  describe('roleMiddleware', () => {
    test('TC-U-015: role ตรง ให้ผ่าน', () => {
      req.user = { id: 1, role: 'admin' };
      const middleware = roleMiddleware('admin');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('TC-U-016: role ไม่ตรง ให้ 403', () => {
      req.user = { id: 1, role: 'vendor' };
      const middleware = roleMiddleware('admin');

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    test('TC-U-017: รองรับหลาย role', () => {
      req.user = { id: 1, role: 'vendor' };
      const middleware = roleMiddleware('vendor');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('TC-U-018: ไม่มี req.user ให้ 401', () => {
      req.user = undefined;
      const middleware = roleMiddleware('admin');

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  // ─── errorMiddleware ─────────────────────────────────

  describe('errorMiddleware', () => {
    test('TC-U-019: แสดง error message และ status ที่กำหนด', () => {
      const err = { statusCode: 404, message: 'ไม่พบข้อมูล' };

      errorMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'ไม่พบข้อมูล' });
    });

    test('TC-U-020: ถ้าไม่มี statusCode ให้ใช้ 500', () => {
      const err = { message: 'server error' };

      errorMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
