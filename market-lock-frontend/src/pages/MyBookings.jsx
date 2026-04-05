import React, { useEffect, useState } from 'react';
import api from '../api';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    if (!confirm('คุณต้องการยกเลิกการจองนี้หรือไม่?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      loadBookings(); // Refresh รายการ
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการยกเลิกการจอง');
      console.error('Error canceling booking:', err);
    }
  };

  if (loading) {
    return <div className="loading-center">กำลังโหลด...</div>;
  }

  return (
    <div className="page">
      <h2 className="page-title" style={{marginBottom: 24}}>ประวัติการจองของฉัน</h2>

      {bookings.length === 0 ? (
        <div className="empty-state">📋 คุณยังไม่มีประวัติการจอง</div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>ล็อค</th>
                <th>วันที่จอง</th>
                <th>ระยะเวลา</th>
                <th>ราคา</th>
                <th>สถานะ</th>
                <th>หมายเหตุจากผู้จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td>
                    <strong>{b.zone}{b.lock_number}</strong>
                    <br />
                    <span className="sub">{b.size || '-'}</span>
                  </td>
                  <td>{new Date(b.created_at).toLocaleDateString('th-TH')}</td>
                  <td>
                    {new Date(b.start_date).toLocaleDateString('th-TH')}
                    <br />
                    <span className="sub">ถึง {new Date(b.end_date).toLocaleDateString('th-TH')}</span>
                  </td>
                  <td className="price-text">฿{Number(b.total_price).toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${b.status}`}>
                      {{
                        pending: 'รอชำระ',
                        approved: 'อนุมัติ',
                        confirmed: 'ยืนยัน',
                        rejected: 'ปฏิเสธ',
                        cancelled: 'ยกเลิก'
                      }[b.status] || b.status}
                    </span>
                  </td>
                  <td>
                    {b.status === 'pending' ? (
                      <button 
                        className="btn-cancel"
                        onClick={() => cancelBooking(b.id)}
                      >
                        ยกเลิก
                      </button>
                    ) : (
                      <span className="manager-note">{b.manager_note || '-'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .page { max-width: 1200px; margin: 0 auto; padding: 32px 24px; background: #f8f9fa; min-height: 100vh; color: #1a1a1a; }
        .page-title { font-size: 28px; font-family: var(--font-sans); color: #10b981; margin-bottom: 24px; font-weight: 700; }
        .loading-center { text-align: center; padding: 60px; color: #999999; font-family: 'Sarabun', sans-serif; font-size: 16px; }
        .empty-state { text-align: center; padding: 60px; color: #666666; background: #f0fdf4; border: 2px solid #10b981; border-radius: 16px; font-size: 16px; font-family: 'Sarabun', sans-serif; font-weight: 500; }
        .table-card { background: white; border: 2px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th { padding: 16px 18px; text-align: left; font-size: 12px; color: #666666; font-weight: 700; background: #f9fafb; border-bottom: 2px solid #e5e7eb; font-family: 'Sarabun', sans-serif; }
        .data-table td { padding: 16px 18px; font-size: 14px; border-bottom: 1px solid #f0f0f0; font-family: 'Sarabun', sans-serif; color: #1a1a1a; }
        .data-table tr:nth-child(even) td { background: #f9fafb; }
        .data-table tr:last-child td { border-bottom: none; }
        .data-table tr:hover td { background: #f0fdf4; }
        .sub { color: #999999; font-size: 12px; font-weight: 500; }
        .price-text { color: #10b981; font-weight: 700; }
        .badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .badge-pending { background: #fef3c7; color: #b45309; border: 1px solid #fbbf24; }
        .badge-approved { background: #dcfce7; color: #166534; border: 1px solid #10b981; }
        .badge-confirmed { background: #dcfce7; color: #166534; border: 1px solid #10b981; }
        .badge-rejected { background: #fee2e2; color: #991b1b; border: 1px solid #ef4444; }
        .badge-cancelled { background: #fee2e2; color: #991b1b; border: 1px solid #ef4444; }
        .btn-cancel { background: #ef4444; color: white; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; font-family: 'Sarabun', sans-serif; transition: all .3s; }
        .btn-cancel:hover { background: #dc2626; box-shadow: 0 2px 8px rgba(239,68,68,0.3); }
        .manager-note { display: block; color: #666666; background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 10px; padding: 10px 12px; font-size: 13px; }
        @media (max-width: 768px) { .data-table th, .data-table td { padding: 10px 12px; font-size: 12px; } }
      `}</style>
    </div>
  );
}