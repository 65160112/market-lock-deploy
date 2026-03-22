import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  available:   { label: 'ว่าง',        color: '#22c55e', bg: '#22c55e18', border: '#22c55e40' },
  pending:     { label: 'รอชำระเงิน',  color: '#f59e0b', bg: '#f59e0b18', border: '#f59e0b40' },
  occupied:    { label: 'มีผู้เช่า',   color: '#ef4444', bg: '#ef444418', border: '#ef444440' },
  maintenance: { label: 'ซ่อมบำรุง',   color: '#64748b', bg: '#64748b18', border: '#64748b40' },
};

export default function MapPage() {
  const [locks, setLocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/locks/map').then(res => {
      setLocks(res.data);
      setLoading(false);
    });
  }, []);

  const zones = [...new Set(locks.map(l => l.zone))].sort();
  const filtered = filter === 'all' ? locks : locks.filter(l => l.status === filter);

  const stats = {
    total: locks.length,
    available: locks.filter(l => l.status === 'available').length,
    occupied:  locks.filter(l => l.status === 'occupied').length,
    pending:   locks.filter(l => l.status === 'pending').length,
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">แผนผังล็อคตลาด</h2>
          <p className="page-sub">คลิกที่ล็อคที่ว่างเพื่อทำการจอง</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {[
          { label:'ล็อคทั้งหมด', value: stats.total, color:'#f59e0b' },
          { label:'ว่าง',        value: stats.available, color:'#22c55e' },
          { label:'มีผู้เช่า',   value: stats.occupied,  color:'#ef4444' },
          { label:'รอชำระเงิน', value: stats.pending,   color:'#f59e0b' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{'--c': s.color}}>
            <div className="stat-val">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Legend & Filter */}
      <div className="toolbar">
        <div className="legend">
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <div key={k} className="legend-item">
              <span className="legend-dot" style={{background: v.color}} />
              {v.label}
            </div>
          ))}
        </div>
        <div className="filter-tabs">
          {['all','available','pending','occupied','maintenance'].map(s => (
            <button key={s} className={`filter-tab ${filter===s?'active':''}`}
              onClick={() => setFilter(s)}>
              {s === 'all' ? 'ทั้งหมด' : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map by Zone */}
      {loading ? (
        <div className="loading-center">⏳ กำลังโหลดแผนผัง...</div>
      ) : (
        zones.map(zone => {
          const zoneLocks = filtered.filter(l => l.zone === zone);
          if (!zoneLocks.length) return null;
          return (
            <div key={zone} className="zone-section">
              <div className="zone-header">โซน {zone}</div>
              <div className="lock-grid">
                {zoneLocks.map(lock => {
                  const cfg = STATUS_CONFIG[lock.status];
                  return (
                    <div key={lock.id}
                      className={`lock-cell ${lock.status} ${selected?.id===lock.id?'sel':''}`}
                      style={{'--lc': cfg.color, '--lb': cfg.bg, '--lbr': cfg.border}}
                      onClick={() => {
                        if (lock.status === 'available') {
                          setSelected(lock);
                        }
                      }}>
                      <div className="lock-num">{lock.zone}{lock.lock_number}</div>
                      <div className="lock-size">{lock.size}</div>
                      <div className="lock-price">฿{Number(lock.price_per_month).toLocaleString()}/เดือน</div>
                      <div className="lock-status">{cfg.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">ล็อค {selected.zone}{selected.lock_number}</h3>
            <div className="modal-info">
              <div className="info-row"><span>โซน</span><strong>{selected.zone}</strong></div>
              <div className="info-row"><span>หมายเลข</span><strong>{selected.lock_number}</strong></div>
              <div className="info-row"><span>ขนาด</span><strong>{selected.size || '-'}</strong></div>
              <div className="info-row"><span>ราคา/เดือน</span><strong className="price">฿{Number(selected.price_per_month).toLocaleString()}</strong></div>
              {selected.description && (
                <div className="info-row"><span>รายละเอียด</span><strong>{selected.description}</strong></div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setSelected(null)}>ยกเลิก</button>
              <button className="btn-book" onClick={() => navigate(`/booking/${selected.id}`)}>
                จองล็อคนี้ →
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; }
        .page-title { font-size:26px; margin-bottom:4px; }
        .page-sub { color:var(--muted); font-size:14px; }
        .stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
        .stat-card {
          background:var(--bg2); border:1px solid var(--border); border-radius:14px;
          padding:20px 24px; border-left:3px solid var(--c);
        }
        .stat-val { font-size:32px; font-weight:700; color:var(--c); font-family:'Prompt',sans-serif; }
        .stat-label { font-size:13px; color:var(--muted); margin-top:2px; }
        .toolbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
        .legend { display:flex; gap:16px; flex-wrap:wrap; }
        .legend-item { display:flex; align-items:center; gap:6px; font-size:13px; color:var(--muted); }
        .legend-dot { width:10px; height:10px; border-radius:50%; }
        .filter-tabs { display:flex; gap:6px; }
        .filter-tab {
          padding:7px 14px; border-radius:8px; border:1px solid var(--border);
          background:transparent; color:var(--muted); font-size:13px; transition:all .2s;
        }
        .filter-tab:hover, .filter-tab.active {
          background:var(--bg3); color:var(--text); border-color:var(--accent);
        }
        .zone-section { margin-bottom:32px; }
        .zone-header {
          font-family:'Prompt',sans-serif; font-size:18px; font-weight:600;
          color:var(--accent); margin-bottom:12px;
          padding-bottom:8px; border-bottom:1px solid var(--border);
        }
        .lock-grid { display:flex; flex-wrap:wrap; gap:12px; }
        .lock-cell {
          background:var(--lb); border:1px solid var(--lbr);
          border-radius:12px; padding:14px 16px; min-width:130px;
          transition:all .2s; position:relative;
        }
        .lock-cell.available { cursor:pointer; }
        .lock-cell.available:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,0.3); border-color:var(--lc); }
        .lock-cell.sel { box-shadow:0 0 0 2px var(--lc); }
        .lock-num { font-family:'Prompt',sans-serif; font-size:18px; font-weight:700; color:var(--lc); }
        .lock-size { font-size:12px; color:var(--muted); margin:2px 0; }
        .lock-price { font-size:13px; font-weight:600; color:var(--text); }
        .lock-status {
          display:inline-block; margin-top:6px; padding:2px 8px;
          border-radius:20px; font-size:11px; font-weight:600;
          background:var(--lb); color:var(--lc); border:1px solid var(--lbr);
        }
        .loading-center { text-align:center; padding:60px; color:var(--muted); font-size:16px; }
        .modal-overlay {
          position:fixed; inset:0; background:rgba(0,0,0,0.7);
          display:flex; align-items:center; justify-content:center; z-index:200; padding:24px;
        }
        .modal-box {
          background:var(--bg2); border:1px solid var(--border);
          border-radius:20px; padding:36px; width:100%; max-width:400px;
          box-shadow:var(--shadow); animation:fadeIn .25s ease;
        }
        .modal-title { font-size:22px; margin-bottom:20px; color:var(--accent); }
        .modal-info { display:flex; flex-direction:column; gap:10px; margin-bottom:28px; }
        .info-row { display:flex; justify-content:space-between; font-size:15px; }
        .info-row span { color:var(--muted); }
        .price { color:var(--accent); font-size:18px; }
        .modal-actions { display:flex; gap:10px; }
        .btn-ghost {
          flex:1; padding:12px; border-radius:10px; border:1px solid var(--border);
          background:transparent; color:var(--muted); font-size:15px; transition:all .2s;
        }
        .btn-ghost:hover { border-color:var(--text); color:var(--text); }
        .btn-book {
          flex:2; padding:12px; border-radius:10px; border:none;
          background:var(--accent); color:#000; font-size:15px; font-weight:700; transition:all .2s;
        }
        .btn-book:hover { background:var(--accent2); }
        @media(max-width:600px) {
          .stats-row { grid-template-columns:repeat(2,1fr); }
        }
      `}</style>
    </div>
  );
}
