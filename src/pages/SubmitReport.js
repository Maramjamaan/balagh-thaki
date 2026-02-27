import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitReport } from '../services/reportService';
import { isAIEnabled, ENTITY_NAMES_AR, severityToArabic, severityColor } from '../services/aiService';

function SubmitReport() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(0);

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { setError('حجم الصورة كبير — الحد الأقصى 5 ميجا'); return; }
      setImage(file); setPreview(URL.createObjectURL(file)); setError('');
    }
  };

  const openCamera = () => { if (fileRef.current) { fileRef.current.setAttribute('capture', 'environment'); fileRef.current.click(); } };
  const openGallery = () => { if (fileRef.current) { fileRef.current.removeAttribute('capture'); fileRef.current.click(); } };

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

  const resetForm = () => { setImage(null); setPreview(null); setResult(null); setError(''); setStep(0); };

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
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#006838" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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

            {ai.category === 'excavation' && (
              <div style={s.excBox}>
                <p style={{ color: 'var(--primary)', fontSize: 11, fontWeight: 700, margin: '0 0 8px' }}>⛏️ بيانات الحفرية</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {[
                    [ai.has_safety_barriers, '✓ حواجز', '✗ بدون حواجز'],
                    [ai.has_visible_license, '✓ ترخيص', '✗ بدون ترخيص'],
                    [!ai.blocks_traffic, '✓ مرور مفتوح', '⚠ تقفل المرور'],
                  ].map(([ok, yes, no], i) => (
                    <span key={i} style={{ ...s.chip, color: ok ? 'var(--green)' : 'var(--red)', borderColor: ok ? 'rgba(0,104,56,0.2)' : 'rgba(220,38,38,0.2)' }}>{ok ? yes : no}</span>
                  ))}
                </div>
              </div>
            )}

            <p style={s.descBox}>{ai.description_ar}</p>
          </div>

          <div className="glass" style={{ padding: 20, marginBottom: 14 }}>
            <h3 style={s.cardTitle}>📊 تفاصيل الأولوية</h3>
            {Object.entries(p.breakdown).filter(([k]) => k !== 'licenseBonus').map(([k, v]) => {
              const meta = {
                severity: { label: 'الشدة', color: '#DC2626' },
                population: { label: 'الكثافة السكانية', color: '#2B7DE9' },
                traffic: { label: 'حركة المرور', color: '#F97316' },
                frequency: { label: 'تكرار البلاغات', color: '#D4A017' },
                age: { label: 'مدة بدون حل', color: '#8B5CF6' },
                proximity: { label: 'قرب من مدارس', color: '#EC4899' },
              };
              const m = meta[k]; const pct = Math.round((v.points / v.max) * 100);
              return (
                <div key={k} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>{m.label} ({v.weight})</span>
                    <span style={{ color: m.color, fontSize: 11, fontWeight: 700 }}>{v.points}/{v.max}</span>
                  </div>
                  <div style={s.progBg}><div style={{ ...s.progFill, width: `${pct}%`, background: m.color }} /></div>
                </div>
              );
            })}
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
      <div style={{ textAlign: 'center', marginBottom: 28 }} className="fade-up">
        <div style={s.headerIcon}>📸</div>
        <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 800, margin: '12px 0 6px' }}>رفع بلاغ جديد</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: 13, lineHeight: 1.6 }}>صوّر المشكلة والذكاء الاصطناعي يتكفل بالباقي</p>
        <div style={s.modeBadge}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: isAIEnabled() ? 'var(--green)' : 'var(--orange)', display: 'inline-block', marginLeft: 6 }} />
          {isAIEnabled() ? 'AI مباشر' : 'وضع تجريبي'}
        </div>
      </div>

      <div style={s.catGrid} className="fade-up">
        {[
          { icon: '🚧', label: 'حفريات', desc: 'متأخرة · مهجورة · بدون ترخيص' },
          { icon: '🚦', label: 'مرورية', desc: 'يوتيرن · مطب · إشارة' },
          { icon: '🔧', label: 'بنية تحتية', desc: 'مياه · إنارة · طرق' },
          { icon: '💡', label: 'اقتراحات', desc: 'تشجير · مواقف · ممرات' },
        ].map((cat, i) => (
          <div key={i} style={s.catCard} className="fade-up">
            <span style={{ fontSize: 24 }}>{cat.icon}</span>
            <span style={{ color: 'var(--text)', fontSize: 13, fontWeight: 700 }}>{cat.label}</span>
            <span style={{ color: 'var(--text-faint)', fontSize: 10 }}>{cat.desc}</span>
          </div>
        ))}
      </div>

      <div className="glass fade-up" style={{ padding: 20, marginBottom: 14 }}>
        <p style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 700, marginBottom: 14 }}>📷 صورة المشكلة</p>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />

        {preview ? (
          <div style={{ position: 'relative' }}>
            <img src={preview} alt="preview" style={s.previewImg} />
            <button onClick={() => { setImage(null); setPreview(null); }} style={s.removeBtn}>✕ حذف</button>
          </div>
        ) : (
          <div style={s.uploadArea}>
            <div style={s.uploadContent}>
              <div style={s.cameraIcon}>📷</div>
              <p style={{ color: 'var(--text-dim)', fontSize: 14, margin: '8px 0 4px', fontWeight: 500 }}>ارفع صورة المشكلة</p>
              <p style={{ color: 'var(--text-faint)', fontSize: 11 }}>الذكاء الاصطناعي يحدد النوع والشدة والجهة تلقائياً</p>
              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button onClick={openCamera} style={s.uploadBtn}>📷 كاميرا</button>
                <button onClick={openGallery} style={s.uploadBtnAlt}>🖼️ معرض الصور</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="fade-up" style={s.errorBox}>
          <span style={{ fontSize: 14 }}>⚠️</span>
          <p style={{ color: 'var(--red)', fontSize: 13, margin: 0 }}>{error}</p>
        </div>
      )}

      <button onClick={handleSubmit} disabled={loading || !image} className="fade-up"
        style={{
          ...s.submitBtn,
          background: loading ? 'rgba(0,104,56,0.1)' : !image ? 'rgba(0,0,0,0.04)' : 'linear-gradient(135deg, #006838, #00a65a)',
          color: loading || !image ? 'var(--text-faint)' : '#fff',
          cursor: loading || !image ? 'not-allowed' : 'pointer',
        }}>
        {loading ? 'جاري التحليل...' : '🚀 تحليل وإرسال البلاغ'}
      </button>

      {loading && (
        <div style={{ textAlign: 'center', marginTop: 24 }} className="fade-in">
          <div style={s.spinner} />
          <p style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 600, marginTop: 16 }}>
            {step === 1 ? '🤖 جاري تحليل الصورة...' : step === 2 ? '📤 جاري رفع البلاغ...' : '✨ شبه خلصنا...'}
          </p>
          <p style={{ color: 'var(--text-faint)', fontSize: 11, marginTop: 4 }}>
            {step === 1 ? 'يحدد النوع والشدة والجهة المسؤولة' : 'يحفظ البلاغ ويحسب الأولوية'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: step >= i ? 'var(--primary)' : 'rgba(0,0,0,0.08)', transition: 'all 0.4s' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { padding: '20px 16px', maxWidth: 560, margin: '0 auto', minHeight: 'calc(100vh - 140px)' },
  headerIcon: {
    fontSize: 40, width: 72, height: 72, margin: '0 auto',
    background: 'var(--primary-light)', borderRadius: 24,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid var(--primary-border)',
  },
  modeBadge: {
    display: 'inline-flex', alignItems: 'center', marginTop: 12,
    padding: '5px 14px', borderRadius: 20,
    background: 'var(--primary-light)', border: '1px solid var(--primary-border)',
    fontSize: 11, color: 'var(--primary)',
  },
  catGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 },
  catCard: {
    background: '#fff', borderRadius: 16, padding: '14px 12px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    textAlign: 'center', border: '1px solid rgba(0,0,0,0.04)',
    boxShadow: '0 1px 6px rgba(0,0,0,0.03)',
  },
  uploadArea: { border: '2px dashed var(--primary-border)', borderRadius: 16, overflow: 'hidden' },
  uploadContent: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '28px 20px', textAlign: 'center',
  },
  cameraIcon: {
    fontSize: 36, width: 64, height: 64, borderRadius: 20,
    background: 'var(--primary-light)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  uploadBtn: {
    padding: '10px 20px', borderRadius: 12,
    background: 'linear-gradient(135deg, #006838, #00a65a)',
    color: '#fff', border: 'none', fontSize: 13, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'Tajawal',
  },
  uploadBtnAlt: {
    padding: '10px 20px', borderRadius: 12,
    background: '#fff', color: 'var(--primary)',
    border: '1px solid var(--primary-border)', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'Tajawal',
  },
  previewImg: { width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 14, display: 'block' },
  removeBtn: {
    position: 'absolute', top: 10, left: 10,
    background: 'rgba(220,38,38,0.9)', color: '#fff',
    border: 'none', borderRadius: 8, padding: '6px 12px',
    fontSize: 11, cursor: 'pointer', fontFamily: 'Tajawal',
  },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.12)',
    borderRadius: 14, padding: '12px 16px', marginBottom: 14,
  },
  submitBtn: {
    width: '100%', padding: 16, border: 'none', borderRadius: 16,
    fontSize: 16, fontWeight: 800, transition: 'all 0.4s', fontFamily: 'Tajawal',
  },
  spinner: {
    width: 44, height: 44, border: '3px solid rgba(0,104,56,0.12)',
    borderTopColor: 'var(--primary)', borderRadius: '50%',
    margin: '0 auto', animation: 'spin 0.8s linear infinite',
  },
  successBadge: {
    width: 64, height: 64, borderRadius: 20, margin: '0 auto',
    background: 'rgba(0,104,56,0.08)', border: '2px solid rgba(0,104,56,0.15)',
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
  excBox: {
    background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.08)',
    borderRadius: 14, padding: 14, marginTop: 14,
  },
  chip: { padding: '4px 10px', borderRadius: 8, fontSize: 11, border: '1px solid', background: '#fff' },
  descBox: {
    color: 'var(--text-dim)', fontSize: 12, margin: '14px 0 0', lineHeight: 1.8,
    background: 'rgba(0,0,0,0.02)', padding: 12, borderRadius: 12,
  },
  progBg: { background: 'rgba(0,0,0,0.04)', borderRadius: 6, height: 5, overflow: 'hidden' },
  progFill: { height: '100%', borderRadius: 6, transition: 'width 1.2s ease' },
  btnPrimary: {
    flex: 1, padding: 14, background: 'linear-gradient(135deg, #006838, #00a65a)',
    color: '#fff', border: 'none', borderRadius: 14, fontSize: 14,
    cursor: 'pointer', fontWeight: 700, fontFamily: 'Tajawal',
  },
  btnSecondary: {
    flex: 1, padding: 14, background: 'var(--primary-light)', color: 'var(--primary)',
    border: '1px solid var(--primary-border)', borderRadius: 14,
    fontSize: 14, cursor: 'pointer', fontFamily: 'Tajawal',
  },
};

export default SubmitReport;
