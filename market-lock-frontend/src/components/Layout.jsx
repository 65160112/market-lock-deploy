import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">🏪 ตลาดออนไลน์</div>
        <div className="nav-links">
          <NavLink to="/map" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            แผนผังล็อค
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
              แดชบอร์ด
            </NavLink>
          )}
        </div>
        <div className="nav-user">
          <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
          <span className="nav-name">{user?.full_name}</span>
          <button className="btn-logout" onClick={handleLogout}>ออกจากระบบ</button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>

      <style>{`
        .layout { min-height: 100vh; display: flex; flex-direction: column; }
        .navbar {
          display: flex; align-items: center; gap: 24px;
          padding: 0 32px; height: 64px;
          background: var(--bg2); border-bottom: 1px solid var(--border);
          position: sticky; top: 0; z-index: 100;
        }
        .nav-brand { font-family: 'Prompt',sans-serif; font-weight:700; font-size:18px; color:var(--accent); margin-right:auto; }
        .nav-links { display:flex; gap:4px; }
        .nav-link {
          padding: 8px 16px; border-radius:8px; color:var(--muted);
          font-weight:500; transition:all .2s;
        }
        .nav-link:hover { background:var(--bg3); color:var(--text); }
        .nav-link.active { background:var(--bg3); color:var(--accent); }
        .nav-user { display:flex; align-items:center; gap:12px; }
        .nav-name { font-size:14px; color:var(--muted); }
        .role-badge {
          padding:3px 10px; border-radius:20px; font-size:12px; font-weight:600;
        }
        .role-admin   { background:#7c3aed22; color:#a78bfa; border:1px solid #7c3aed44; }
        .role-tenant  { background:#0ea5e922; color:#38bdf8; border:1px solid #0ea5e944; }
        .role-vendor  { background:#22c55e22; color:#86efac; border:1px solid #22c55e44; }
        .btn-logout {
          padding:7px 16px; border-radius:8px; border:1px solid var(--border);
          background:transparent; color:var(--muted); font-size:13px; transition:all .2s;
        }
        .btn-logout:hover { border-color:var(--danger); color:var(--danger); }
        .main-content { flex:1; padding:32px; max-width:1400px; width:100%; margin:0 auto; }
      `}</style>
    </div>
  );
}
