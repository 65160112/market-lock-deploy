import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username:'', email:'', password:'', full_name:'', phone:'', role:'tenant' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card fade-in">
        <div className="auth-logo">🏪</div>
        <h1 className="auth-title">สมัครสมาชิก</h1>
        <p className="auth-sub">สร้างบัญชีเพื่อจองล็อคตลาด</p>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="field-row">
            <div className="field">
              <label>ชื่อผู้ใช้</label>
              <input name="username" value={form.username} onChange={handle} placeholder="username" required />
            </div>
            <div className="field">
              <label>เบอร์โทร</label>
              <input name="phone" value={form.phone} onChange={handle} placeholder="08xxxxxxxx" />
            </div>
          </div>
          <div className="field">
            <label>ชื่อ-นามสกุล</label>
            <input name="full_name" value={form.full_name} onChange={handle} placeholder="ชื่อ นามสกุล" required />
          </div>
          <div className="field">
            <label>อีเมล</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="example@email.com" required />
          </div>
          <div className="field">
            <label>รหัสผ่าน</label>
            <input name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" required />
          </div>
          <div className="field">
            <label>ประเภทผู้ใช้</label>
            <select name="role" value={form.role} onChange={handle}>
              <option value="tenant">ผู้เช่าล็อค</option>
              <option value="vendor">แผงค้า/พ่อค้าแม่ค้า</option>
            </select>
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
          </button>
        </form>

        <p className="auth-footer">
          มีบัญชีแล้ว? <Link to="/login" className="link">เข้าสู่ระบบ</Link>
        </p>
      </div>

      <style>{`
        .auth-wrap {
          min-height:100vh; display:flex; align-items:center; justify-content:center;
          background: radial-gradient(ellipse at 40% 60%, #1a2340 0%, #0f1117 70%);
          padding:24px;
        }
        .auth-card {
          background:var(--bg2); border:1px solid var(--border);
          border-radius:20px; padding:48px 40px; width:100%; max-width:460px;
          box-shadow: 0 0 60px rgba(245,158,11,0.08);
        }
        .auth-logo { font-size:48px; text-align:center; margin-bottom:8px; }
        .auth-title { text-align:center; font-size:22px; margin-bottom:4px; }
        .auth-sub { text-align:center; color:var(--muted); font-size:14px; margin-bottom:32px; }
        .alert-error {
          background:#ef444418; border:1px solid #ef444440; color:#fca5a5;
          padding:12px 16px; border-radius:8px; margin-bottom:20px; font-size:14px;
        }
        .field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .field { margin-bottom:16px; }
        .field label { display:block; margin-bottom:6px; font-size:14px; color:var(--muted); font-weight:500; }
        .field input, .field select {
          width:100%; padding:12px 14px; background:var(--bg3);
          border:1px solid var(--border); border-radius:10px; color:var(--text);
          font-size:15px; transition:border-color .2s;
        }
        .field input:focus, .field select:focus { border-color:var(--accent); }
        .field select option { background:var(--bg3); }
        .btn-primary {
          width:100%; padding:14px; background:var(--accent); color:#000;
          border:none; border-radius:10px; font-size:16px; font-weight:700;
          margin-top:8px; transition:all .2s;
        }
        .btn-primary:hover:not(:disabled) { background:var(--accent2); transform:translateY(-1px); }
        .btn-primary:disabled { opacity:.6; cursor:not-allowed; }
        .auth-footer { text-align:center; margin-top:24px; font-size:14px; color:var(--muted); }
        .link { color:var(--accent); font-weight:600; }
      `}</style>
    </div>
  );
}
