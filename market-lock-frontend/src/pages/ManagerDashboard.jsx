import React, { useEffect, useState } from 'react';
import api from '../api';

const TABS = ['ภาพรวม', 'การจองทั้งหมด', 'ตรวจสอบการจอง'];

export default function ManagerDashboard() {
  const [tab, setTab] = useState(0);
  const [stats, setStats]       = useState(null);
  const [monthly, setMonthly]   = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [note, setNote]         = useState('');

  useEffect(() => {
    api.get('/bookings/stats').then(r => { setStats(r.data.stats); setMonthly(r.data.monthly); });
    api.get('/bookings').then(r => setBookings(r.data));
    api.get('/payments/pending').then(r => setPayments(r.data));
  }, []);

  const verifyPayment = async (id, status) => {
    if (status === 'rejected' && !note.trim()) {
      return alert('กรุณากรอกหมายเหตุแจ้งผู้เช่าก่อนปฏิเสธ');
    }

    try {
      await api.patch(`/payments/${id}/verify`, { status, admin_note: status === 'rejected' ? note.trim() : '' });
      setPayments(p => p.filter(x => x.id !== id));
      setNote('');
      alert(status === 'approved' ? '✅ อนุมัติแล้ว' : '❌ ปฏิเสธแล้ว');
    } catch (e) { alert('เกิดข้อผิดพลาด'); }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      setBookings(b => b.map(x => x.id === id ? {...x, status} : x));
      alert('อัปเดตสถานะสำเร็จ');
    } catch (e) { alert('เกิดข้อผิดพลาด'); }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>แดชบอร์ดผู้จัดการ</h1>
        <div className="tab-buttons">
          {TABS.map((t, i) => (
            <button key={i} className={tab === i ? 'tab-active' : 'tab'} onClick={() => setTab(i)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-content">
        {tab === 0 && stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">{stats.total_bookings}</div>
                <div className="stat-label">การจองทั้งหมด</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-value">{stats.confirmed}</div>
                <div className="stat-label">อนุมัติแล้ว</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <div className="stat-value">{stats.pending}</div>
                <div className="stat-label">รอตรวจสอบ</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-value">฿{stats.total_revenue?.toLocaleString()}</div>
                <div className="stat-label">รายได้รวม</div>
              </div>
            </div>
          </div>
        )}

        {tab === 1 && (
          <div className="data-table">
            <h3>การจองทั้งหมด</h3>
            <table>
              <thead>
                <tr>
                  <th>รหัส</th>
                  <th>ผู้ใช้</th>
                  <th>ล็อค</th>
                  <th>ช่วงเวลาจอง</th>
                  <th>สถานะ</th>
                  <th>หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.user_name}</td>
                    <td>{b.zone}{b.lock_number}</td>
                    <td>{new Date(b.start_date).toLocaleDateString('th-TH')} - {new Date(b.end_date).toLocaleDateString('th-TH')}</td>
                    <td>
                      <span className={`status status-${b.status}`}>
                        {b.status === 'pending' ? 'รอตรวจสอบ' :
                         b.status === 'confirmed' ? 'อนุมัติ' :
                         b.status === 'rejected' ? 'ปฏิเสธ' : 'ยกเลิก'}
                      </span>
                    </td>
                    <td>{b.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 2 && (
          <div className="data-table">
            <h3>ตรวจสอบการจอง</h3>
            <div className="note-input">
              <label>หมายเหตุเมื่อปฏิเสธ:</label>
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="กรอกหมายเหตุแจ้งผู้เช่าเมื่อปฏิเสธ" />
            </div>
            <table>
              <thead>
                <tr>
                  <th>รหัส</th>
                  <th>ผู้ใช้</th>
                  <th>จำนวนเงิน</th>
                  <th>วันที่อัปโหลด</th>
                  <th>หมายเหตุการจอง</th>
                  <th>สลิป</th>
                  <th>ดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.user_name}</td>
                    <td>฿{p.amount?.toLocaleString()}</td>
                    <td>{new Date(p.uploaded_at).toLocaleDateString('th-TH')}</td>
                    <td>{p.booking_note || '-'}</td>
                    <td>
                      <a href={p.slip_image} target="_blank" rel="noopener noreferrer">
                        ดูสลิป
                      </a>
                    </td>
                    <td>
                      <button className="btn-approve" onClick={() => verifyPayment(p.id, 'approved')}>
                        อนุมัติ
                      </button>
                      <button className="btn-reject" onClick={() => verifyPayment(p.id, 'rejected')}>
                        ปฏิเสธ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .dashboard { padding: 32px 24px 48px; max-width: 1200px; margin: 0 auto; background: #f8f9fa; min-height: 100vh; }
        .dashboard-header { margin-bottom: 32px; }
        .dashboard-header h1 { margin: 0 0 16px 0; color: #10b981; font-family: var(--font-sans); font-weight: 700; font-size: 28px; }
        .tab-buttons { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 24px; }
        .tab, .tab-active { padding: 12px 20px; border: 2px solid #e5e7eb; border-radius: 12px; background: white; cursor: pointer; transition: all .3s; color: #666666; font-family: 'Sarabun', sans-serif; font-weight: 600; }
        .tab:hover { border-color: #10b981; color: #10b981; }
        .tab-active { background: #10b981; color: white; border-color: #10b981; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .stat-card { background: white; border: 2px solid #10b981; border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 8px rgba(16,185,129,0.1); }
        .stat-icon { font-size: 36px; }
        .stat-value { font-size: 28px; font-weight: 700; color: #10b981; font-family: var(--font-sans); }
        .stat-label { color: #666666; font-size: 14px; font-weight: 500; }
        .data-table { background: white; border: 2px solid #e5e7eb; border-radius: 16px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .data-table h3 { margin: 0 0 20px 0; color: #10b981; font-family: var(--font-sans); font-size: 18px; font-weight: 700; }
        .data-table table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { padding: 14px 16px; border-bottom: 1px solid #e5e7eb; text-align: left; font-family: 'Sarabun', sans-serif; }
        .data-table td { color: #1a1a1a; font-size: 14px; }
        .data-table th { background: #f9fafb; font-weight: 700; color: #666666; font-size: 12px; }
        .data-table tr:last-child td { border-bottom: none; }
        .data-table tr:hover td { background: #f9fafb; }
        .status { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .status-pending { background: #fef3c7; color: #b45309; }
        .status-approved { background: #dcfce7; color: #166534; }
        .status-confirmed { background: #dcfce7; color: #166534; }
        .status-rejected { background: #fee2e2; color: #991b1b; }
        .status-cancelled { background: #f3f4f6; color: #666666; }
        .status-available { background: #dcfce7; color: #166534; }
        .status-occupied { background: #fee2e2; color: #991b1b; }
        .btn-approve { background: #10b981; color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; margin-right: 8px; font-family: 'Sarabun', sans-serif; font-weight: 600; transition: all .3s; }
        .btn-approve:hover { background: #059669; box-shadow: 0 2px 8px rgba(16,185,129,0.3); }
        .btn-reject { background: #ef4444; color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-family: 'Sarabun', sans-serif; font-weight: 600; transition: all .3s; }
        .btn-reject:hover { background: #dc2626; box-shadow: 0 2px 8px rgba(239,68,68,0.3); }
        .btn-edit { background: #fbbf24; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; margin-right: 4px; }
        .btn-delete { background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
        .btn-primary { background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-bottom: 16px; font-family: 'Sarabun', sans-serif; font-weight: 600; transition: all .3s; }
        .btn-primary:hover { background: #059669; box-shadow: 0 4px 12px rgba(16,185,129,0.4); }
        .note-input { margin-bottom: 20px; }
        .note-input label { display: block; margin-bottom: 8px; color: #1a1a1a; font-weight: 600; font-family: 'Sarabun', sans-serif; }
        .note-input input { width: 100%; padding: 12px 14px; border: 2px solid #e5e7eb; border-radius: 10px; background: white; color: #1a1a1a; font-family: 'Sarabun', sans-serif; transition: all .3s; }
        .note-input input:focus { outline: none; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal { background: white; border: 2px solid #10b981; border-radius: 16px; padding: 28px; width: 90%; max-width: 500px; box-shadow: 0 20px 25px rgba(0,0,0,0.15); }
        .modal h3 { margin: 0 0 20px 0; color: #10b981; font-family: var(--font-sans); font-size: 20px; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; margin-bottom: 8px; color: #1a1a1a; font-weight: 600; font-family: 'Sarabun', sans-serif; }
        .form-group input, .form-group textarea { width: 100%; padding: 12px 14px; border: 2px solid #e5e7eb; border-radius: 10px; background: white; color: #1a1a1a; font-family: 'Sarabun', sans-serif; transition: all .3s; }
        .form-group input:focus, .form-group textarea:focus { outline: none; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
        .modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 24px; }
        .btn-secondary { background: white; border: 2px solid #e5e7eb; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-family: 'Sarabun', sans-serif; font-weight: 600; color: #666666; transition: all .3s; }
        .btn-secondary:hover { border-color: #10b981; color: #10b981; }
      `}</style>
    </div>
  );
}