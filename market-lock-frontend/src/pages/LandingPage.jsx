import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [locks, setLocks] = useState([]);

  useEffect(() => {
    api.get('/locks')
      .then(res => {
        const availableLocks = res.data
          .filter(l => l.status === 'available')
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        setLocks(availableLocks);
      })
      .catch(err => {
        console.error('Error loading locks:', err);
      });
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
            <button className="btn-hero-primary" onClick={() => navigate(user ? '/map' : '/login')}>
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
        .landing { font-family: var(--font-th); color: var(--text); background: var(--bg); }

        /* NAVBAR */
        .navbar {
          position: sticky; top: 0; z-index: 100;
          background: var(--card-bg); border-bottom: 2px solid var(--primary);
          box-shadow: var(--shadow-sm);
        }
        .nav-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; align-items: center; gap: 32px;
          padding: 0 24px; height: 72px;
        }
        .nav-logo { display: flex; align-items: center; gap: 10px; margin-right: auto; }
        .logo-icon { font-size: 24px; }
        .logo-text { font-family: var(--font-sans); font-weight: 700; font-size: 18px; color: var(--primary); }
        .nav-links { display: flex; gap: 8px; }
        .nav-link {
          padding: 10px 14px; border-radius: 12px; font-size: 14px;
          color: var(--text-secondary); font-weight: 500; transition: all .2s; text-decoration: none;
        }
        .nav-link:hover { background: var(--primary-light); color: var(--primary); }
        .nav-actions { display: flex; gap: 10px; }
        .btn-outline {
          padding: 10px 18px; border-radius: 10px; border: 1.5px solid var(--primary);
          background: transparent; color: var(--primary); font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all .2s;
        }
        .btn-outline:hover { background: var(--primary-light); }
        .btn-cta {
          padding: 10px 18px; border-radius: 10px; border: none;
          background: var(--primary); color: #ffffff; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all .2s;
        }
        .btn-cta:hover { background: var(--primary-hover); }

        /* HERO */
        .hero {
          position: relative; min-height: 520px;
          display: flex; align-items: center;
          background: url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&h=600&fit=crop') center/cover no-repeat;
        }
        .hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to right, rgba(16,185,129,0.3) 0%, rgba(16,185,129,0.15) 100%);
        }
        .hero-content {
          position: relative; z-index: 1;
          max-width: 1200px; margin: 0 auto; padding: 60px 24px;
        }
        .hero-title {
          font-family: var(--font-sans); font-size: 44px; font-weight: 700;
          color: #ffffff; line-height: 1.2; margin-bottom: 16px;
        }
        .hero-sub { font-size: 18px; color: rgba(255,255,255,0.9); margin-bottom: 32px; }
        .hero-btns { display: flex; gap: 12px; flex-wrap: wrap; }
        .btn-hero-primary {
          padding: 14px 32px; border-radius: 10px; border: none;
          background: #ffffff; color: var(--primary); font-size: 16px; font-weight: 700;
          cursor: pointer; transition: all .2s; font-family: 'Sarabun', sans-serif;
        }
        .btn-hero-primary:hover { background: var(--primary-light); transform: translateY(-2px); }
        .btn-hero-outline {
          padding: 14px 32px; border-radius: 10px; border: 2px solid #ffffff;
          background: transparent; color: #ffffff; font-size: 16px; font-weight: 700;
          cursor: pointer; transition: all .2s; font-family: 'Sarabun', sans-serif;
        }
        .btn-hero-outline:hover { background: #ffffff; color: var(--primary); }

        /* FEATURES */
        .features { background: var(--bg); padding: 64px 24px; }
        .section-inner { max-width: 1200px; margin: 0 auto; }
        .section-title {
          font-family: var(--font-sans); font-size: 28px; font-weight: 700;
          text-align: center; color: var(--primary); margin-bottom: 40px;
        }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .feature-card {
          text-align: center; padding: 36px 24px;
          border-radius: 16px; border: 1px solid var(--border);
          background: var(--card-bg); transition: all .3s;
          box-shadow: var(--shadow-sm);
        }
        .feature-card:hover { background: var(--primary-light); border-color: var(--primary); box-shadow: var(--shadow); transform: translateY(-4px); }
        .feature-icon { font-size: 48px; margin-bottom: 16px; }
        .feature-title { font-family: var(--font-sans); font-size: 18px; font-weight: 600; color: var(--text); margin-bottom: 10px; }
        .feature-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }

        /* STEPS */
        .steps-section { background: var(--primary-lighter); padding: 64px 24px; }
        .steps-row { display: grid; grid-template-columns: repeat(4, minmax(200px, 1fr)); gap: 20px; }
        .step-item {
          display: flex; flex-direction: column; align-items: center; gap: 14px;
          background: var(--card-bg); border: 2px solid var(--primary); border-radius: 16px;
          padding: 24px; text-align: center;
          box-shadow: var(--shadow-sm);
          transition: all .3s;
        }
        .step-item:hover { box-shadow: var(--shadow); transform: translateY(-4px); }
        .step-circle { width: 48px; height: 48px; border-radius: 50%; background: var(--primary); color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 700; }
        .step-icon { font-size: 26px; }
        .step-title { font-size: 16px; font-family: var(--font-sans); color: var(--primary); margin-bottom: 4px; font-weight: 700; }
        .step-desc { color: var(--text-secondary); font-size: 14px; line-height: 1.6; }

        /* AVAILABLE LOCKS */
        .available-section { background: var(--bg); padding: 64px 24px; }
        .locks-grid { display: grid; grid-template-columns: repeat(3, minmax(240px, 1fr)); gap: 24px; }
        .lock-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-sm); transition: all .3s; }
        .lock-card:hover { box-shadow: var(--shadow); transform: translateY(-4px); border-color: var(--primary); }
        .lock-img { position: relative; }
        .lock-img img { width: 100%; display: block; height: 180px; object-fit: cover; }
        .lock-badge-available { position: absolute; bottom: 14px; left: 14px; padding: 6px 12px; border-radius: 999px; background: var(--primary); color: #ffffff; font-size: 12px; font-weight: 700; }
        .lock-body { padding: 20px; }
        .lock-name { font-size: 18px; color: var(--primary); margin-bottom: 10px; font-weight: 700; }
        .lock-meta { display: flex; flex-direction: column; gap: 6px; color: var(--text-secondary); font-size: 13px; margin-bottom: 18px; }
        .btn-book { width: 100%; padding: 12px 16px; border-radius: 10px; border: none; background: var(--primary); color: #ffffff; font-weight: 700; cursor: pointer; transition: all .2s; }
        .btn-book:hover { background: var(--primary-hover); transform: translateY(-2px); }

        /* FOOTER */
        .footer { background: var(--primary); padding: 32px 24px; }
        .footer-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
        .footer-logo { color: #ffffff; font-weight: 700; font-size: 16px; }
        .footer-copy { color: rgba(255,255,255,0.8); font-size: 14px; }

        @media (max-width: 980px) { .features-grid, .locks-grid, .steps-row { grid-template-columns: 1fr; } }
        @media (max-width: 720px) { .nav-inner { flex-wrap: wrap; height: auto; padding: 20px; } .nav-actions { width: 100%; justify-content: center; } }
      `}</style>
    </div>
  );
}

