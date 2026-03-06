import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitReport } from '../services/reportService';
import { ENTITY_NAMES_AR } from '../services/aiService';
import { getCurrentLocation } from '../services/locationService';
import { checkCanSubmit, recordSubmission } from '../services/spamProtection';

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
  const [citizenAge, setCitizenAge] = useState(null);
  const [citizenLicense, setCitizenLicense] = useState(null);

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
    if (!image) { setError('ارفع صورة الحفرية أولاً'); return; }

    const spamCheck = checkCanSubmit(location?.latitude, location?.longitude, null);
    if (!spamCheck.allowed) { setError(spamCheck.message); return; }

    setLoading(true); setError(''); setStep(1);
    try {
      setTimeout(() => setStep(2), 1200);
      setTimeout(() => setStep(3), 2400);
      const res = await submitReport(image, notes || null);
      setStep(4);

      recordSubmission({
        latitude: res.location.latitude, longitude: res.location.longitude,
        category: res.ai.category, reportId: res.report.id,
      });

      const savedReports = JSON.parse(localStorage.getItem('awla_my_reports') || '[]');
      savedReports.unshift({
        id: res.report.id, category_ar: res.ai.category_ar,
        neighborhood: res.location.neighborhood, priority_score: res.priority.score,
        status: 'new', responsible_entity: res.ai.responsible_entity,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem('awla_my_reports', JSON.stringify(savedReports.slice(0, 50)));

      setTimeout(() => setResult(res), 400);
    } catch (err) { setError(err.message); setStep(0); }
    setLoading(false);
  };

  const resetForm = () => { setImage(null); setPreview(null); setResult(null); setError(''); setStep(0); setNotes(''); setCitizenAge(null); setCitizenLicense(null); };

  // ==========================================
  // === RESULT PAGE — Citizen View (Clean) ===
  // ==========================================
  if (result) {
    const p = result.priority;
    const circ = 2 * Math.PI * 54;
    const offset = circ - (p.score / 100) * circ;
    const ai = result.ai;
    const escalation = result.escalation;

    return (
      <div style={st.page}>
        <div className="fade-up">
          {/* Success Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, margin: '0 auto', background: 'rgba(3,71,31,0.06)', border: '2px solid rgba(3,71,31,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#03471f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h2 style={{ color: '#03471f', fontSize: 22, fontWeight: 800, margin: '14px 0 4px' }}>تم رصد الحفرية بنجاح</h2>
            <p style={{ color: '#6B6560', fontSize: 13 }}>تم رفع البلاغ تلقائياً للجهة المسؤولة</p>
          </div>

          {/* Photo */}
          {preview && (
            <div className="glass" style={{ padding: 0, marginBottom: 14, overflow: 'hidden', borderRadius: 16 }}>
              <img src={preview} alt="صورة الحفرية" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
            </div>
          )}

          {/* Report Info Card */}
          <div className="glass" style={{ padding: 20, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: 13, color: '#6B6560' }}>رقم البلاغ</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#03471f', direction: 'ltr' }}>{result.report.id?.slice(0, 12)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: 13, color: '#6B6560' }}>الحي</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1613' }}>{result.location.neighborhood}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: 13, color: '#6B6560' }}>نوع الحفرية</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1613' }}>{ai.category_ar}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ fontSize: 13, color: '#6B6560' }}>الجهة المسؤولة</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#03471f' }}>{ENTITY_NAMES_AR[ai.responsible_entity] || ai.responsible_entity}</span>
            </div>
          </div>

          {/* License Match - Citizen View */}
          {result.licenseMatch && (
            <div className="glass" style={{ padding: 18, marginBottom: 14, borderRight: `4px solid ${result.licenseMatch.found ? result.licenseMatch.statusColor : '#EAB308'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 18 }}>{result.licenseMatch.found ? '📋' : '⚠️'}</span>
                <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0, color: result.licenseMatch.found ? result.licenseMatch.statusColor : '#92400E' }}>
                  {result.licenseMatch.found ? 'ترخيص حفر مطابق' : 'لم يُعثر على ترخيص مطابق'}
                </h3>
              </div>
              {result.licenseMatch.found ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.04)', fontSize: 12 }}>
                    <span style={{ color: '#6B6560' }}>رقم الترخيص</span>
                    <span style={{ fontWeight: 800, color: '#03471f', direction: 'ltr' }}>{result.licenseMatch.license.id}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, padding: '10px 14px', background: `${result.licenseMatch.statusColor}08`, border: `1px solid ${result.licenseMatch.statusColor}20`, borderRadius: 10 }}>
                    <span style={{ fontSize: 16 }}>{result.licenseMatch.statusIcon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: result.licenseMatch.statusColor }}>{result.licenseMatch.status}</span>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 12, color: '#92400E', margin: 0 }}>قد تكون حفرية بدون ترخيص — تم تسجيلها للمراجعة</p>
              )}
            </div>
          )}

          {/* Priority Circle */}
          <div className="glass" style={{ padding: 24, marginBottom: 14, textAlign: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#6B6560', margin: '0 0 12px' }}>أولوية البلاغ</p>
            <svg width="130" height="130" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="10" />
              <circle cx="70" cy="70" r="54" fill="none" stroke={p.dynamic?.level?.color || p.level.color} strokeWidth="10" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 70 70)" style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
              <text x="70" y="64" textAnchor="middle" fill={p.dynamic?.level?.color || p.level.color} fontSize="32" fontWeight="800" fontFamily="Tajawal">{p.score}</text>
              <text x="70" y="86" textAnchor="middle" fill="#6B6560" fontSize="12" fontFamily="Tajawal">{p.dynamic?.level?.label || p.level.label}</text>
            </svg>
            {escalation?.escalated && (
              <div style={{ marginTop: 8, padding: '6px 14px', borderRadius: 10, background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.12)', display: 'inline-block' }}>
                <span style={{ fontSize: 12, color: '#F97316' }}>⬆️ تم رفع الأولوية من {escalation.baseScore} إلى {escalation.dynamicScore}</span>
              </div>
            )}
          </div>

          {/* Escalation Factors */}
          {escalation?.factors?.length > 0 && (
            <div className="glass" style={{ padding: 18, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 18 }}>⚡</span>
                <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0, color: '#1A1613' }}>ليش الأولوية {p.score >= 70 ? 'عالية' : p.score >= 40 ? 'متوسطة' : 'منخفضة'}؟</h3>
              </div>
              {escalation.factors.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(0,0,0,0.02)', borderRadius: 10, marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{f.icon}</span>
                    <span style={{ fontSize: 12, color: '#1A1613' }}>{f.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#F97316' }}>+{f.boost}</span>
                </div>
              ))}
            </div>
          )}

          {/* Status Message */}
          <div style={{ padding: '14px 18px', background: 'rgba(3,71,31,0.04)', border: '1px solid rgba(3,71,31,0.1)', borderRadius: 14, marginBottom: 14, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: '#03471f', margin: 0, lineHeight: 1.7 }}>
              📋 بلاغك وصل لـ <strong>{ENTITY_NAMES_AR[ai.responsible_entity] || ai.responsible_entity}</strong> — تقدر تتابع حالته من صفحة بلاغاتي
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={resetForm} style={{ flex: 1, padding: 14, background: '#03471f', color: '#fff', border: 'none', borderRadius: 14, fontSize: 14, cursor: 'pointer', fontWeight: 700, fontFamily: "'Tajawal', sans-serif" }}>📸 حفرية جديدة</button>
            <button onClick={() => navigate('/track')} style={{ flex: 1, padding: 14, background: 'rgba(0,0,0,0.03)', color: '#1A1613', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14, fontSize: 14, cursor: 'pointer', fontWeight: 600, fontFamily: "'Tajawal', sans-serif" }}>📋 تتبع بلاغاتي</button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // === UPLOAD FORM ===
  // ==========================================
  return (
    <div style={st.page}>
      <div style={{ textAlign: 'center', marginBottom: 32 }} className="fade-up">
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1A1613', margin: '0 0 8px' }}>بلّغ عن حفرية</h1>
        <p style={{ color: '#6B6560', fontSize: 15 }}>صوّر الحفرية والذكاء الاصطناعي يحدد نوعها ومرحلتها والجهة المسؤولة</p>
      </div>

      <div className="fade-up glass" style={{ padding: 32, marginBottom: 32, borderRadius: 24 }}>
        <div style={{ marginBottom: 28 }}>
          <label style={st.label}>صورة الحفرية</label>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
          {preview ? (
            <div style={{ position: 'relative' }}>
              <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 16 }} />
              <button onClick={() => { setImage(null); setPreview(null); }} style={{ position: 'absolute', top: 12, left: 12, background: '#DC2626', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontFamily: "'Tajawal', sans-serif" }}>حذف</button>
            </div>
          ) : (
            <div onClick={() => fileRef.current?.click()} style={{ border: '3px dashed rgba(0,0,0,0.1)', borderRadius: 16, padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.015)', transition: 'border-color 0.2s' }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6B6560" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
              </div>
              <p style={{ color: '#1A1613', fontSize: 16, margin: '12px 0 4px', fontWeight: 500 }}>انقر لتصوير الحفرية أو رفع صورة</p>
              <p style={{ color: '#A0A0A0', fontSize: 13 }}>PNG, JPG حتى 10MB</p>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={st.label}>الموقع</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14, padding: '16px 20px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(3,71,31,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#03471f" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>تم تحديد الموقع تلقائياً</p>
              <p style={{ fontSize: 12, color: '#6B6560', margin: '4px 0 0', direction: 'ltr', textAlign: 'right' }}>{location ? `${location.latitude.toFixed(4)}° N, ${location.longitude.toFixed(4)}° E — ${location.neighborhood}` : 'جاري...'}</p>
            </div>
          </div>
        </div>

        {/* Citizen Questions */}
        <div style={{ marginBottom: 28 }}>
          <label style={st.label}>من متى هذي الحفرية تقريباً؟ <span style={{ color: '#A0A0A0', fontWeight: 400 }}>(اختياري)</span></label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { value: 'week', label: 'أقل من أسبوع', icon: '🟢' },
              { value: 'month', label: 'أسبوع لشهر', icon: '🟡' },
              { value: '3months', label: 'شهر لـ 3 شهور', icon: '🟠' },
              { value: 'more', label: 'أكثر من 3 شهور', icon: '🔴' },
            ].map(opt => (
              <button key={opt.value} type="button" onClick={() => setCitizenAge(citizenAge === opt.value ? null : opt.value)}
                style={{
                  flex: '1 1 calc(50% - 4px)', padding: '12px 14px', borderRadius: 12, fontSize: 13, fontWeight: 600,
                  fontFamily: "'Tajawal', sans-serif", cursor: 'pointer', transition: 'all 0.2s',
                  background: citizenAge === opt.value ? '#03471f' : '#fff',
                  color: citizenAge === opt.value ? '#fff' : '#1A1613',
                  border: `2px solid ${citizenAge === opt.value ? '#03471f' : 'rgba(0,0,0,0.06)'}`,
                }}>
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={st.label}>هل تشوف لوحة ترخيص عند الحفرية؟ <span style={{ color: '#A0A0A0', fontWeight: 400 }}>(اختياري)</span></label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { value: 'yes', label: 'نعم، أشوف لوحة', icon: '✅' },
              { value: 'no', label: 'لا، ما فيه لوحة', icon: '❌' },
            ].map(opt => (
              <button key={opt.value} type="button" onClick={() => setCitizenLicense(citizenLicense === opt.value ? null : opt.value)}
                style={{
                  flex: 1, padding: '14px 16px', borderRadius: 12, fontSize: 14, fontWeight: 600,
                  fontFamily: "'Tajawal', sans-serif", cursor: 'pointer', transition: 'all 0.2s',
                  background: citizenLicense === opt.value ? (opt.value === 'yes' ? '#22C55E' : '#DC2626') : '#fff',
                  color: citizenLicense === opt.value ? '#fff' : '#1A1613',
                  border: `2px solid ${citizenLicense === opt.value ? (opt.value === 'yes' ? '#22C55E' : '#DC2626') : 'rgba(0,0,0,0.06)'}`,
                }}>
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={st.label}>ملاحظات إضافية (اختياري)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="صف الحفرية: هل فيها حواجز؟ من متى موجودة؟ هل تعيق المرور؟" style={{ width: '100%', height: 100, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: 16, resize: 'none', fontSize: 14, fontFamily: "'Tajawal', sans-serif", outline: 'none', direction: 'rtl' }} />
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.12)', borderRadius: 14, padding: '12px 16px', marginBottom: 14 }}>
            <span>⚠️</span><p style={{ color: '#DC2626', fontSize: 13, margin: 0 }}>{error}</p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading || !image} style={{
          width: '100%', padding: 18, border: 'none', borderRadius: 14, fontSize: 17, fontWeight: 700, fontFamily: "'Tajawal', sans-serif",
          background: loading ? 'rgba(3,71,31,0.08)' : !image ? 'rgba(0,0,0,0.04)' : '#03471f',
          color: loading || !image ? '#A0A0A0' : '#fff', cursor: loading || !image ? 'not-allowed' : 'pointer', transition: 'all 0.3s',
        }}>
          {loading ? 'جاري تحليل الحفرية...' : '⬆️ إرسال البلاغ'}
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', marginTop: 24 }} className="fade-in">
          <div style={{ width: 44, height: 44, border: '3px solid rgba(3,71,31,0.1)', borderTopColor: '#03471f', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ marginTop: 16 }}>
            {[{ s: 1, icon: '🤖', t: 'تحليل صورة الحفرية بالذكاء الاصطناعي...' }, { s: 2, icon: '📍', t: 'كشف حفريات مشابهة في المنطقة...' }, { s: 3, icon: '⚡', t: 'حساب الأولوية وتقدير عمر الحفرية...' }, { s: 4, icon: '✨', t: 'شبه خلصنا...' }].map(item => (
              <p key={item.s} style={{ fontSize: 13, color: step >= item.s ? '#03471f' : '#A0A0A0', fontWeight: step === item.s ? 700 : 400, margin: '6px 0', transition: 'all 0.3s' }}>
                {step > item.s ? '✅' : step === item.s ? item.icon : '○'} {item.t}
              </p>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 20 }} className="fade-up">
        {[
          { icon: '🤖', title: 'تحليل متخصص', desc: 'AI يحدد نوع الحفرية ومرحلتها وعمرها' },
          { icon: '📍', title: 'كشف التكرار', desc: 'يجمع بلاغات نفس الحفرية تلقائياً' },
          { icon: '⚡', title: 'تصعيد ذكي', desc: 'الأولوية تزيد كل يوم تأخير' },
        ].map((item, i) => (
          <div key={i} className="glass" style={{ padding: '24px 20px', textAlign: 'center' }}>
            <span style={{ fontSize: 28 }}>{item.icon}</span>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '8px 0 4px' }}>{item.title}</h3>
            <p style={{ fontSize: 12, color: '#6B6560', margin: 0 }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const st = {
  page: { padding: '40px 20px', maxWidth: 800, margin: '0 auto', minHeight: 'calc(100vh - 140px)' },
  label: { display: 'block', fontSize: 15, fontWeight: 700, color: '#1A1613', marginBottom: 12, fontFamily: "'Tajawal', sans-serif" },
};

export default SubmitReport;