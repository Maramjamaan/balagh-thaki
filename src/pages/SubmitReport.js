import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitReport } from '../services/reportService';
import { isAIEnabled } from '../services/aiService';

function SubmitReport() {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!image) { setError('يرجى رفع صورة المشكلة'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await submitReport(image);
      setResult(res);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    setError('');
  };

  const sevAr = { critical: 'حرج', high: 'مرتفع', medium: 'متوسط', low: 'منخفض' };
  const sevColor = { critical: '#DC2626', high: '#F97316', medium: '#EAB308', low: '#22C55E' };

  // === صفحة النتيجة ===
  if (result) {
    const p = result.priority;
    const r = p.score;
    const circ = 2 * Math.PI * 54;
    const offset = circ - (r / 100) * circ;

    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', marginBottom: 25 }}>
          <div style={styles.successIcon}>&#10003;</div>
          <h2 style={{ color: '#fff', fontSize: 22, margin: '10px 0 5px' }}>تم ارسال البلاغ</h2>
          <p style={{ color: '#888', fontSize: 13 }}>رقم البلاغ: {result.report.id.slice(0, 8)}</p>
        </div>

        {/* Priority Ring */}
        <div style={styles.card}>
          <div style={{ textAlign: 'center' }}>
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <circle cx="65" cy="65" r="54" fill="none" stroke={p.level.color} strokeWidth="10"
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round" transform="rotate(-90 65 65)" />
              <text x="65" y="60" textAnchor="middle" fill={p.level.color} fontSize="28" fontWeight="bold">{r}</text>
              <text x="65" y="80" textAnchor="middle" fill="#888" fontSize="11">{p.level.label}</text>
            </svg>
          </div>
        </div>

        {/* تفاصيل */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>تحليل الذكاء الاصطناعي</h3>
          {[
            { label: 'نوع المشكلة', value: result.ai.category_ar, color: '#fff' },
            { label: 'الشدة', value: sevAr[result.ai.severity], color: sevColor[result.ai.severity] },
            { label: 'الدقة', value: Math.round(result.ai.confidence * 100) + '%', color: '#fff' },
            { label: 'الحي', value: result.location.neighborhood, color: '#fff' },
          ].map((item, i) => (
            <div key={i} style={styles.detailRow}>
              <span style={{ color: '#888', fontSize: 13 }}>{item.label}</span>
              <span style={{ color: item.color, fontSize: 13, fontWeight: 'bold' }}>{item.value}</span>
            </div>
          ))}
          <p style={styles.descBox}>{result.ai.description_ar}</p>
        </div>

        {/* Breakdown */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>تفاصيل الاولوية</h3>
          {Object.entries(p.breakdown).map(([k, v]) => {
            const labels = { severity: 'الشدة', population: 'الكثافة السكانية', traffic: 'حركة المرور', frequency: 'تكرار البلاغات' };
            const colors = { severity: '#DC2626', population: '#3B82F6', traffic: '#F97316', frequency: '#EAB308' };
            return (
              <div key={k} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#888', fontSize: 12 }}>{labels[k]} ({v.weight})</span>
                  <span style={{ color: colors[k], fontSize: 12, fontWeight: 'bold' }}>{v.score}/100</span>
                </div>
                <div style={styles.progressBg}>
                  <div style={{ ...styles.progressFill, width: `${v.score}%`, background: colors[k] }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={resetForm} style={styles.primaryBtn}>بلاغ جديد</button>
          <button onClick={() => navigate('/dashboard')} style={styles.secondaryBtn}>لوحة التحكم</button>
        </div>
      </div>
    );
  }

  // === صفحة الإرسال ===
  return (
    <div style={styles.container}>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <h2 style={{ color: '#fff', fontSize: 24 }}>رفع بلاغ جديد</h2>
        <p style={{ color: '#888', fontSize: 13, marginTop: 6 }}>صور المشكلة والذكاء الاصطناعي يتكفل بالباقي</p>
        <div style={styles.modeBadge}>{isAIEnabled() ? 'AI Live' : 'Demo Mode'}</div>
      </div>

      {/* رفع صورة */}
      <div style={styles.card}>
        <label style={styles.label}>صورة المشكلة</label>
        <label style={styles.uploadBox}>
          {preview ? (
            <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 250, objectFit: 'cover', borderRadius: 10 }} />
          ) : (
            <div style={styles.uploadPlaceholder}>
              <span style={{ fontSize: 36, color: '#C8A951' }}>&#8682;</span>
              <p style={{ color: '#aaa', margin: '8px 0 0' }}>اضغط لرفع صورة او التقط من الكاميرا</p>
              <p style={{ color: '#555', fontSize: 12 }}>JPG, PNG</p>
            </div>
          )}
          <input type="file" accept="image/*" capture="environment" onChange={handleImage} style={{ display: 'none' }} />
        </label>
        {preview && (
          <button onClick={() => { setImage(null); setPreview(null); }} style={styles.removeBtn}>حذف الصورة</button>
        )}
      </div>

      {error && <div style={styles.errorBox}><p style={{ color: '#DC2626', fontSize: 13, margin: 0 }}>{error}</p></div>}

      <button onClick={handleSubmit} disabled={loading || !image}
        style={{ ...styles.submitBtn, background: loading ? '#222' : !image ? '#1a1a1a' : 'linear-gradient(135deg, #C8A951, #a68a3a)', color: loading || !image ? '#555' : '#000' }}>
        {loading ? 'جاري التحليل والارسال...' : 'تحليل وارسال البلاغ'}
      </button>

      {loading && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <div style={styles.spinner} />
          <p style={{ color: '#888', fontSize: 13, marginTop: 12 }}>الذكاء الاصطناعي يحلل الصورة...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '30px 20px', direction: 'rtl', maxWidth: 560, margin: '0 auto', background: '#050d05', minHeight: 'calc(100vh - 140px)' },
  card: { background: 'rgba(27,77,62,0.15)', borderRadius: 16, padding: 20, marginBottom: 14, border: '1px solid rgba(200,169,81,0.08)' },
  cardTitle: { color: '#C8A951', fontSize: 14, margin: '0 0 16px' },
  label: { display: 'block', fontWeight: 'bold', marginBottom: 12, fontSize: 14, color: '#C8A951' },
  uploadBox: { display: 'block', border: '2px dashed rgba(200,169,81,0.2)', borderRadius: 14, cursor: 'pointer', overflow: 'hidden', minHeight: 160, transition: 'border-color 0.3s' },
  uploadPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 160, padding: 20 },
  removeBtn: { background: 'rgba(220,38,38,0.1)', color: '#DC2626', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontSize: 12, marginTop: 10 },
  errorBox: { background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: 12, marginBottom: 14 },
  submitBtn: { width: '100%', padding: 16, border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' },
  spinner: { width: 40, height: 40, border: '3px solid rgba(27,77,62,0.3)', borderTopColor: '#C8A951', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' },
  modeBadge: { display: 'inline-block', marginTop: 10, padding: '4px 12px', borderRadius: 20, background: 'rgba(200,169,81,0.1)', border: '1px solid rgba(200,169,81,0.2)', fontSize: 11, color: '#C8A951' },
  detailRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  descBox: { color: '#999', fontSize: 12, margin: '12px 0 0', lineHeight: 1.7, background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8 },
  progressBg: { background: 'rgba(255,255,255,0.05)', borderRadius: 6, height: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6, transition: 'width 1s ease' },
  primaryBtn: { flex: 1, padding: 14, background: 'linear-gradient(135deg, #1B4D3E, #2a6b52)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, cursor: 'pointer', fontWeight: 'bold' },
  secondaryBtn: { flex: 1, padding: 14, background: 'rgba(200,169,81,0.08)', color: '#C8A951', border: '1px solid rgba(200,169,81,0.2)', borderRadius: 12, fontSize: 14, cursor: 'pointer' },
  successIcon: { width: 60, height: 60, borderRadius: '50%', margin: '0 auto', background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#22C55E' },
};

export default SubmitReport;
