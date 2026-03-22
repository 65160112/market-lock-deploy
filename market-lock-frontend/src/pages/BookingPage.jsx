import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function BookingPage() {
  const { lockId } = useParams();
  const navigate = useNavigate();
  const [lock, setLock] = useState(null);
  const [step, setStep] = useState(1); // 1=กรอกข้อมูล, 2=อัปโหลดสลิป, 3=สำเร็จ
  const [bookingId, setBookingId] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [form, setForm] = useState({ start_date: '', end_date: '', note: '' });
  const [payment, setPayment] = useState({ bank_name: '', transferred_at: '', slip: null });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/locks/${lockId}`).then(res => setLock(res.data)).catch(() => navigate('/map'));
  }, [lockId]);

  // คำนวณราคา
  useEffect(() => {
    if (form.start_date && form.end_date && lock) {
      const s = new Date(form.start_date), e = new Date(form.end_date);
      const months = Math.max(1, (e.getFullYear()-s.getFullYear())*12 + (e.getMonth()-s.getMonth()));
      setTotalPrice(months * lock.price_per_month);
    }
  }, [form.start_date, form.end_date, lock]);

  const handleForm = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePay  = e => setPayment({ ...payment, [e.target.name]: e.target.value });

  const submitBooking = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/bookings', { lock_id: lockId, ...form });
      setBookingId(res.data.booking_id);
      setTotalPrice(res.data.total_price);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally { setLoading(false); }
  };

  const submitPayment = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const fd = new FormData();
      fd.append('booking_id', bookingId);
      fd.append('bank_name', payment.bank_name);
      fd.append('transferred_at', payment.transferred_at);
      fd.append('slip', payment.slip);
      await api.post('/payments', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally { setLoading(false); }
  };

  if (!lock) return <div className="loading-center">กำลังโหลด...</div>;

  return (
    <div className="booking-wrap fade-in">
      {/* Steps */}
      <div className="steps">
        {['กรอกข้อมูลจอง','แนบสลิปชำระเงิน','เสร็จสิ้น'].map((s,i) => (
          <div key={i} className={`step ${step===i+1?'active':''} ${step>i+1?'done':''}`}>
            <div className="step-num">{step>i+1?'✓':i+1}</div>
            <div className="step-label">{s}</div>
          </div>
        ))}
      </div>

      <div className="booking-body">
        {/* ข้อมูลล็อค */}
        <div className="lock-info-card">
          <div className="lock-badge">ล็อค {lock.zone}{lock.lock_number}</div>
          <div className="lock-detail-row"><span>ขนาด</span><strong>{lock.size || '-'}</strong></div>
          <div className="lock-detail-row"><span>ราคา</span><strong className="price-text">฿{Number(lock.price_per_month).toLocaleString()} / เดือน</strong></div>
          {lock.description && <div className="lock-desc">{lock.description}</div>}
          {totalPrice > 0 && (
            <div className="total-box">
              <span>ยอดรวมที่ต้องชำระ</span>
              <strong>฿{Number(totalPrice).toLocaleString()}</strong>
            </div>
          )}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="form-card">
            <h3>ข้อมูลการจอง</h3>
            {error && <div className="alert-error">{error}</div>}
            <form onSubmit={submitBooking}>
              <div className="field-row">
                <div className="field">
                  <label>วันที่เริ่มเช่า</label>
                  <input type="date" name="start_date" value={form.start_date} onChange={handleForm} required />
                </div>
                <div className="field">
                  <label>วันที่สิ้นสุด</label>
                  <input type="date" name="end_date" value={form.end_date} onChange={handleForm} required />
                </div>
              </div>
              <div className="field">
                <label>หมายเหตุ (ไม่บังคับ)</label>
                <textarea name="note" value={form.note} onChange={handleForm} rows={3} placeholder="เช่น ประเภทสินค้าที่จะขาย..." />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-ghost" onClick={() => navigate('/map')}>ยกเลิก</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'กำลังจอง...' : 'ยืนยันการจอง →'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="form-card">
            <h3>แนบหลักฐานการโอนเงิน</h3>
            <div className="bank-info">
              <div className="bank-title">ข้อมูลบัญชีธนาคาร</div>
              <div className="bank-row"><span>ธนาคาร</span><strong>กสิกรไทย</strong></div>
              <div className="bank-row"><span>เลขบัญชี</span><strong>xxx-x-xxxxx-x</strong></div>
              <div className="bank-row"><span>ชื่อบัญชี</span><strong>ตลาดออนไลน์</strong></div>
              <div className="bank-row"><span>ยอดโอน</span><strong className="price-text">฿{Number(totalPrice).toLocaleString()}</strong></div>
            </div>
            {error && <div className="alert-error">{error}</div>}
            <form onSubmit={submitPayment}>
              <div className="field">
                <label>โอนจากธนาคาร</label>
                <input name="bank_name" value={payment.bank_name} onChange={handlePay} placeholder="เช่น กสิกรไทย, กรุงเทพ..." required />
              </div>
              <div className="field">
                <label>วันและเวลาที่โอน</label>
                <input type="datetime-local" name="transferred_at" value={payment.transferred_at} onChange={handlePay} required />
              </div>
              <div className="field">
                <label>แนบสลิปการโอน</label>
                <div className="upload-area" onClick={() => document.getElementById('slip-input').click()}>
                  {payment.slip
                    ? <><div className="upload-icon">✅</div><div>{payment.slip.name}</div></>
                    : <><div className="upload-icon">📎</div><div>คลิกเพื่อเลือกรูปสลิป</div><div className="upload-hint">PNG, JPG ขนาดไม่เกิน 5MB</div></>
                  }
                </div>
                <input id="slip-input" type="file" accept="image/*" style={{display:'none'}}
                  onChange={e => setPayment({...payment, slip: e.target.files[0]})} required />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading || !payment.slip}>
                  {loading ? 'กำลังส่ง...' : 'ส่งหลักฐานการชำระเงิน →'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="form-card success-card">
            <div className="success-icon">🎉</div>
            <h3>ส่งข้อมูลเรียบร้อยแล้ว!</h3>
            <p>ทีมงานจะตรวจสอบการชำระเงินและยืนยันการจองภายใน 24 ชั่วโมงครับ</p>
            <button className="btn-primary" onClick={() => navigate('/map')}>
              กลับไปหน้าแผนผัง
            </button>
          </div>
        )}
      </div>

      <style>{`
        .booking-wrap { max-width:800px; margin:0 auto; }
        .steps {
          display:flex; align-items:center; justify-content:center;
          gap:0; margin-bottom:40px;
        }
        .step {
          display:flex; flex-direction:column; align-items:center; gap:6px;
          flex:1; position:relative;
        }
        .step:not(:last-child)::after {
          content:''; position:absolute; top:18px; left:60%; width:80%;
          height:2px; background:var(--border); z-index:0;
        }
        .step.done:not(:last-child)::after { background:var(--accent); }
        .step-num {
          width:36px; height:36px; border-radius:50%; border:2px solid var(--border);
          display:flex; align-items:center; justify-content:center;
          font-weight:700; font-size:14px; background:var(--bg2);
          color:var(--muted); z-index:1; transition:all .3s;
        }
        .step.active .step-num { border-color:var(--accent); color:var(--accent); background:var(--bg3); }
        .step.done .step-num   { border-color:var(--success); color:#000; background:var(--success); }
        .step-label { font-size:12px; color:var(--muted); text-align:center; }
        .step.active .step-label { color:var(--accent); font-weight:600; }

        .booking-body { display:grid; grid-template-columns:280px 1fr; gap:24px; align-items:start; }
        .lock-info-card {
          background:var(--bg2); border:1px solid var(--border);
          border-radius:16px; padding:24px; position:sticky; top:80px;
        }
        .lock-badge {
          font-family:'Prompt',sans-serif; font-size:22px; font-weight:700;
          color:var(--accent); margin-bottom:16px;
        }
        .lock-detail-row { display:flex; justify-content:space-between; font-size:14px; margin-bottom:8px; }
        .lock-detail-row span { color:var(--muted); }
        .price-text { color:var(--accent); font-size:16px; }
        .lock-desc { color:var(--muted); font-size:13px; margin-top:8px; }
        .total-box {
          display:flex; justify-content:space-between; align-items:center;
          margin-top:20px; padding:16px; background:var(--bg3);
          border-radius:10px; border:1px solid var(--accent)44;
        }
        .total-box span { color:var(--muted); font-size:13px; }
        .total-box strong { color:var(--accent); font-size:22px; font-family:'Prompt',sans-serif; }

        .form-card {
          background:var(--bg2); border:1px solid var(--border);
          border-radius:16px; padding:28px;
        }
        .form-card h3 { font-size:18px; margin-bottom:24px; }
        .alert-error {
          background:#ef444418; border:1px solid #ef444440; color:#fca5a5;
          padding:12px 16px; border-radius:8px; margin-bottom:16px; font-size:14px;
        }
        .field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .field { margin-bottom:16px; }
        .field label { display:block; margin-bottom:6px; font-size:14px; color:var(--muted); font-weight:500; }
        .field input, .field textarea {
          width:100%; padding:12px 14px; background:var(--bg3);
          border:1px solid var(--border); border-radius:10px; color:var(--text);
          font-size:15px; transition:border-color .2s; resize:vertical;
        }
        .field input:focus, .field textarea:focus { border-color:var(--accent); }

        .bank-info {
          background:var(--bg3); border:1px solid var(--border);
          border-radius:12px; padding:16px; margin-bottom:20px;
        }
        .bank-title { font-weight:600; margin-bottom:12px; color:var(--accent); font-size:14px; }
        .bank-row { display:flex; justify-content:space-between; font-size:14px; margin-bottom:6px; }
        .bank-row span { color:var(--muted); }

        .upload-area {
          padding:24px; background:var(--bg3); border:2px dashed var(--border);
          border-radius:10px; text-align:center; cursor:pointer; transition:all .2s;
          color:var(--muted); font-size:14px;
        }
        .upload-area:hover { border-color:var(--accent); color:var(--text); }
        .upload-icon { font-size:28px; margin-bottom:6px; }
        .upload-hint { font-size:12px; color:var(--muted); margin-top:4px; }

        .form-actions { display:flex; gap:10px; margin-top:8px; }
        .btn-ghost {
          padding:12px 20px; border-radius:10px; border:1px solid var(--border);
          background:transparent; color:var(--muted); font-size:15px; transition:all .2s;
        }
        .btn-ghost:hover { border-color:var(--text); color:var(--text); }
        .btn-primary {
          flex:1; padding:12px; border-radius:10px; border:none;
          background:var(--accent); color:#000; font-size:15px; font-weight:700; transition:all .2s;
        }
        .btn-primary:hover:not(:disabled) { background:var(--accent2); }
        .btn-primary:disabled { opacity:.5; cursor:not-allowed; }

        .success-card { text-align:center; padding:48px; }
        .success-icon { font-size:64px; margin-bottom:16px; }
        .success-card h3 { font-size:24px; margin-bottom:12px; color:var(--success); }
        .success-card p { color:var(--muted); margin-bottom:28px; line-height:1.6; }

        .loading-center { text-align:center; padding:60px; color:var(--muted); }
        @media(max-width:700px) {
          .booking-body { grid-template-columns:1fr; }
          .lock-info-card { position:static; }
        }
      `}</style>
    </div>
  );
}
