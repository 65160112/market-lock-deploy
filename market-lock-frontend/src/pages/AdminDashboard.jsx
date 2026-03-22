import React, { useEffect, useState } from 'react';
import api from '../api';

const TABS = ['ภาพรวม', 'การจองทั้งหมด', 'ตรวจสอบสลิป', 'จัดการล็อค'];

export default function AdminDashboard() {
  const [tab, setTab] = useState(0);
  const [stats, setStats]       = useState(null);
  const [monthly, setMonthly]   = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [locks, setLocks]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [note, setNote]         = useState('');

  useEffect(() => {
    api.get('/bookings/stats').then(r => { setStats(r.data.stats); setMonthly(r.data.monthly); });
    api.get('/bookings').then(r => setBookings(r.data));
    api.get('/payments/pending').then(r => setPayments(r.data));
    api.get('/locks').then(r => setLocks(r.data));
  }, []);

  const verifyPayment = async (id, status) => {
    try {
      await api.patch(`/payments/${id}/verify`, { status, admin_note: note });
      setPayments(p => p.filter(x => x.id !== id));
      alert(status === 'approved' ? '✅ อนุมัติแล้ว' : '❌ ปฏิเสธแล้ว');
    } catch (e) { alert('เกิดข้อผิดพลาด'); }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      setBookings(b => b.map(x => x.id===id ? {...x, status} : x));
    } catch (e) { alert('เกิดข้อผิดพลาด'); }
  };

  const maxRevenue = Math.max(...monthly.map(m => m.revenue), 1);

  return (
    <div className="fade-in">
      <h2 className="page-title" style={{marginBottom:24}}>แดชบอร์ดผู้ดูแลระบบ</h2>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map((t,i) => (
          <button key={i} className={`tab ${tab===i?'active':''}`} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      {/* Tab 0: ภาพรวม */}
      {tab === 0 && stats && (
        <div>
          <div className="stats-grid">
            {[
              { label:'การจองทั้งหมด',  value: stats.total_bookings, color:'#f59e0b' },
              { label:'ยืนยันแล้ว',     value: stats.confirmed,      color:'#22c55e' },
              { label:'รอดำเนินการ',   value: stats.pending,        color:'#3b82f6' },
              { label:'ยกเลิก',        value: stats.cancelled,      color:'#ef4444' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{'--c': s.color}}>
                <div className="stat-val">{s.value}</div>
                <div className="stat-lbl">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="revenue-card">
            <div className="revenue-header">
              <h3>รายได้สะสม</h3>
              <span className="revenue-total">฿{Number(stats.total_revenue||0).toLocaleString()}</span>
            </div>
            <div className="chart">
              {monthly.slice(0,6).reverse().map(m => (
                <div key={m.month} className="bar-col">
                  <div className="bar-val">฿{Number(m.revenue/1000).toFixed(1)}k</div>
                  <div className="bar" style={{height: `${(m.revenue/maxRevenue)*140}px`}} />
                  <div className="bar-label">{m.month.slice(5)}/{m.month.slice(2,4)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: การจองทั้งหมด */}
      {tab === 1 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th><th>ผู้จอง</th><th>ล็อค</th>
                <th>วันที่จอง</th><th>ราคา</th><th>สถานะ</th><th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.user_name}<br/><span className="sub">{b.user_email}</span></td>
                  <td><strong>{b.zone}{b.lock_number}</strong></td>
                  <td>{new Date(b.created_at).toLocaleDateString('th-TH')}</td>
                  <td>฿{Number(b.total_price).toLocaleString()}</td>
                  <td><span className={`badge badge-${b.status}`}>{
                    {pending:'รอชำระ', confirmed:'ยืนยัน', cancelled:'ยกเลิก'}[b.status]
                  }</span></td>
                  <td>
                    {b.status === 'pending' && (
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn-sm btn-success" onClick={() => updateBookingStatus(b.id,'confirmed')}>ยืนยัน</button>
                        <button className="btn-sm btn-danger"  onClick={() => updateBookingStatus(b.id,'cancelled')}>ยกเลิก</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: ตรวจสลิป */}
      {tab === 2 && (
        <div>
          {payments.length === 0 ? (
            <div className="empty-state">✅ ไม่มีสลิปรอตรวจสอบ</div>
          ) : (
            <div className="slip-grid">
              {payments.map(p => (
                <div key={p.id} className="slip-card">
                  <div className="slip-header">
                    <strong>การจอง #{p.booking_id}</strong>
                    <span className="slip-amount">฿{Number(p.amount).toLocaleString()}</span>
                  </div>
                  <div className="slip-info">
                    <div className="info-row-s"><span>ผู้โอน</span><strong>{p.user_name}</strong></div>
                    <div className="info-row-s"><span>ล็อค</span><strong>{p.zone}{p.lock_number}</strong></div>
                    <div className="info-row-s"><span>ธนาคาร</span><strong>{p.bank_name}</strong></div>
                    <div className="info-row-s"><span>โอนเมื่อ</span><strong>{p.transferred_at ? new Date(p.transferred_at).toLocaleString('th-TH') : '-'}</strong></div>
                  </div>
                  {p.slip_image && (
                    <a href={`http://localhost:3000/uploads/slips/${p.slip_image}`} target="_blank" rel="noreferrer"
                      className="slip-img-link">🖼 ดูสลิป</a>
                  )}
                  <textarea
                    className="note-input" rows={2} placeholder="หมายเหตุ (ไม่บังคับ)"
                    onChange={e => setNote(e.target.value)}
                  />
                  <div className="slip-actions">
                    <button className="btn-approve" onClick={() => verifyPayment(p.id,'approved')}>✅ อนุมัติ</button>
                    <button className="btn-reject"  onClick={() => verifyPayment(p.id,'rejected')}>❌ ปฏิเสธ</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: จัดการล็อค */}
      {tab === 3 && (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr><th>ล็อค</th><th>ขนาด</th><th>ราคา/เดือน</th><th>สถานะ</th><th>ผู้เช่า</th></tr>
            </thead>
            <tbody>
              {locks.map(l => (
                <tr key={l.id}>
                  <td><strong>{l.zone}{l.lock_number}</strong></td>
                  <td>{l.size || '-'}</td>
                  <td>฿{Number(l.price_per_month).toLocaleString()}</td>
                  <td><span className={`badge badge-lock-${l.status}`}>
                    {{available:'ว่าง', pending:'รอชำระ', occupied:'มีผู้เช่า', maintenance:'ซ่อมบำรุง'}[l.status]}
                  </span></td>
                  <td className="sub">{l.zone_owner_name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .page-title { font-size:26px; }
        .tabs { display:flex; gap:4px; margin-bottom:24px; border-bottom:1px solid var(--border); padding-bottom:0; }
        .tab {
          padding:10px 20px; background:transparent; border:none; color:var(--muted);
          font-size:15px; font-weight:500; cursor:pointer; border-bottom:2px solid transparent;
          transition:all .2s; margin-bottom:-1px;
        }
        .tab:hover { color:var(--text); }
        .tab.active { color:var(--accent); border-bottom-color:var(--accent); }

        .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
        .stat-card {
          background:var(--bg2); border:1px solid var(--border);
          border-radius:14px; padding:20px 24px; border-top:3px solid var(--c);
        }
        .stat-val { font-size:36px; font-weight:700; color:var(--c); font-family:'Prompt',sans-serif; }
        .stat-lbl { font-size:13px; color:var(--muted); margin-top:4px; }

        .revenue-card {
          background:var(--bg2); border:1px solid var(--border);
          border-radius:16px; padding:28px;
        }
        .revenue-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
        .revenue-header h3 { font-size:18px; }
        .revenue-total { font-size:24px; color:var(--accent); font-family:'Prompt',sans-serif; font-weight:700; }
        .chart { display:flex; gap:16px; align-items:flex-end; height:180px; }
        .bar-col { display:flex; flex-direction:column; align-items:center; gap:6px; flex:1; }
        .bar-val { font-size:11px; color:var(--muted); }
        .bar {
          width:100%; background:linear-gradient(to top, var(--accent), var(--accent2));
          border-radius:6px 6px 0 0; min-height:4px; transition:height .4s ease;
        }
        .bar-label { font-size:12px; color:var(--muted); }

        .table-card { background:var(--bg2); border:1px solid var(--border); border-radius:16px; overflow:hidden; }
        .data-table { width:100%; border-collapse:collapse; }
        .data-table th {
          padding:14px 16px; text-align:left; font-size:13px;
          color:var(--muted); font-weight:600; background:var(--bg3);
          border-bottom:1px solid var(--border);
        }
        .data-table td {
          padding:14px 16px; font-size:14px;
          border-bottom:1px solid var(--border);
        }
        .data-table tr:last-child td { border-bottom:none; }
        .data-table tr:hover td { background:var(--bg3); }
        .sub { color:var(--muted); font-size:12px; }

        .badge {
          display:inline-block; padding:3px 10px; border-radius:20px;
          font-size:12px; font-weight:600;
        }
        .badge-pending   { background:#3b82f622; color:#60a5fa; }
        .badge-confirmed { background:#22c55e22; color:#86efac; }
        .badge-cancelled { background:#ef444422; color:#fca5a5; }
        .badge-lock-available   { background:#22c55e22; color:#86efac; }
        .badge-lock-pending     { background:#f59e0b22; color:#fcd34d; }
        .badge-lock-occupied    { background:#ef444422; color:#fca5a5; }
        .badge-lock-maintenance { background:#64748b22; color:#94a3b8; }

        .btn-sm {
          padding:5px 12px; border-radius:6px; border:none; font-size:12px;
          font-weight:600; cursor:pointer; transition:all .2s;
        }
        .btn-success { background:#22c55e22; color:#86efac; }
        .btn-success:hover { background:#22c55e44; }
        .btn-danger  { background:#ef444422; color:#fca5a5; }
        .btn-danger:hover  { background:#ef444444; }

        .slip-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:16px; }
        .slip-card {
          background:var(--bg2); border:1px solid var(--border);
          border-radius:16px; padding:20px;
        }
        .slip-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
        .slip-amount { color:var(--accent); font-size:18px; font-weight:700; }
        .slip-info { display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
        .info-row-s { display:flex; justify-content:space-between; font-size:13px; }
        .info-row-s span { color:var(--muted); }
        .slip-img-link {
          display:block; text-align:center; padding:8px;
          background:var(--bg3); border-radius:8px; color:var(--accent);
          font-size:13px; margin-bottom:12px; transition:background .2s;
        }
        .slip-img-link:hover { background:var(--border); }
        .note-input {
          width:100%; padding:10px; background:var(--bg3); border:1px solid var(--border);
          border-radius:8px; color:var(--text); font-size:13px; resize:none;
          margin-bottom:12px; font-family:'Sarabun',sans-serif;
        }
        .note-input:focus { outline:none; border-color:var(--accent); }
        .slip-actions { display:flex; gap:8px; }
        .btn-approve, .btn-reject {
          flex:1; padding:10px; border-radius:8px; border:none;
          font-size:14px; font-weight:700; cursor:pointer; transition:all .2s;
        }
        .btn-approve { background:#22c55e22; color:#86efac; }
        .btn-approve:hover { background:#22c55e44; }
        .btn-reject  { background:#ef444422; color:#fca5a5; }
        .btn-reject:hover  { background:#ef444444; }

        .empty-state {
          text-align:center; padding:60px; color:var(--muted);
          background:var(--bg2); border:1px solid var(--border);
          border-radius:16px; font-size:16px;
        }
        @media(max-width:700px) {
          .stats-grid { grid-template-columns:repeat(2,1fr); }
        }
      `}</style>
    </div>
  );
}
