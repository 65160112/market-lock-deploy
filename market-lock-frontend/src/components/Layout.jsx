import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { to: '/map', label: '🏪 แผนผังล็อค' },
  ];

  if (user?.role === 'vendor') {
    navItems.push({ to: '/my-bookings', label: '📋 การจองของฉัน' });
  }
  if (user?.role === 'manager') {
    navItems.push({ to: '/manager', label: '📊 แดชบอร์ด' });
  }
  if (user?.role === 'admin') {
    navItems.push({ to: '/admin', label: '⚙️ แดชบอร์ด' });
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">
            <span className="brand-icon">🏪</span>
            <span className="brand-text">ตลาดออนไลน์</span>
          </div>
          <nav className="sidebar-nav">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
              >
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div>
            <div className="sidebar-user-name">{user?.full_name || 'ไม่ระบุชื่อ'}</div>
            <div className="sidebar-role">
              {user?.role === 'admin' ? 'ผู้ดูแล' : user?.role === 'manager' ? 'ผู้จัดการ' : 'ผู้ค้า'}
            </div>
          </div>
          <button className="btn-secondary btn-logout" onClick={handleLogout}>ออกจากระบบ</button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>

      <style>{`
        .layout { 
          display: flex; 
          min-height: 100vh; 
          background: var(--bg); 
          color: var(--text);
        }

        .sidebar { 
          width: 240px; 
          min-height: 100vh; 
          background: var(--sidebar-bg); 
          border-right: 2px solid var(--primary);
          display: flex; 
          flex-direction: column; 
          justify-content: space-between; 
          padding: 32px 20px;
          position: sticky;
          top: 0;
          box-shadow: var(--shadow-sm);
        }

        .sidebar-brand { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          margin-bottom: 32px; 
          font-size: 18px; 
          font-weight: 700; 
          color: var(--primary);
          padding: 12px;
          border-radius: var(--radius);
          background: var(--primary-light);
          transition: var(--transition);
        }

        .sidebar-brand:hover {
          background: var(--primary-lighter);
          box-shadow: var(--shadow);
        }

        .brand-icon { 
          font-size: 22px; 
        }

        .sidebar-nav { 
          display: flex; 
          flex-direction: column; 
          gap: 8px;
          flex: 1;
        }

        .sidebar-link { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          padding: 12px 14px; 
          font-size: 14px; 
          border-radius: var(--radius-sm); 
          color: var(--text-secondary); 
          transition: var(--transition);
          position: relative;
          overflow: hidden;
        }

        .sidebar-link::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          width: 3px;
          height: 100%;
          background: var(--primary);
          opacity: 0;
          transition: var(--transition);
        }

        .sidebar-link:hover { 
          background: var(--primary-light);
          color: var(--primary);
        }

        .sidebar-link.active { 
          background: var(--primary); 
          color: #ffffff;
          font-weight: var(--font-weight-bold);
          box-shadow: var(--shadow-sm);
        }

        .sidebar-link.active::before {
          opacity: 1;
        }

        .sidebar-footer { 
          display: flex; 
          flex-direction: column; 
          gap: 16px; 
          padding-top: 24px; 
          border-top: 2px solid var(--primary);
        }

        .sidebar-user-name { 
          font-size: 15px; 
          font-weight: 600; 
          color: var(--text);
          word-break: break-word;
        }

        .sidebar-role { 
          display: inline-flex; 
          align-items: center; 
          justify-content: center; 
          padding: 6px 12px; 
          border-radius: 999px; 
          background: var(--primary); 
          color: #ffffff; 
          font-size: 12px; 
          font-weight: 700;
          width: fit-content;
          box-shadow: var(--shadow-sm);
        }

        .btn-logout { 
          width: 100%;
        }

        .main-content { 
          flex: 1; 
          padding: 32px; 
          background: var(--bg);
          overflow-y: auto;
        }

        @media (max-width: 900px) {
          .layout { 
            flex-direction: column; 
          }
          
          .sidebar { 
            width: 100%; 
            min-height: auto; 
            padding: 16px; 
            position: sticky; 
            top: 0;
            z-index: 100;
            border-right: none;
            border-bottom: 2px solid var(--primary);
          }

          .sidebar-brand {
            margin-bottom: 0;
            flex: 1;
          }

          .sidebar-nav { 
            flex-direction: row; 
            overflow-x: auto;
            gap: 6px;
            margin: 16px 0;
          }

          .sidebar-link { 
            flex: 1 0 auto; 
            white-space: nowrap;
            padding: 10px 12px;
          }

          .sidebar-footer { 
            flex-direction: row;
            gap: 8px;
            padding: 0;
            border: none;
            align-items: center;
          }

          .sidebar-user-name {
            display: none;
          }

          .sidebar-role {
            margin-left: auto;
          }

          .btn-logout { 
            width: auto;
          }

          .main-content {
            padding: 20px;
          }
        }

        @media (max-width: 600px) {
          .sidebar {
            padding: 12px;
          }

          .main-content {
            padding: 16px;
          }

          .sidebar-nav {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .sidebar-link {
            font-size: 13px;
            padding: 8px 10px;
          }
        }
      `}</style>
    </div>
  );
}
