import React, { useEffect, useState } from 'react';
import api from '../api';

const TABS = ['จัดการล็อค', 'จัดการผู้ใช้'];

export default function AdminDashboard() {
  const [tab, setTab] = useState(0);
  const [locks, setLocks]       = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(false);

  // Modal states for new tabs
  const [showLockModal, setShowLockModal] = useState(false);
  const [editingLock, setEditingLock] = useState(null);
  const [lockForm, setLockForm] = useState({
    zone: '', lock_number: '', size: '', price_per_month: '', description: ''
  });

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    full_name: '', phone: '', role: '', password: ''
  });

  useEffect(() => {
    api.get('/locks').then(r => setLocks(r.data));
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  // Lock CRUD functions
  const openLockModal = (lock = null) => {
    if (lock) {
      setEditingLock(lock);
      setLockForm({
        zone: lock.zone,
        lock_number: lock.lock_number,
        size: lock.size || '',
        price_per_month: lock.price_per_month,
        description: lock.description || ''
      });
    } else {
      setEditingLock(null);
      setLockForm({ zone: '', lock_number: '', size: '', price_per_month: '', description: '' });
    }
    setShowLockModal(true);
  };

  const closeLockModal = () => {
    setShowLockModal(false);
    setEditingLock(null);
    setLockForm({ zone: '', lock_number: '', size: '', price_per_month: '', description: '' });
  };

  const handleLockSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLock) {
        await api.put(`/locks/${editingLock.id}`, lockForm);
        alert('✅ แก้ไขล็อคสำเร็จ');
      } else {
        await api.post('/locks', lockForm);
        alert('✅ เพิ่มล็อคสำเร็จ');
      }
      // Refresh locks
      const res = await api.get('/locks');
      setLocks(res.data);
      closeLockModal();
    } catch (err) {
      alert('❌ เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLockDelete = async (id) => {
    if (!confirm('คุณต้องการลบล็อคนี้ใช่หรือไม่?')) return;
    try {
      await api.delete(`/locks/${id}`);
      alert('✅ ลบล็อคสำเร็จ');
      // Refresh locks
      const res = await api.get('/locks');
      setLocks(res.data);
    } catch (err) {
      alert('❌ เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
    }
  };

  const openUserModal = (user) => {
    setEditingUser(user);
    setUserForm({ full_name: user.full_name, phone: user.phone || '', role: user.role, password: '' });
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    setUserForm({ full_name: '', phone: '', role: '', password: '' });
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { full_name: userForm.full_name, phone: userForm.phone, role: userForm.role };
      if (userForm.password) payload.password = userForm.password;
      await api.put(`/users/${editingUser.id}`, payload);
      alert('✅ แก้ไขข้อมูลผู้ใช้สำเร็จ');
      loadUsers();
      closeUserModal();
    } catch (err) {
      alert('❌ เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUserDelete = async (id) => {
    if (!confirm('คุณต้องการลบผู้ใช้นี้ใช่หรือไม่?')) return;
    try {
      await api.delete(`/users/${id}`);
      alert('✅ ลบผู้ใช้สำเร็จ');
      loadUsers();
    } catch (err) {
      alert('❌ เกิดข้อผิดพลาด: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="dashboard">
      <h2 className="page-title" style={{ marginBottom: 24 }}>แดชบอร์ดผู้ดูแลระบบ</h2>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map((t, i) => (
          <button key={i} className={`tab ${tab === i ? 'active' : ''}`} onClick={() => setTab(i)}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab 0: จัดการล็อค */}
      {tab === 0 && (
        <div>
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>ล็อคทั้งหมด</h3>
            <button className="btn-primary" onClick={() => openLockModal()}>
              ➕ เพิ่มล็อคใหม่
            </button>
          </div>
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ล็อค</th>
                  <th>ขนาด</th>
                  <th>ราคา/เดือน</th>
                  <th>สถานะ</th>
                  <th>ผู้เช่า</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {locks.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <strong>{l.zone}{l.lock_number}</strong>
                    </td>
                    <td>{l.size || '-'}</td>
                    <td>฿{Number(l.price_per_month).toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-lock-${l.status}`}>
                        {{ available: 'ว่าง', pending: 'รอชำระ', occupied: 'มีผู้เช่า', maintenance: 'ซ่อมบำรุง' }[l.status]}
                      </span>
                    </td>
                    <td className="sub">{l.zone_owner_name || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button className="btn-sm btn-edit" onClick={() => openLockModal(l)}>แก้ไข</button>
                        <button className="btn-sm btn-danger" onClick={() => handleLockDelete(l.id)}>ลบ</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 1: จัดการผู้ใช้ */}
      {tab === 1 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ชื่อ</th>
                <th>อีเมล</th>
                <th>บทบาท</th>
                <th>เบอร์โทร</th>
                <th>วันที่สมัคร</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.full_name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge badge-role-${u.role}`}>
                      {{ admin: 'ผู้ดูแล', manager: 'ผู้จัดการ', tenant: 'ผู้เช่า', vendor: 'พ่อค้า' }[u.role]}
                    </span>
                  </td>
                  <td>{u.phone || '-'}</td>
                  <td>{new Date(u.created_at).toLocaleDateString('th-TH')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-sm btn-edit" onClick={() => openUserModal(u)}>แก้ไข</button>
                      <button className="btn-sm btn-danger" onClick={() => handleUserDelete(u.id)}>ลบ</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lock Modal */}
      {showLockModal && (
        <div className="modal-overlay" onClick={closeLockModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{editingLock ? 'แก้ไขล็อค' : 'เพิ่มล็อคใหม่'}</h3>
            <form onSubmit={handleLockSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>โซน</label>
                  <input
                    type="text"
                    value={lockForm.zone}
                    onChange={(e) => setLockForm({ ...lockForm, zone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>หมายเลขล็อค</label>
                  <input
                    type="text"
                    value={lockForm.lock_number}
                    onChange={(e) => setLockForm({ ...lockForm, lock_number: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>ขนาด</label>
                  <input
                    type="text"
                    value={lockForm.size}
                    onChange={(e) => setLockForm({ ...lockForm, size: e.target.value })}
                    placeholder="เช่น 2x2 เมตร"
                  />
                </div>
                <div className="form-group">
                  <label>ราคา/เดือน (บาท)</label>
                  <input
                    type="number"
                    value={lockForm.price_per_month}
                    onChange={(e) => setLockForm({ ...lockForm, price_per_month: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>รายละเอียด</label>
                <textarea
                  value={lockForm.description}
                  onChange={(e) => setLockForm({ ...lockForm, description: e.target.value })}
                  rows={3}
                  placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeLockModal}>
                  ยกเลิก
                </button>
                <button type="submit" className="btn-primary">
                  {editingLock ? 'แก้ไข' : 'เพิ่ม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Edit Modal */}
      {showUserModal && (
        <div className="modal-overlay" onClick={closeUserModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">แก้ไขข้อมูลผู้ใช้</h3>
            <form onSubmit={handleUserSubmit}>
              <div className="form-group">
                <label>ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  value={userForm.full_name}
                  onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>เบอร์โทร</label>
                <input
                  type="text"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  placeholder="08xxxxxxxx"
                />
              </div>
              <div className="form-group">
                <label>บทบาท</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                >
                  <option value="vendor">พ่อค้า (vendor)</option>
                  <option value="manager">ผู้จัดการ (manager)</option>
                  <option value="admin">ผู้ดูแลระบบ (admin)</option>
                </select>
              </div>
              <div className="form-group">
                <label>รหัสผ่านใหม่ (ถ้าต้องการเปลี่ยน)</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="ปล่อยว่างถ้าไม่ต้องการเปลี่ยน"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeUserModal}>ยกเลิก</button>
                <button type="submit" className="btn-primary">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .dashboard { padding: 32px 24px 48px; max-width: 1200px; margin: 0 auto; background: #f8f9fa; min-height: 100vh; color: #1a1a1a; }
        .page-title { font-size: 28px; color: #10b981; font-family: var(--font-sans); font-weight: 700; }
        .tabs { display: flex; gap: 10px; margin-bottom: 28px; flex-wrap: wrap; }
        .tab { padding: 12px 20px; background: white; border: 2px solid #e5e7eb; color: #666666; font-size: 15px; font-weight: 600; cursor: pointer; border-radius: 12px; transition: all .3s; }
        .tab:hover { border-color: #10b981; color: #10b981; }
        .tab.active { color: white; background: #10b981; border-color: #10b981; }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px; }
        .stat-card { background: white; border: 2px solid #10b981; border-radius: 16px; padding: 24px; box-shadow: 0 2px 8px rgba(16,185,129,0.1); }
        .stat-val { font-size: 36px; font-weight: 700; color: #10b981; font-family: var(--font-sans); }
        .stat-lbl { font-size: 14px; color: #666666; margin-top: 6px; font-weight: 500; }

        .table-card { background: white; border: 2px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { padding: 16px 18px; text-align: left; font-size: 12px; color: #666666; font-weight: 700; background: #f9fafb; border-bottom: 2px solid #e5e7eb; }
        .data-table td { padding: 14px 18px; font-size: 14px; border-bottom: 1px solid #f0f0f0; color: #1a1a1a; }
        .data-table tr:last-child td { border-bottom: none; }
        .data-table tr:hover td { background: #f9fafb; }
        .sub { color: #999999; font-size: 12px; font-weight: 500; }

        .badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .badge-pending { background: #fef3c7; color: #b45309; }
        .badge-confirmed { background: #dcfce7; color: #166534; }
        .badge-cancelled { background: #fee2e2; color: #991b1b; }
        .badge-lock-available { background: #dcfce7; color: #166534; }
        .badge-lock-pending { background: #fef3c7; color: #b45309; }
        .badge-lock-occupied { background: #fee2e2; color: #991b1b; }
        .badge-lock-maintenance { background: #f3f4f6; color: #666666; }
        .badge-role-admin, .badge-role-tenant, .badge-role-vendor, .badge-role-manager { background: #dcfce7; color: #166534; }

        .btn-sm { padding: 8px 12px; border-radius: 8px; border: none; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .3s; font-family: 'Sarabun', sans-serif; }
        .btn-success { background: #10b981; color: white; }
        .btn-success:hover { background: #059669; box-shadow: 0 2px 8px rgba(16,185,129,0.3); }
        .btn-danger { background: #ef4444; color: white; }
        .btn-danger:hover { background: #dc2626; box-shadow: 0 2px 8px rgba(239,68,68,0.3); }
        .btn-edit { background: #e5e7eb; color: #666666; }
        .btn-edit:hover { background: #d1d5db; color: #1a1a1a; }

        .btn-primary { padding: 12px 20px; border-radius: 10px; border: none; background: #10b981; color: white; font-size: 14px; font-weight: 700; cursor: pointer; transition: all .3s; font-family: 'Sarabun', sans-serif; }
        .btn-primary:hover { background: #059669; box-shadow: 0 4px 12px rgba(16,185,129,0.4); }
        .btn-secondary { padding: 10px 20px; border-radius: 10px; border: 2px solid #e5e7eb; background: white; color: #666666; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .3s; font-family: 'Sarabun', sans-serif; }
        .btn-secondary:hover { border-color: #10b981; color: #10b981; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: white; border: 2px solid #10b981; border-radius: 18px; padding: 28px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px rgba(0,0,0,0.15); }
        .modal-title { font-size: 20px; font-weight: 700; margin-bottom: 24px; color: #10b981; font-family: var(--font-sans); }
        .form-row { display: flex; gap: 12px; margin-bottom: 16px; }
        .form-group { flex: 1; }
        .form-group label { display: block; margin-bottom: 8px; font-size: 14px; color: #1a1a1a; font-weight: 600; font-family: 'Sarabun', sans-serif; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 12px 14px; border: 2px solid #e5e7eb; border-radius: 10px; background: white; color: #1a1a1a; font-size: 14px; transition: all .3s; font-family: 'Sarabun', sans-serif; }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
        .form-group textarea { resize: vertical; min-height: 80px; }
        .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }

        @media(max-width:700px) {
          .stats-grid { grid-template-columns: 1fr; }
          .form-row { flex-direction: column; gap: 0; }
        }
      `}</style>
    </div>
  );
}
