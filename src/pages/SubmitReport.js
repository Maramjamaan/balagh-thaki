import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitReport } from '../services/reportService';
import { ENTITY_NAMES_AR, severityToArabic, severityColor } from '../services/aiService';
import { getCurrentLocation } from '../services/locationService';

function SubmitReport() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(0);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState(null);

  useEffect(() => {
    getCurrentLocation()
      .then(loc => setLocation(loc))
      .catch(() => setLocation({ latitude: 24.7136, longitude: 46.6753, neighborhood: 'الرياض' }));
  }, []);

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { setError('حجم الصورة كبير — الحد الأقصى 10 ميجا'); return; }
      setImage(file); setPreview(URL.createObjectURL(file)); setError('');
    }
  };

  const handleSubmit = async () => {
    if (!image) { setError('ارفع صورة المشكلة أولاً'); return; }
    setLoading(true); setError(''); setStep(1);
    try {
      setTimeout(() => setStep(2), 1500);
      const res = await submitReport(image);
      setStep(3); setTimeout(() => setResult(res), 400);
    } catch (err) { setError(err.message); setStep(0); }
    setLoading(false);
  };

  const resetForm = () => { setImage(null); setPreview(null); setResult(null); setError(''); setStep(0); setNotes(''); };

  // === صفحة النتيجة ===
  if (result) {
    const p = result.priority;
    const circ = 2 * Math.PI * 54;
    const offset = circ - (p.score / 100) * circ;
    const ai = result.ai;

    return (
      <div style={s.page}>
        <div className="fade-up">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={s.successBadge}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1B7F5F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ color: 'var(--primary)', fontSize: 22, fontWeight: 700, margin: '14px 0 4px' }}>تم إرسال البلاغ بنجاح</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: 12 }}>رقم البلاغ: <span style={{ color: 'var(--primary)', direction: 'ltr', display: 'inline-block' }}>{result.report.id?.slice(0, 8)}</span></p>
          </div>

          <div className="glass" style={{ padding: 28, marginBottom: 14, textAlign: 'center' }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="10" />
              <circle cx="70" cy="70" r="54" fill="none" stroke={p.level.color} strokeWidth="10"
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round" transform="rotate(-90 70 70)"
                style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
              <text x="70" y="64" textAnchor="middle" fill={p.level.color} fontSize="32" fontWeight="800" fontFamily="Tajawal">{p.score}</text>
              <text x="70" y="86" textAnchor="middle" fill="var(--text-dim)" fontSize="12" fontFamily="Tajawal">{p.level.label}</text>
            </svg>
          </div>

          <div className="glass" style={{ padding: 20, marginBottom: 14 }}>
            <h3 style={s.cardTitle}>🤖 تحليل الذكاء الاصطناعي</h3>
            {[
              ['الفئة', ai.category_ar],
              ['التصنيف الفرعي', ai.subcategory_ar],
            ].map(([label, val], i) => (
              <div key={i} style={s.row}><span style={s.rowLabel}>{label}</span><span style={s.rowVal}>{val}</span></div>
            ))}
            <div style={s.row}>
              <span style={s.rowLabel}>الشدة</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: severityColor(ai.severity) }}>{ai.severity}/5 — {severityToArabic(ai.severity)}</span>
            </div>
            {[
              ['الدقة', `${Math.round(ai.confidence * 100)}%`],
              ['الحي', result.location.neighborhood],
            ].map(([label, val], i) => (
              <div key={i} style={s.row}><span style={s.rowLabel}>{label}</span><span style={s.rowVal}>{val}</span></div>
            ))}
            <div style={s.entityBox}>
              <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>الجهة المسؤولة</span>
              <span style={{ color: 'var(--primary)', fontSize: 16, fontWeight: 800, display: 'block', marginTop: 4 }}>
                {ENTITY_NAMES_AR[ai.responsible_entity] || ai.responsible_entity}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={resetForm} style={s.btnPrimary}>📸 بلاغ جديد</button>
            <button onClick={() => navigate('/dashboard')} style={s.btnSecondary}>📊 لوحة التحكم</button>
          </div>
        </div>
      </div>
    );
  }

  // === صفحة الإرسال ===
  return (
    <div style={s.page}>
      <div style={{ textAlign: 'center', marginBottom: 32 }} className="fade-up">
        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1A1613', margin: '0 0 10px' }}>رفع بلاغ جديد</h1>
        <p style={{ color: '#6B6560', fontSize: 16 }}>التقط صورة للمشكلة ودع الذكاء الاصطناعي يحلل ويصنف البلاغ تلقائياً</p>
      </div>

      <div className="fade-up" style={s.formCard}>
        {/* صورة المشكلة */}
        <div style={{ marginBottom: 28 }}>
          <label style={s.label}>صورة المشكلة</label>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />

          {preview ? (
            <div style={{ position: 'relative' }}>
              <img src={preview} alt="preview" style={s.previewImg} />
              <button onClick={() => { setImage(null); setPreview(null); }} style={s.removeBtn}>حذف</button>
            </div>
          ) : (
            <div style={s.uploadArea} onClick={() => fileRef.current?.click()}>
              <div style={s.cameraIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6B6560" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <p style={{ color: '#1A1613', fontSize: 16, margin: '12px 0 4px', fontWeight: 500 }}>انقر لالتقاط أو رفع صورة</p>
              <p style={{ color: '#A0A0A0', fontSize: 13 }}>PNG, JPG حتى 10MB</p>
            </div>
          )}
        </div>

        {/* الموقع */}
        <div style={{ marginBottom: 28 }}>
          <label style={s.label}>الموقع</label>
          <div style={s.locationBox}>
            <div style={s.locationIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B7F5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1613', margin: 0 }}>تم تحديد الموقع تلقائياً</p>
              <p style={{ fontSize: 12, color: '#6B6560', margin: '4px 0 0', direction: 'ltr', textAlign: 'right' }}>
                {location ? `${location.latitude.toFixed(4)}° N, ${location.longitude.toFixed(4)}° E - الرياض` : 'جاري تحديد الموقع...'}
              </p>
            </div>
          </div>
        </div>

        {/* ملاحظات */}
        <div style={{ marginBottom: 28 }}>
          <label style={s.label}>ملاحظات إضافية (اختياري)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أضف أي تفاصيل إضافية تساعد في معالجة البلاغ..."
            style={s.textarea}
          />
        </div>

        {/* أخطاء */}
        {error && (
          <div style={s.errorBox}>
            <span>⚠️</span>
            <p style={{ color: 'var(--red)', fontSize: 13, margin: 0 }}>{error}</p>
          </div>
        )}

        {/* زر الإرسال */}
        <button
          onClick={handleSubmit}
          disabled={loading || !image}
          style={{
            ...s.submitBtn,
            background: loading ? 'rgba(27,127,95,0.1)' : !image ? 'rgba(0,0,0,0.06)' : '#1B7F5F',
            color: loading || !image ? '#A0A0A0' : '#fff',
            cursor: loading || !image ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'جاري التحليل...' : '⬆️ إرسال البلاغ'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', marginTop: 24 }} className="fade-in">
          <div style={s.spinner} />
          <p style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 600, marginTop: 16 }}>
            {step === 1 ? '🤖 جاري تحليل الصورة...' : step === 2 ? '📤 جاري رفع البلاغ...' : '✨ شبه خلصنا...'}
          </p>
        </div>
      )}

      {/* Info Cards */}
      <div style={s.infoGrid} className="fade-up">
        {[
          { icon: '⚡', title: 'سريع وسهل', desc: 'صورة واحدة تكفي' },
          { icon: '🤖', title: 'ذكي وتلقائي', desc: 'تصنيف بالذكاء الاصطناعي' },
          { icon: '📊', title: 'متابعة شاملة', desc: 'تتبع البلاغ حتى الإنجاز' },
        ].map((item, i) => (
          <div key={i} style={s.infoCard}>
            <span style={{ fontSize: 28 }}>{item.icon}</span>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '8px 0 4px', color: '#1A1613' }}>{item.title}</h3>
            <p style={{ fontSize: 13, color: '#6B6560', margin: 0 }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  page: { padding: '40px 20px', maxWidth: 800, margin: '0 auto', minHeight: 'calc(100vh - 140px)' },
  formCard: {
    background: '#fff',
    borderRadius: 24,
    padding: 32,
    border: '2px solid rgba(157,124,95,0.15)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    marginBottom: 40,
  },
  label: {
    display: 'block',
    fontSize: 16,
    fontWeight: 600,
    color: '#1A1613',
    marginBottom: 12,
    fontFamily: "'Tajawal', sans-serif",
  },
  uploadArea: {
    border: '3px dashed rgba(157,124,95,0.25)',
    borderRadius: 16,
    padding: '48px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    background: 'rgba(245,241,237,0.3)',
    transition: 'border-color 0.2s',
  },
  cameraIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    background: 'rgba(245,241,237,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 8px',
  },
  previewImg: { width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 16, display: 'block' },
  removeBtn: {
    position: 'absolute', top: 12, left: 12,
    background: '#D94545', color: '#fff',
    border: 'none', borderRadius: 10, padding: '8px 16px',
    fontSize: 13, cursor: 'pointer', fontFamily: "'Tajawal', sans-serif",
  },
  locationBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'rgba(245,241,237,0.5)',
    border: '2px solid rgba(157,124,95,0.15)',
    borderRadius: 14,
    padding: '16px 20px',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: 'rgba(27,127,95,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textarea: {
    width: '100%',
    height: 120,
    background: '#fff',
    border: '2px solid rgba(157,124,95,0.15)',
    borderRadius: 14,
    padding: 16,
    resize: 'none',
    fontSize: 14,
    fontFamily: "'Tajawal', sans-serif",
    outline: 'none',
    color: '#1A1613',
    direction: 'rtl',
  },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(217,69,69,0.06)', border: '1px solid rgba(217,69,69,0.15)',
    borderRadius: 14, padding: '12px 16px', marginBottom: 14,
  },
  submitBtn: {
    width: '100%', padding: 18, border: 'none', borderRadius: 14,
    fontSize: 17, fontWeight: 700, transition: 'all 0.3s', fontFamily: "'Tajawal', sans-serif",
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  spinner: {
    width: 44, height: 44, border: '3px solid rgba(27,127,95,0.12)',
    borderTopColor: 'var(--primary)', borderRadius: '50%',
    margin: '0 auto', animation: 'spin 0.8s linear infinite',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16,
    marginTop: 20,
  },
  infoCard: {
    background: '#fff',
    borderRadius: 16,
    padding: '24px 20px',
    border: '2px solid rgba(157,124,95,0.15)',
    textAlign: 'center',
  },
  successBadge: {
    width: 64, height: 64, borderRadius: 20, margin: '0 auto',
    background: 'rgba(27,127,95,0.08)', border: '2px solid rgba(27,127,95,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { color: 'var(--primary)', fontSize: 14, fontWeight: 700, margin: '0 0 16px' },
  row: { display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' },
  rowLabel: { color: 'var(--text-dim)', fontSize: 13 },
  rowVal: { color: 'var(--text)', fontSize: 13, fontWeight: 700 },
  entityBox: {
    background: 'var(--primary-light)', border: '1px solid var(--primary-border)',
    borderRadius: 14, padding: 14, marginTop: 14, textAlign: 'center',
  },
  btnPrimary: {
    flex: 1, padding: 14, background: '#1B7F5F',
    color: '#fff', border: 'none', borderRadius: 14, fontSize: 14,
    cursor: 'pointer', fontWeight: 700, fontFamily: "'Tajawal', sans-serif",
  },
  btnSecondary: {
    flex: 1, padding: 14, background: 'var(--primary-light)', color: 'var(--primary)',
    border: '1px solid var(--primary-border)', borderRadius: 14,
    fontSize: 14, cursor: 'pointer', fontFamily: "'Tajawal', sans-serif",
  },
};

export default SubmitReport;