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
  const [dateErrors, setDateErrors] = useState({ start_date: '', end_date: '' });

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

  const handleForm = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Validate dates
    if (name === 'start_date' || name === 'end_date') {
      validateDates(name, value);
    }
  };

  const handlePaymentChange = e => {
    const { name, value } = e.target;
    setPayment({ ...payment, [name]: value });
  };

  const validateDates = (fieldName, value) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = fieldName === 'start_date' ? new Date(value) : new Date(form.start_date);
    const endDate = fieldName === 'end_date' ? new Date(value) : new Date(form.end_date);
    
    let errors = { ...dateErrors };
    
    if (fieldName === 'start_date' || form.start_date) {
      if (startDate < today) {
        errors.start_date = 'วันที่เริ่มเช่าไม่สามารถเป็นวันในอดีตได้';
      } else {
        errors.start_date = '';
      }
    }
    
    if ((fieldName === 'end_date' || form.end_date) && form.start_date) {
      if (endDate <= startDate) {
        errors.end_date = 'วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มเช่า';
      } else {
        errors.end_date = '';
      }
    }
    
    setDateErrors(errors);
  };

  const submitBooking = async e => {
    e.preventDefault();
    
    // Check for date errors
    if (dateErrors.start_date || dateErrors.end_date) {
      setError('กรุณาแก้ไขข้อมูลวันที่ให้ถูกต้อง');
      return;
    }
    
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
                  <input 
                    type="date" 
                    name="start_date" 
                    value={form.start_date} 
                    onChange={handleForm} 
                    min={new Date().toISOString().split('T')[0]}
                    required 
                  />
                  {dateErrors.start_date && <div className="field-error">{dateErrors.start_date}</div>}
                </div>
                <div className="field">
                  <label>วันที่สิ้นสุด</label>
                  <input 
                    type="date" 
                    name="end_date" 
                    value={form.end_date} 
                    onChange={handleForm} 
                    min={form.start_date || new Date().toISOString().split('T')[0]}
                    required 
                  />
                  {dateErrors.end_date && <div className="field-error">{dateErrors.end_date}</div>}
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
                <input name="bank_name" value={payment.bank_name} onChange={handlePaymentChange} placeholder="เช่น กสิกรไทย, กรุงเทพ..." required />
              </div>
              <div className="field">
                <label>วันและเวลาที่โอน</label>
                <input type="datetime-local" name="transferred_at" value={payment.transferred_at} onChange={handlePaymentChange} required />
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
        .booking-wrap { max-width: 900px; margin: 0 auto; min-height: 100vh; padding: 32px 16px; background: #f8f9fa; color: #1a1a1a; }
        .steps { display: flex; align-items: center; justify-content: center; gap: 0; margin-bottom: 40px; }
        .step { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; position: relative; }
        .step:not(:last-child)::after { content: ''; position: absolute; top: 24px; left: 60%; width: 80%; height: 3px; background: #e5e7eb; z-index: 0; }
        .step.done:not(:last-child)::after { background: #10b981; }
        .step-num { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; background: #f0f0f0; color: #999999; z-index: 1; transition: all .3s; border: 2px solid #e5e7eb; }
        .step.active .step-num { background: #10b981; color: white; border-color: #10b981; box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
        .step.done .step-num { background: #10b981; color: white; border-color: #10b981; }
        .step-label { font-size: 14px; color: #666666; text-align: center; font-family: 'Sarabun', sans-serif; font-weight: 500; }
        .step.active .step-label, .step.done .step-label { color: #10b981; font-weight: 700; }
        .booking-body { display: grid; grid-template-columns: 300px 1fr; gap: 24px; align-items: start; }
        .lock-info-card { background: white; border: 2px solid #10b981; border-radius: 16px; padding: 24px; position: sticky; top: 80px; box-shadow: 0 2px 8px rgba(16,185,129,0.1); }
        .lock-badge { font-family: var(--font-sans); font-size: 22px; font-weight: 700; color: #10b981; margin-bottom: 16px; }
        .lock-detail-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 12px; color: #1a1a1a; }
        .lock-detail-row span { color: #999999; font-weight: 500; }
        .price-text { color: #10b981; font-size: 16px; font-weight: 700; }
        .lock-desc { color: #666666; font-size: 14px; margin-top: 12px; line-height: 1.5; }
        .total-box { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding: 16px; background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; }
        .total-box span { color: #666666; font-size: 14px; font-weight: 500; }
        .total-box strong { color: #10b981; font-size: 20px; font-family: var(--font-sans); }
        .form-card { background: white; border: 2px solid #e5e7eb; border-radius: 16px; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .form-card h3 { font-size: 20px; margin-bottom: 24px; color: #10b981; font-family: var(--font-sans); font-weight: 700; }
        .alert-error { background: #fee2e2; border: 2px solid #ef4444; color: #991b1b; padding: 14px 16px; border-radius: 10px; margin-bottom: 16px; font-size: 14px; font-family: 'Sarabun',sans-serif; font-weight: 500; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .field { margin-bottom: 16px; }
        .field label { display: block; margin-bottom: 8px; font-size: 14px; color: #1a1a1a; font-weight: 600; font-family: 'Sarabun', sans-serif; }
        .field input, .field textarea { width: 100%; padding: 12px 14px; background: white; border: 2px solid #e5e7eb; border-radius: 10px; color: #1a1a1a; font-size: 15px; transition: all .3s; resize: vertical; font-family: 'Sarabun', sans-serif; }
        .field input:focus, .field textarea:focus { border-color: #10b981; outline: none; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
        .field-error { color: #ef4444; font-size: 12px; margin-top: 4px; font-family: 'Sarabun', sans-serif; font-weight: 600; }
        .bank-info { background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
        .bank-title { font-weight: 700; margin-bottom: 12px; color: #10b981; font-size: 15px; font-family: var(--font-sans); }
        .bank-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; color: #1a1a1a; }
        .bank-row span { color: #999999; font-weight: 500; }
        .upload-area { padding: 24px; background: #f9fafb; border: 2px dashed #10b981; border-radius: 12px; text-align: center; cursor: pointer; transition: all .3s; color: #666666; font-size: 14px; font-family: 'Sarabun', sans-serif; }
        .upload-area:hover { border-color: #059669; background: #f0fdf4; color: #10b981; }
        .upload-icon { font-size: 32px; margin-bottom: 8px; }
        .upload-hint { font-size: 12px; color: #999999; margin-top: 4px; font-weight: 500; }
        .form-actions { display: flex; gap: 10px; margin-top: 8px; flex-wrap: wrap; }
        .btn-ghost { padding: 12px 20px; border-radius: 10px; border: 2px solid #e5e7eb; background: white; color: #666666; font-size: 15px; font-weight: 600; transition: all .3s; font-family: 'Sarabun', sans-serif; cursor: pointer; }
        .btn-ghost:hover { border-color: #10b981; color: #10b981; background: #f0fdf4; }
        .btn-primary { flex: 1; padding: 12px 16px; border-radius: 10px; border: none; background: #10b981; color: white; font-size: 15px; font-weight: 700; transition: all .3s; cursor: pointer; font-family: 'Sarabun', sans-serif; }
        .btn-primary:hover:not(:disabled) { background: #059669; box-shadow: 0 4px 12px rgba(16,185,129,0.4); }
        .btn-primary:disabled { opacity: .6; cursor: not-allowed; }
        .success-card { text-align: center; padding: 48px; background: #f0fdf4; border: 2px solid #10b981; border-radius: 16px; }
        .success-icon { font-size: 64px; margin-bottom: 16px; }
        .success-card h3 { font-size: 24px; margin-bottom: 12px; color: #10b981; font-weight: 700; }
        .success-card p { color: #666666; margin-bottom: 28px; line-height: 1.6; font-size: 15px; }
        .loading-center { text-align: center; padding: 60px; color: #999999; }
        @media(max-width:700px) { .booking-body { grid-template-columns: 1fr; } .lock-info-card { position: static; } }
      `}</style>
    </div>
  );
}
