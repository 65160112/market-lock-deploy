import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/map');
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card fade-in">
        <div className="auth-logo-wrapper">
          <svg viewBox="0 0 120 120" className="auth-logo-icon">
            <defs>
              <linearGradient id="storeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981"/>
                <stop offset="100%" stopColor="#059669"/>
              </linearGradient>
            </defs>
            {/* Store body */}
            <rect x="30" y="50" width="60" height="50" rx="4" fill="#10b981"/>
            {/* Store roof */}
            <polygon points="25,50 95,50 105,35 15,35" fill="#059669"/>
            {/* Door */}
            <rect x="45" y="65" width="30" height="35" rx="2" fill="#ffffff" opacity="0.9"/>
            {/* Door handle */}
            <circle cx="72" cy="82" r="2.5" fill="#10b981"/>
            {/* Windows */}
            <rect x="35" y="55" width="12" height="12" rx="1" fill="#ffffff" opacity="0.6"/>
            <rect x="73" y="55" width="12" height="12" rx="1" fill="#ffffff" opacity="0.6"/>
            {/* Flag - 24H */}
            <circle cx="65" cy="25" r="15" fill="#ef4444"/>
            <text x="65" y="32" textAnchor="middle" fontSize="16" fontWeight="700" fill="#ffffff" fontFamily="sans-serif">24H</text>
          </svg>
        </div>
        <h1 className="auth-title">ระบบจองล็อคตลาด</h1>
        <p className="auth-sub">เข้าสู่ระบบเพื่อใช้งาน</p>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label>อีเมล</label>
            <input name="email" type="email" value={form.email} onChange={handle}
              placeholder="example@email.com" required />
          </div>
          <div className="field">
            <label>รหัสผ่าน</label>
            <input name="password" type="password" value={form.password} onChange={handle}
              placeholder="••••••••" required />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p className="auth-footer">
          ยังไม่มีบัญชี? <Link to="/register" className="link">สมัครสมาชิก</Link>
        </p>
      </div>

      <style>{`
        .auth-wrap { 
          min-height: 100vh; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
          padding: 24px;
        }

        .auth-card { 
          background: var(--card-bg); 
          border: 1px solid var(--border); 
          border-radius: var(--radius-lg); 
          padding: 48px 40px; 
          width: 100%; 
          max-width: 420px;
          box-shadow: var(--shadow);
          animation: slideInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .auth-logo { 
          font-size: 48px; 
          text-align: center; 
          margin-bottom: 12px;
          display: inline-flex;
          width: 100%;
          justify-content: center;
          margin-left: -100%;
        }

        .auth-logo-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
          animation: slideDown 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .auth-logo-icon {
          width: 100px;
          height: 100px;
          filter: drop-shadow(0 4px 12px rgba(16,185,129,0.3));
        }

        .auth-title { 
          text-align: center; 
          font-size: 28px; 
          color: var(--primary); 
          margin-bottom: 8px; 
          font-family: var(--font-sans); 
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .auth-sub { 
          text-align: center; 
          color: var(--text-secondary); 
          font-size: 14px; 
          margin-bottom: 32px; 
          font-family: var(--font-th);
        }

        .alert-error { 
          background: var(--danger-light); 
          border: 1px solid #f87171; 
          color: #991b1b; 
          padding: 14px 16px; 
          border-radius: var(--radius-sm); 
          margin-bottom: 20px; 
          font-size: 14px; 
          font-family: var(--font-th);
          animation: slideInDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .field { 
          margin-bottom: 18px; 
        }

        .field label { 
          display: block; 
          margin-bottom: 6px; 
          font-size: 14px; 
          color: var(--text-secondary); 
          font-weight: 600; 
          font-family: var(--font-th);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .field input { 
          width: 100%; 
          padding: 12px 14px; 
          background: var(--card-bg); 
          border: 1px solid var(--border); 
          border-radius: var(--radius-sm); 
          color: var(--text); 
          font-size: 15px; 
          transition: var(--transition); 
          font-family: var(--font-th);
        }

        .field input::placeholder {
          color: var(--muted);
        }

        .field input:focus { 
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
          background: var(--primary-light);
          outline: none; 
        }

        .btn-primary { 
          width: 100%; 
          padding: 14px; 
          background: var(--primary); 
          color: #ffffff; 
          border: none; 
          border-radius: var(--radius-sm); 
          font-size: 16px; 
          font-weight: 700; 
          margin-top: 8px; 
          transition: var(--transition); 
          font-family: var(--font-th); 
          cursor: pointer;
          box-shadow: var(--shadow-sm);
        }

        .btn-primary:hover:not(:disabled) { 
          background: var(--primary-hover);
          box-shadow: var(--shadow);
          transform: translateY(-1px);
        }

        .btn-primary:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-primary:disabled { 
          opacity: 0.6; 
          cursor: not-allowed;
        }

        .auth-footer { 
          text-align: center; 
          margin-top: 24px; 
          font-size: 14px; 
          color: var(--text-secondary); 
          font-family: var(--font-th);
        }

        .link { 
          color: var(--primary); 
          font-weight: 600; 
          text-decoration: none;
          transition: var(--transition);
        }

        .link:hover { 
          color: var(--primary-hover);
          text-decoration: underline;
        }

        @media(max-width: 600px) {
          .auth-card {
            padding: 40px 24px;
          }

          .auth-title {
            font-size: 22px;
          }

          .auth-sub {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}
