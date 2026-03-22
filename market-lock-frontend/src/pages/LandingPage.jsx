import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [locks, setLocks] = useState([]);

  useEffect(() => {
    api.get('/locks/map').then(res => {
      setLocks(res.data.filter(l => l.status === 'available').slice(0, 3));
    }).catch(() => {});
  }, []);

  const MARKET_IMGS = [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=280&fit=crop',
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=280&fit=crop',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=280&fit=crop',
  ];

  return (
    <div className="landing">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-inner">
          <div className="nav-logo">
            <span className="logo-icon">🏪</span>
            <span className="logo-text">ระบบจองล็อคตลาดขายของ</span>
          </div>
          <div className="nav-links">
            <a href="#features" className="nav-link">ฟีเจอร์</a>
            <a href="#steps" className="nav-link">ขั้นตอน</a>
            <a href="#available" className="nav-link">การจองล็อค</a>
            <a href="#contact" className="nav-link">ติดต่อเรา</a>
          </div>
          <div className="nav-actions">
            {user ? (
              <button className="btn-cta" onClick={() => navigate('/map')}>เข้าสู่ระบบ</button>
            ) : (
              <>
                <button className="btn-outline" onClick={() => navigate('/login')}>เข้าสู่ระบบ</button>
                <button className="btn-cta" onClick={() => navigate('/register')}>สมัครใช้งาน</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content fade-in">
          <h1 className="hero-title">ระบบจองล็อคตลาดขายของ<br/>ออนไลน์</h1>
          <p className="hero-sub">สะดวก รวดเร็ว จองได้ง่าย แค่ปลายนิ้ว</p>
          <div className="hero-btns">
            <button className="btn-hero-primary" onClick={() => navigate(user ? '/map' : '/register')}>
              ค้นหาแผงว่าง
            </button>
            <button className="btn-hero-outline" onClick={() => navigate(user ? '/map' : '/login')}>
              สมัครใช้งาน
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="section-inner">
          <div className="features-grid">
            {[
              { icon: '📋', title: 'จองล็อคง่ายๆ', desc: 'ตรวจสอบและจองล็อคว่างได้ทันที ไม่ต้องรอนาน' },
              { icon: '⚙️', title: 'บริหารจัดการสะดวก', desc: 'ผู้ดูแลจัดการข้อมูลล็อคและการจองได้อย่างมีประสิทธิภาพ' },
              { icon: '🛡️', title: 'ปลอดภัยและมั่นใจ', desc: 'ข้อมูลปลอดภัย ชำระเงินผ่านระบบที่เชื่อถือได้' },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="steps-section" id="steps">
        <div className="section-inner">
          <h2 className="section-title">ขั้นตอนการจองล็อค</h2>
          <div className="steps-row">
            {[
              { num: 1, icon: '👤', title: 'สมัคร / เข้าสู่ระบบ', desc: 'สมัครสมาชิกหรือเข้าสู่ระบบ' },
              { num: 2, icon: '🔍', title: 'ค้นหาแผงว่าง', desc: 'เลือกดูแผนผังล็อคที่ต้องการ' },
              { num: 3, icon: '✅', title: 'ยืนยันการจอง', desc: 'กรอกข้อมูลและยืนยันการจอง' },
              { num: 4, icon: '💳', title: 'รับการยืนยัน', desc: 'ชำระเงินและรับยืนยันทันที' },
            ].map((s, i) => (
              <div key={i} className="step-item">
                <div className="step-circle">
                  <span className="step-num">{s.num}</span>
                </div>
                {i < 3 && <div className="step-arrow">→</div>}
                <div className="step-icon">{s.icon}</div>
                <h4 className="step-title">{s.title}</h4>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AVAILABLE LOCKS */}
      <section className="available-section" id="available">
        <div className="section-inner">
          <h2 className="section-title">ล็อคว่างล่าสุด</h2>
          <div className="locks-grid">
            {locks.length > 0 ? locks.map((lock, i) => (
              <div key={lock.id} className="lock-card">
                <div className="lock-img">
                  <img src={MARKET_IMGS[i % 3]} alt="lock" />
                  <div className="lock-badge-available">ว่าง</div>
                </div>
                <div className="lock-body">
                  <h3 className="lock-name">ล็อค {lock.zone}{lock.lock_number}</h3>
                  <div className="lock-meta">
                    <span>📐 ขนาด: {lock.size || 'N/A'}</span>
                    <span>💰 ราคา: {Number(lock.price_per_month).toLocaleString()} บาท/วัน</span>
                  </div>
                  <button className="btn-book"
                    onClick={() => navigate(user ? `/booking/${lock.id}` : '/login')}>
                    จองเลย
                  </button>
                </div>
              </div>
            )) : (
              // Placeholder cards ถ้ายังไม่มีข้อมูล
              [0,1,2].map(i => (
                <div key={i} className="lock-card">
                  <div className="lock-img">
                    <img src={MARKET_IMGS[i]} alt="lock" />
                    <div className="lock-badge-available">ว่าง</div>
                  </div>
                  <div className="lock-body">
                    <h3 className="lock-name">ล็อค A{i+1}2</h3>
                    <div className="lock-meta">
                      <span>📐 ขนาด: 2x2 แมตร</span>
                      <span>💰 ราคา: 300 บาท/วัน</span>
                    </div>
                    <button className="btn-book" onClick={() => navigate(user ? '/map' : '/login')}>
                      จองเลย
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer" id="contact">
        <div className="footer-inner">
          <div className="footer-logo">🏪 ระบบจองล็อคตลาด</div>
          <p className="footer-copy">© 2025 ระบบจองล็อคตลาดขายของออนไลน์ สงวนลิขสิทธิ์</p>
        </div>
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .landing { font-family: 'Sarabun', sans-serif; color: #1a1a1a; background: #fff; }

        /* NAVBAR */
        .navbar {
          position: sticky; top: 0; z-index: 100;
          background: #fff; border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .nav-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; align-items: center; gap: 32px;
          padding: 0 24px; height: 64px;
        }
        .nav-logo { display: flex; align-items: center; gap: 10px; margin-right: auto; }
        .logo-icon { font-size: 24px; }
        .logo-text { font-family: 'Prompt', sans-serif; font-weight: 700; font-size: 16px; color: #166534; }
        .nav-links { display: flex; gap: 4px; }
        .nav-link {
          padding: 8px 14px; border-radius: 8px; font-size: 14px;
          color: #374151; font-weight: 500; transition: all .2s; text-decoration: none;
        }
        .nav-link:hover { background: #f0fdf4; color: #166534; }
        .nav-actions { display: flex; gap: 8px; }
        .btn-outline {
          padding: 8px 18px; border-radius: 8px; border: 1.5px solid #16a34a;
          background: transparent; color: #16a34a; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all .2s;
        }
        .btn-outline:hover { background: #f0fdf4; }
        .btn-cta {
          padding: 8px 18px; border-radius: 8px; border: none;
          background: #16a34a; color: #fff; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all .2s;
        }
        .btn-cta:hover { background: #15803d; }

        /* HERO */
        .hero {
          position: relative; min-height: 520px;
          display: flex; align-items: center;
          background: url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&h=600&fit=crop') center/cover no-repeat;
        }
        .hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 100%);
        }
        .hero-content {
          position: relative; z-index: 1;
          max-width: 1200px; margin: 0 auto; padding: 60px 24px;
        }
        .hero-title {
          font-family: 'Prompt', sans-serif; font-size: 44px; font-weight: 700;
          color: #fff; line-height: 1.3; margin-bottom: 16px;
        }
        .hero-sub { font-size: 18px; color: #d1fae5; margin-bottom: 32px; }
        .hero-btns { display: flex; gap: 12px; flex-wrap: wrap; }
        .btn-hero-primary {
          padding: 14px 32px; border-radius: 10px; border: none;
          background: #16a34a; color: #fff; font-size: 16px; font-weight: 700;
          cursor: pointer; transition: all .2s; font-family: 'Sarabun', sans-serif;
        }
        .btn-hero-primary:hover { background: #15803d; transform: translateY(-2px); }
        .btn-hero-outline {
          padding: 14px 32px; border-radius: 10px; border: 2px solid #f59e0b;
          background: transparent; color: #f59e0b; font-size: 16px; font-weight: 700;
          cursor: pointer; transition: all .2s; font-family: 'Sarabun', sans-serif;
        }
        .btn-hero-outline:hover { background: #f59e0b; color: #000; }

        /* FEATURES */
        .features { background: #fff; padding: 64px 24px; }
        .section-inner { max-width: 1200px; margin: 0 auto; }
        .section-title {
          font-family: 'Prompt', sans-serif; font-size: 28px; font-weight: 700;
          text-align: center; color: #166534; margin-bottom: 40px;
        }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .feature-card {
          text-align: center; padding: 36px 24px;
          border-radius: 16px; border: 1px solid #e5e7eb;
          transition: all .3s;
        }
        .feature-card:hover { box-shadow: 0 8px 32px rgba(22,163,74,0.12); transform: translateY(-4px); }
        .feature-icon { font-size: 48px; margin-bottom: 16px; }
        .feature-title { font-family: 'Prompt', sans-serif; font-size: 18px; font-weight: 600; color: #166534; margin-bottom: 10px; }
        .feature-desc { font-size: 14px; color: #6b7280; line-height: 1.6; }

        /* STEPS */
        .steps-section { background: #f0fdf4; padding: 64px 24px; }
        .steps-row {
          display: flex; align-items: flex-start; justify-content: center;
          gap: 0; flex-wrap: wrap;
        }
        .step-item {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; flex: 1; min-width: 180px; position: relative; padding: 0 16px;
        }
        .step-circle {
          width: 56px; height: 56px; border-radius: 50%;
          background: #16a34a; display: flex; align-items: center; justify-content: center;
          margin-bottom: 12px; box-shadow: 0 4px 12px rgba(22,163,74,0.3);
        }
        .step-num { font-family: 'Prompt', sans-serif; font-size: 22px; font-weight: 700; color: #fff; }
        .step-arrow {
          position: absolute; top: 20px; right: -12px;
          font-size: 24px; color: #86efac; z-index: 1;
        }
        .step-icon { font-size: 32px; margin-bottom: 8px; }
        .step-title { font-family: 'Prompt', sans-serif; font-size: 15px; font-weight: 600; color: #166534; margin-bottom: 6px; }
        .step-desc { font-size: 13px; color: #6b7280; }

        /* AVAILABLE */
        .available-section { background: #fff; padding: 64px 24px; }
        .locks-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .lock-card {
          border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;
          transition: all .3s;
        }
        .lock-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.1); transform: translateY(-4px); }
        .lock-img { position: relative; height: 200px; overflow: hidden; }
        .lock-img img { width: 100%; height: 100%; object-fit: cover; }
        .lock-badge-available {
          position: absolute; top: 12px; right: 12px;
          background: #16a34a; color: #fff; padding: 4px 12px;
          border-radius: 20px; font-size: 12px; font-weight: 700;
        }
        .lock-body { padding: 20px; }
        .lock-name { font-family: 'Prompt', sans-serif; font-size: 18px; font-weight: 700; color: #166534; margin-bottom: 10px; }
        .lock-meta { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; }
        .lock-meta span { font-size: 13px; color: #6b7280; }
        .btn-book {
          width: 100%; padding: 11px; border-radius: 10px; border: none;
          background: #16a34a; color: #fff; font-size: 15px; font-weight: 700;
          cursor: pointer; transition: all .2s; font-family: 'Sarabun', sans-serif;
        }
        .btn-book:hover { background: #15803d; }

        /* FOOTER */
        .footer { background: #166534; padding: 32px 24px; }
        .footer-inner { max-width: 1200px; margin: 0 auto; text-align: center; }
        .footer-logo { font-family: 'Prompt', sans-serif; font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px; }
        .footer-copy { font-size: 13px; color: #86efac; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn .7s ease both; }

        @media(max-width: 768px) {
          .features-grid, .locks-grid { grid-template-columns: 1fr; }
          .hero-title { font-size: 28px; }
          .nav-links { display: none; }
          .steps-row { flex-direction: column; align-items: center; }
          .step-arrow { display: none; }
        }
      `}</style>
    </div>
  );
}
