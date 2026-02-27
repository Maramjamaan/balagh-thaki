import React, { useState } from 'react';
import { supabase } from '../supabase';

function TrackReport() {
  const [reportId, setReportId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    if (!reportId.trim()) { setError('ادخل رقم البلاغ'); return; }
    setLoading(true);
    setError('');
    try {
      const { data, error: dbError } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId.trim())
        .single();

      if (dbError || !data) {
        setError('لم يتم العثور على بلاغ بهذا الرقم');
        setResult(null);
      } else {
        setResult(data);
      }
    } catch {
      setError('حدث خطأ في البحث');
    }
    setLoading(false);
  };

  const sevAr = { critical: 'حرج', high: 'مرتفع', medium: 'متوسط', low: 'منخفض' };
  const pColor = (s) => s >= 80 ? '#DC2626' : s >= 60 ? '#F97316' : s >= 40 ? '#EAB308' : '#22C55E';

  const steps = [
    { label: 'مستلم', key: 'pending' },
    { label: 'قيد المعالجة', key: 'in_progress' },
    { label: 'منجز', key: 'resolved' },
  ];

  const stepIndex = result ? (result.status === 'resolved' ? 2 : result.status === 'in_progress' ? 1 : 0) : -1;

  return (
    <div style={styles.container}>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <h2 style={{ color: '#fff', fontSize: 24 }}>تتبع بلاغي</h2>
        <p style={{ color: '#888', fontSize: 13, marginTop: 6 }}>ادخل رقم البلاغ لمعرفة حالته</p>
      </div>

      <div style={styles.card}>
        <label style={styles.label}>رقم البلاغ</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            style={styles.input}
            placeholder="الصق رقم البلاغ هنا..."
            value={reportId}
            onChange={(e) => setReportId(e.target.value)}
            dir="ltr"
          />
          <button onClick={handleTrack} disabled={loading} style={styles.searchBtn}>
            {loading ? '...' : 'بحث'}
          </button>
        </div>
        {error && <p style={{ color: '#DC2626', fontSize: 13, marginTop: 10 }}>{error}</p>}
      </div>

      {result && (
        <>
          {/* Priority */}
          <div style={{ ...styles.card, textAlign: 'center' }}>
            <div style={{ fontSize: 48, fontWeight: 'bold', color: pColor(result.priority_score) }}>{result.priority_score}</div>
            <p style={{ color: pColor(result.priority_score), fontSize: 14, margin: '4px 0 0' }}>درجة الاولوية</p>
          </div>

          {/* Details */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>تفاصيل البلاغ</h3>
            {[
              { label: 'نوع المشكلة', value: result.category_name || 'غير مصنف' },
              { label: 'الحي', value: result.neighborhood || 'غير محدد' },
              { label: 'الشدة', value: sevAr[result.severity] || result.severity },
              { label: 'التاريخ', value: new Date(result.created_at).toLocaleDateString('ar-SA') },
            ].map((item, i) => (
              <div key={i} style={styles.detailRow}>
                <span style={{ color: '#888' }}>{item.label}</span>
                <strong style={{ color: '#fff' }}>{item.value}</strong>
              </div>
            ))}
          </div>

          {/* Status Steps */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>حالة البلاغ</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: i <= stepIndex ? '#22C55E' : 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 'bold', fontSize: 14,
                    border: i <= stepIndex ? 'none' : '2px solid #333'
                  }}>
                    {i <= stepIndex ? '&#10003;' : i + 1}
                  </div>
                  <span style={{ color: i <= stepIndex ? '#22C55E' : '#555', fontSize: 12, fontWeight: i <= stepIndex ? 'bold' : 'normal' }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          {result.image_url && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>صورة البلاغ</h3>
              <img src={result.image_url} alt="report" style={{ width: '100%', borderRadius: 10 }} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '30px 20px', direction: 'rtl', maxWidth: 560, margin: '0 auto', background: '#050d05', minHeight: 'calc(100vh - 140px)' },
  card: { background: 'rgba(27,77,62,0.15)', borderRadius: 16, padding: 20, marginBottom: 14, border: '1px solid rgba(200,169,81,0.08)' },
  cardTitle: { color: '#C8A951', fontSize: 14, margin: '0 0 16px' },
  label: { display: 'block', fontWeight: 'bold', marginBottom: 10, fontSize: 14, color: '#C8A951' },
  input: { flex: 1, padding: 12, borderRadius: 10, border: '1px solid rgba(200,169,81,0.2)', background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 14, outline: 'none' },
  searchBtn: { padding: '12px 24px', background: 'linear-gradient(135deg, #1B4D3E, #2a6b52)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 'bold', fontSize: 14 },
  detailRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13 },
};

export default TrackReport;