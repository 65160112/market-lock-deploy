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
        <div className="auth-logo">🏪</div>
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
          min-height:100vh; display:flex; align-items:center; justify-content:center;
          background: radial-gradient(ellipse at 60% 40%, #1a2340 0%, #0f1117 70%);
          padding:24px;
        }
        .auth-card {
          background:var(--bg2); border:1px solid var(--border);
          border-radius:20px; padding:48px 40px; width:100%; max-width:420px;
          box-shadow: 0 0 60px rgba(245,158,11,0.08);
        }
        .auth-logo { font-size:48px; text-align:center; margin-bottom:8px; }
        .auth-title { text-align:center; font-size:22px; color:var(--text); margin-bottom:4px; }
        .auth-sub { text-align:center; color:var(--muted); font-size:14px; margin-bottom:32px; }
        .alert-error {
          background:#ef444418; border:1px solid #ef444440; color:#fca5a5;
          padding:12px 16px; border-radius:8px; margin-bottom:20px; font-size:14px;
        }
        .field { margin-bottom:18px; }
        .field label { display:block; margin-bottom:6px; font-size:14px; color:var(--muted); font-weight:500; }
        .field input {
          width:100%; padding:12px 14px; background:var(--bg3);
          border:1px solid var(--border); border-radius:10px; color:var(--text);
          font-size:15px; transition:border-color .2s;
        }
        .field input:focus { border-color:var(--accent); }
        .btn-primary {
          width:100%; padding:14px; background:var(--accent); color:#000;
          border:none; border-radius:10px; font-size:16px; font-weight:700;
          margin-top:8px; transition:all .2s;
        }
        .btn-primary:hover:not(:disabled) { background:var(--accent2); transform:translateY(-1px); }
        .btn-primary:disabled { opacity:.6; cursor:not-allowed; }
        .auth-footer { text-align:center; margin-top:24px; font-size:14px; color:var(--muted); }
        .link { color:var(--accent); font-weight:600; }
        .link:hover { text-decoration:underline; }
      `}</style>
    </div>
  );
}
