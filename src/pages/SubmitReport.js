import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitReport } from '../services/reportService';
import { isAIEnabled, ENTITY_NAMES_AR, severityToArabic, severityColor } from '../services/aiService';

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

  // === صفحة النتيجة ===
  if (result) {
    const p = result.priority;
    const r = p.score;
    const circ = 2 * Math.PI * 54;
    const offset = circ - (r / 100) * circ;
    const ai = result.ai;

    return (
      <div style={styles.container}>
        {/* رأس النتيجة */}
        <div style={{ textAlign: 'center', marginBottom: 25 }}>
          <div style={styles.successIcon}>&#10003;</div>
          <h2 style={{ color: '#fff', fontSize: 22, margin: '10px 0 5px' }}>تم ارسال البلاغ</h2>
          <p style={{ color: '#888', fontSize: 13 }}>رقم البلاغ: {result.report.id.slice(0, 8)}</p>
        </div>

        {/* حلقة الأولوية */}
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

        {/* تحليل الذكاء الاصطناعي */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>تحليل الذكاء الاصطناعي</h3>

          <div style={styles.detailRow}>
            <span style={{ color: '#888', fontSize: 13 }}>الفئة</span>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{ai.category_ar}</span>
          </div>

          <div style={styles.detailRow}>
            <span style={{ color: '#888', fontSize: 13 }}>التصنيف الفرعي</span>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{ai.subcategory_ar}</span>
          </div>

          <div style={styles.detailRow}>
            <span style={{ color: '#888', fontSize: 13 }}>الشدة</span>
            <span style={{ color: severityColor(ai.severity), fontSize: 13, fontWeight: 'bold' }}>
              {ai.severity}/5 — {severityToArabic(ai.severity)}
            </span>
          </div>

          <div style={styles.detailRow}>
            <span style={{ color: '#888', fontSize: 13 }}>الدقة</span>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{Math.round(ai.confidence * 100)}%</span>
          </div>

          <div style={styles.detailRow}>
            <span style={{ color: '#888', fontSize: 13 }}>الحي</span>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{result.location.neighborhood}</span>
          </div>

          {/* الجهة المسؤولة */}
          <div style={styles.entityBox}>
            <span style={{ color: '#888', fontSize: 12 }}>الجهة المسؤولة</span>
            <span style={{ color: '#C8A951', fontSize: 15, fontWeight: 'bold', marginTop: 4, display: 'block' }}>
              {ENTITY_NAMES_AR[ai.responsible_entity] || ai.responsible_entity}
            </span>
          </div>

          {/* بيانات الحفرية — تظهر بس لو البلاغ حفرية */}
          {ai.category === 'excavation' && (
            <div style={styles.excavationBox}>
              <p style={{ color: '#C8A951', fontSize: 12, fontWeight: 'bold', margin: '0 0 8px' }}>بيانات الحفرية</p>
              <div style={styles.tagRow}>
                <span style={styles.tag}>
                  {ai.has_safety_barriers ? '✓ حواجز سلامة' : '✗ بدون حواجز'}
                </span>
                <span style={styles.tag}>
                  {ai.has_visible_license ? '✓ ترخيص ظاهر' : '✗ بدون ترخيص'}
                </span>
                <span style={styles.tag}>
                  {ai.blocks_traffic ? '⚠ تقفل المرور' : '✓ المرور مفتوح'}
                </span>
              </div>
            </div>
          )}

          <p style={styles.descBox}>{ai.description_ar}</p>
        </div>

        {/* تفاصيل الأولوية */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>تفاصيل الأولوية</h3>
          {Object.entries(p.breakdown).filter(([k]) => k !== 'licenseBonus').map(([k, v]) => {
            const labels = {
              severity: 'الشدة',
              population: 'الكثافة السكانية',
              traffic: 'حركة المرور',
              frequency: 'تكرار البلاغات',
              age: 'مدة بدون حل',
              proximity: 'قرب من مدارس'
            };
            const colors = {
              severity: '#DC2626',
              population: '#3B82F6',
              traffic: '#F97316',
              frequency: '#EAB308',
              age: '#8B5CF6',
              proximity: '#EC4899'
            };
            const percentage = Math.round((v.points / v.max) * 100);
            return (
              <div key={k} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#888', fontSize: 12 }}>{labels[k]} ({v.weight})</span>
                  <span style={{ color: colors[k], fontSize: 12, fontWeight: 'bold' }}>{v.points}/{v.max}</span>
                </div>
                <div style={styles.progressBg}>
                  <div style={{ ...styles.progressFill, width: `${percentage}%`, background: colors[k] }} />
                </div>
              </div>
            );
          })}
          {p.breakdown.licenseBonus > 0 && (
            <div style={{ background: 'rgba(220,38,38,0.1)', padding: 8, borderRadius: 8, marginTop: 8 }}>
              <span style={{ color: '#DC2626', fontSize: 12 }}>⚠ بونص حفرية متأخرة: +{p.breakdown.licenseBonus} نقطة</span>
            </div>
          )}
        </div>

        {/* أزرار */}
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
        <div style={styles.modeBadge}>{isAIEnabled() ? 'AI Live' : 'الوضع التجريبي'}</div>
      </div>

      {/* الفئات الأربع */}
      <div style={styles.categoriesGrid}>
        {[
          { icon: '🚧', label: 'حفريات', desc: 'متأخرة، مهجورة، بدون ترخيص' },
          { icon: '🚦', label: 'مرورية', desc: 'يوتيرن، مطب، إشارة' },
          { icon: '🔧', label: 'بنية تحتية', desc: 'مياه، إنارة، طرق' },
          { icon: '💡', label: 'اقتراحات', desc: 'تشجير، مواقف، ممرات' },
        ].map((cat, i) => (
          <div key={i} style={styles.categoryCard}>
            <span style={{ fontSize: 22 }}>{cat.icon}</span>
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{cat.label}</span>
            <span style={{ color: '#666', fontSize: 10 }}>{cat.desc}</span>
          </div>
        ))}
      </div>

      {/* رفع صورة */}
      <div style={styles.card}>
        <label style={styles.label}>صورة المشكلة</label>
        <label style={styles.uploadBox}>
          {preview ? (
            <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 250, objectFit: 'cover', borderRadius: 10 }} />
          ) : (
            <div style={styles.uploadPlaceholder}>
              <span style={{ fontSize: 40, color: '#C8A951' }}>📷</span>
              <p style={{ color: '#aaa', margin: '8px 0 0', fontSize: 14 }}>اضغط لرفع صورة او التقط من الكاميرا</p>
              <p style={{ color: '#555', fontSize: 11 }}>الذكاء الاصطناعي يحلل الصورة ويحدد النوع والشدة والجهة تلقائياً</p>
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
        style={{
          ...styles.submitBtn,
          background: loading ? '#222' : !image ? '#1a1a1a' : 'linear-gradient(135deg, #C8A951, #a68a3a)',
          color: loading || !image ? '#555' : '#000'
        }}>
        {loading ? 'جاري التحليل والارسال...' : 'تحليل وارسال البلاغ'}
      </button>

      {loading && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <div style={styles.spinner} />
          <p style={{ color: '#888', fontSize: 13, marginTop: 12 }}>الذكاء الاصطناعي يحلل الصورة...</p>
          <p style={{ color: '#555', fontSize: 11 }}>يحدد النوع + الشدة + الجهة المسؤولة</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px 16px',
    direction: 'rtl',
    maxWidth: 560,
    margin: '0 auto',
    background: '#050d05',
    minHeight: 'calc(100vh - 140px)'
  },
  card: {
    background: 'rgba(27,77,62,0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    border: '1px solid rgba(200,169,81,0.08)'
  },
  cardTitle: { color: '#C8A951', fontSize: 14, margin: '0 0 16px' },
  label: { display: 'block', fontWeight: 'bold', marginBottom: 12, fontSize: 14, color: '#C8A951' },
  uploadBox: {
    display: 'block',
    border: '2px dashed rgba(200,169,81,0.2)',
    borderRadius: 14,
    cursor: 'pointer',
    overflow: 'hidden',
    minHeight: 160,
    transition: 'border-color 0.3s'
  },
  uploadPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
    padding: 20,
    textAlign: 'center'
  },
  removeBtn: {
    background: 'rgba(220,38,38,0.1)',
    color: '#DC2626',
    border: '1px solid rgba(220,38,38,0.2)',
    borderRadius: 10,
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: 12,
    marginTop: 10
  },
  errorBox: {
    background: 'rgba(220,38,38,0.1)',
    border: '1px solid rgba(220,38,38,0.2)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14
  },
  submitBtn: {
    width: '100%',
    padding: 16,
    border: 'none',
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid rgba(27,77,62,0.3)',
    borderTopColor: '#C8A951',
    borderRadius: '50%',
    margin: '0 auto',
    animation: 'spin 1s linear infinite'
  },
  modeBadge: {
    display: 'inline-block',
    marginTop: 10,
    padding: '4px 12px',
    borderRadius: 20,
    background: 'rgba(200,169,81,0.1)',
    border: '1px solid rgba(200,169,81,0.2)',
    fontSize: 11,
    color: '#C8A951'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)'
  },
  descBox: {
    color: '#999',
    fontSize: 12,
    margin: '12px 0 0',
    lineHeight: 1.7,
    background: 'rgba(0,0,0,0.2)',
    padding: 10,
    borderRadius: 8
  },
  progressBg: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    height: 6,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    transition: 'width 1s ease'
  },
  primaryBtn: {
    flex: 1,
    padding: 14,
    background: 'linear-gradient(135deg, #1B4D3E, #2a6b52)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 14,
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  secondaryBtn: {
    flex: 1,
    padding: 14,
    background: 'rgba(200,169,81,0.08)',
    color: '#C8A951',
    border: '1px solid rgba(200,169,81,0.2)',
    borderRadius: 12,
    fontSize: 14,
    cursor: 'pointer'
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    margin: '0 auto',
    background: 'rgba(34,197,94,0.15)',
    border: '2px solid rgba(34,197,94,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    color: '#22C55E'
  },
  entityBox: {
    background: 'rgba(200,169,81,0.08)',
    border: '1px solid rgba(200,169,81,0.15)',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    textAlign: 'center'
  },
  excavationBox: {
    background: 'rgba(220,38,38,0.05)',
    border: '1px solid rgba(220,38,38,0.1)',
    borderRadius: 10,
    padding: 12,
    marginTop: 12
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6
  },
  tag: {
    background: 'rgba(255,255,255,0.05)',
    padding: '4px 10px',
    borderRadius: 8,
    fontSize: 11,
    color: '#ccc'
  },
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    marginBottom: 16
  },
  categoryCard: {
    background: 'rgba(27,77,62,0.15)',
    border: '1px solid rgba(200,169,81,0.08)',
    borderRadius: 12,
    padding: '12px 10px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    textAlign: 'center'
  },
};

export default SubmitReport;
