import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  available:   { label: 'ว่าง',        color: '#16a34a', bg: '#f0fdf422', border: '#16a34a40' },
  pending:     { label: 'รอชำระเงิน',  color: '#f59e0b', bg: '#fef3c722', border: '#f59e0b40' },
  occupied:    { label: 'มีผู้เช่า',   color: '#ef4444', bg: '#fee2e222', border: '#ef444440' },
  maintenance: { label: 'ซ่อมบำรุง',   color: '#64748b', bg: '#f1f5f922', border: '#64748b40' },
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

  const isClientView = user?.role === 'vendor';
  const visibleLocks = isClientView
    ? locks.filter(l => l.status !== 'pending')
    : locks;

  useEffect(() => {
    if (isClientView && filter === 'pending') {
      setFilter('all');
    }
  }, [isClientView, filter]);

  const visibleStatusKeys = Object.keys(STATUS_CONFIG).filter(k => !(isClientView && k === 'pending'));
  const statusFilters = ['all', ...visibleStatusKeys];
  const visibleStatuses = visibleStatusKeys;

  const zones = [...new Set(visibleLocks.map(l => l.zone))].sort();
  const filtered = filter === 'all' ? visibleLocks : visibleLocks.filter(l => l.status === filter);

  const stats = {
    total: visibleLocks.length,
    available: visibleLocks.filter(l => l.status === 'available').length,
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
          { label:'ว่าง',        value: stats.available, color:'#16a34a' },
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
          {visibleStatuses.map((k) => {
            const v = STATUS_CONFIG[k];
            return (
              <div key={k} className="legend-item">
                <span className="legend-dot" style={{background: v.color}} />
                {v.label}
              </div>
            );
          })}
        </div>
        <div className="filter-tabs">
          {statusFilters.map(s => (
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
                        } else {
                          alert('ล็อคนี้ไม่ว่างในขณะนี้');
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
        .fade-in { background: #f8f9fa; color: #1a1a1a; min-height: 100vh; padding: 24px; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
        .page-title { font-size: 28px; margin-bottom: 4px; font-family: var(--font-sans); color: #1a1a1a; font-weight: 700; }
        .page-sub { color: #666666; font-size: 14px; font-family: 'Sarabun', sans-serif; }
        .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px; }
        .stat-card { background: white; border: 2px solid #10b981; border-radius: 16px; padding: 24px; box-shadow: 0 2px 8px rgba(16,185,129,0.1); }
        .stat-val { font-size: 36px; font-weight: 700; color: #10b981; font-family: var(--font-sans); }
        .stat-label { font-size: 14px; color: #666666; margin-top: 4px; font-weight: 500; }
        .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
        .legend { display: flex; gap: 20px; flex-wrap: wrap; }
        .legend-item { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #1a1a1a; font-family: 'Sarabun', sans-serif; font-weight: 500; }
        .legend-dot { width: 12px; height: 12px; border-radius: 50%; }
        .filter-tabs { display: flex; gap: 10px; flex-wrap: wrap; }
        .filter-tab { padding: 10px 16px; border-radius: 12px; border: 2px solid #e5e7eb; background: white; color: #666666; font-size: 14px; font-family: 'Sarabun', sans-serif; font-weight: 600; transition: all .3s; cursor: pointer; }
        .filter-tab:hover { border-color: #10b981; color: #10b981; }
        .filter-tab.active { background: #10b981; border-color: #10b981; color: white; }
        .zone-section { margin-bottom: 32px; }
        .zone-header { font-family: var(--font-sans); font-size: 18px; font-weight: 700; color: #10b981; margin-bottom: 16px; padding: 12px 0; }
        .lock-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
        .lock-cell { background: white; border: 2px solid #e5e7eb; border-radius: 16px; padding: 16px; min-height: 140px; transition: all .3s; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .lock-cell:hover { transform: translateY(-4px); border-color: #10b981; box-shadow: 0 8px 16px rgba(16,185,129,0.15); }
        .lock-cell.available { background: #f0fdf4 !important; border-color: #10b981 !important; }
        .lock-cell.pending { background: #fffbeb !important; border-color: #f59e0b !important; }
        .lock-cell.occupied { background: #fef2f2 !important; border-color: #ef4444 !important; }
        .lock-cell.maintenance { background: #f3f4f6 !important; border-color: #9ca3af !important; }
        .lock-num { font-family: var(--font-sans); font-size: 18px; font-weight: 700; color: #10b981; }
        .lock-size { font-size: 12px; color: #999999; margin: 6px 0; font-weight: 500; }
        .lock-price { font-size: 13px; font-weight: 700; color: #1a1a1a; }
        .lock-status { margin-top: 12px; display: inline-block; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
        .lock-cell.pending .lock-status { background: #fef3c7; color: #b45309; }
        .lock-cell.occupied .lock-status { background: #fee2e2; color: #991b1b; }
        .lock-cell.available .lock-status { background: #dcfce7; color: #166534; }
        .lock-cell.maintenance .lock-status { background: #f0f0f0; color: #4b5563; }
        .loading-center { text-align: center; padding: 60px 24px; color: #999999; font-family: 'Sarabun', sans-serif; font-size: 16px; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; padding: 24px; z-index: 1000; }
        .modal-box { background: white; border: 2px solid #10b981; border-radius: 20px; padding: 32px; width: 100%; max-width: 420px; color: #1a1a1a; box-shadow: 0 20px 25px rgba(0,0,0,0.15); }
        .modal-title { font-size: 22px; margin-bottom: 24px; color: #10b981; font-family: var(--font-sans); font-weight: 700; }
        .modal-info { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
        .info-row { display: flex; justify-content: space-between; font-size: 14px; color: #1a1a1a; padding: 8px 0; }
        .info-row span { color: #999999; font-weight: 500; }
        .price { color: #10b981; font-weight: 700; }
        .modal-actions { display: flex; gap: 12px; }
        .btn-ghost, .btn-book { flex: 1; padding: 12px 16px; border-radius: 12px; font-size: 14px; font-family: 'Sarabun', sans-serif; font-weight: 700; transition: all .3s; cursor: pointer; border: 2px solid #e5e7eb; }
        .btn-ghost { background: white; color: #666666; }
        .btn-ghost:hover { border-color: #666666; color: #1a1a1a; }
        .btn-book { background: #10b981; color: white; border-color: #10b981; }
        .btn-book:hover { background: #059669; border-color: #059669; box-shadow: 0 4px 12px rgba(16,185,129,0.4); }
        @media(max-width:900px) { .stats-row, .lock-grid { grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}
