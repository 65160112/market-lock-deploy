const request = require('supertest');
const express = require('express');
const session = require('express-session');

// Mock DB
jest.mock('../config/database', () => ({
  query: jest.fn(),
}));

const db = require('../config/database');

// สร้าง app จำลอง
function createApp() {
  const app = express();
  app.use(express.json());
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false,
  }));
  app.use('/api/auth',     require('../routes/authRoutes'));
  app.use('/api/locks',    require('../routes/marketLockRoutes'));
  app.use('/api/bookings', require('../routes/bookingRoutes'));
  app.use('/api/payments', require('../routes/paymentRoutes'));
  app.use('/api/users',    require('../routes/appUserRoutes'));
  return app;
}

// ─── Suite 1: Auth API ────────────────────────────────

describe('Integration: Auth API', () => {
  let app;
  beforeAll(() => { app = createApp(); });

  test('POST /api/auth/register — ข้อมูลไม่ครบ ได้ 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x@x.com' });
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/login — ไม่มี user ได้ 401', async () => {
    db.query.mockResolvedValue([[]]);
    const res = await request(app).post('/api/auth/login').send({ email: 'x@x.com', password: '123' });
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me — ยังไม่ login ได้ 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('POST /api/auth/logout — ไม่ได้ login ได้ 401', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(401);
  });
});

// ─── Suite 2: Locks API ───────────────────────────────

describe('Integration: Locks API', () => {
  let app;
  beforeAll(() => { app = createApp(); });

  test('GET /api/locks — ไม่ login ได้ 401', async () => {
    const res = await request(app).get('/api/locks');
    expect(res.status).toBe(401);
  });

  test('GET /api/locks/map — ไม่ login ได้ 401', async () => {
    const res = await request(app).get('/api/locks/map');
    expect(res.status).toBe(401);
  });

  test('POST /api/locks — ไม่ login ได้ 401', async () => {
    const res = await request(app).post('/api/locks').send({ zone: 'A', lock_number: '01', price_per_month: 1500 });
    expect(res.status).toBe(401);
  });
});

// ─── Suite 3: Bookings API ────────────────────────────

describe('Integration: Bookings API', () => {
  let app;
  beforeAll(() => { app = createApp(); });

  test('GET /api/bookings — ไม่ login ได้ 401', async () => {
    const res = await request(app).get('/api/bookings');
    expect(res.status).toBe(401);
  });

  test('POST /api/bookings — ไม่ login ได้ 401', async () => {
    const res = await request(app).post('/api/bookings').send({ lock_id: 1 });
    expect(res.status).toBe(401);
  });

  test('GET /api/bookings/stats — ไม่ login ได้ 401', async () => {
    const res = await request(app).get('/api/bookings/stats');
    expect(res.status).toBe(401);
  });
});

// ─── Suite 4: Payments API ───────────────────────────

describe('Integration: Payments API', () => {
  let app;
  beforeAll(() => { app = createApp(); });

  test('GET /api/payments — ไม่ login ได้ 401', async () => {
    const res = await request(app).get('/api/payments');
    expect(res.status).toBe(401);
  });

  test('GET /api/payments/pending — ไม่ login ได้ 401', async () => {
    const res = await request(app).get('/api/payments/pending');
    expect(res.status).toBe(401);
  });

  test('PATCH /api/payments/1/verify — ไม่ login ได้ 401', async () => {
    const res = await request(app).patch('/api/payments/1/verify').send({ status: 'approved' });
    expect(res.status).toBe(401);
  });
});

// ─── Suite 5: Users API ──────────────────────────────

describe('Integration: Users API', () => {
  let app;
  beforeAll(() => { app = createApp(); });

  test('GET /api/users — ไม่ login ได้ 401', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  test('GET /api/users/1 — ไม่ login ได้ 401', async () => {
    const res = await request(app).get('/api/users/1');
    expect(res.status).toBe(401);
  });

  test('DELETE /api/users/1 — ไม่ login ได้ 401', async () => {
    const res = await request(app).delete('/api/users/1');
    expect(res.status).toBe(401);
  });
});
