import React, { useState } from 'react';

function TrackReport() {
  const [reportId, setReportId] = useState('');
  const [result, setResult] = useState(null);

  const handleTrack = () => {
    if (!reportId) { alert('أدخل رقم البلاغ'); return; }
    setResult({
      id: reportId,
      type: 'حفريات تغلق شارع رئيسي',
      status: 'قيد المعالجة',
      priority: 87,
      date: '2026-02-25',
      area: 'حي النزهة - الرياض',
    });
  };

  const steps = [
    { label: 'مستلم', done: true },
    { label: 'قيد المراجعة', done: true },
    { label: 'قيد المعالجة', done: true },
    { label: 'منجز', done: false },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>تتبع بلاغي</h2>
        <p style={styles.subtitle}>أدخل رقم البلاغ لمعرفة حالته</p>
      </div>

      <div style={styles.card}>
        <label style={styles.label}>🔢 رقم البلاغ</label>
        <div style={styles.inputRow}>
          <input
            style={styles.input}
            placeholder="مثال: BLG-2026-001"
            value={reportId}
            onChange={(e) => setReportId(e.target.value)}
          />
          <button style={styles.searchBtn} onClick={handleTrack}>🔍 بحث</button>
        </div>
      </div>

      {result && (
        <>
          <div style={styles.card}>
            <div style={styles.priorityBanner}>
              <span style={styles.priorityLabel}>درجة الأولوية</span>
              <span style={styles.priorityScore}>{result.priority}</span>
              <span style={styles.priorityMax}>/100</span>
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>تفاصيل البلاغ</h3>
            <div style={styles.detailRow}><span>🚧 نوع المشكلة</span><strong>{result.type}</strong></div>
            <div style={styles.detailRow}><span>📍 المنطقة</span><strong>{result.area}</strong></div>
            <div style={styles.detailRow}><span>📅 تاريخ الإرسال</span><strong>{result.date}</strong></div>
          </div>

          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>حالة البلاغ</h3>
            <div style={styles.steps}>
              {steps.map((step, i) => (
                <div key={i} style={styles.stepItem}>
                  <div style={{ ...styles.stepDot, background: step.done ? '#27ae60' : '#ddd' }}>
                    {step.done ? '✓' : ''}
                  </div>
                  <span style={{ color: step.done ? '#27ae60' : '#aaa', fontWeight: step.done ? 'bold' : 'normal' }}>
                    {step.label}
                  </span>
                  {i < steps.length - 1 && <div style={{ ...styles.stepLine, background: step.done ? '#27ae60' : '#ddd' }} />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '32px', direction: 'rtl', maxWidth: '640px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '28px', color: '#1a5276', fontWeight: 'bold' },
  subtitle: { color: '#7f8c8d', marginTop: '8px' },
  card: { background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  label: { display: 'block', fontWeight: 'bold', marginBottom: '14px' },
  inputRow: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '14px' },
  searchBtn: { padding: '12px 20px', background: 'linear-gradient(135deg, #1a5276, #2e86c1)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
  priorityBanner: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #e74c3c, #c0392b)', borderRadius: '12px', padding: '20px' },
  priorityLabel: { color: 'white', fontSize: '16px' },
  priorityScore: { color: 'white', fontSize: '48px', fontWeight: 'bold' },
  priorityMax: { color: 'rgba(255,255,255,0.7)', fontSize: '20px', alignSelf: 'flex-end', paddingBottom: '8px' },
  sectionTitle: { color: '#1a5276', marginBottom: '16px' },
  detailRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' },
  steps: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' },
  stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1, position: 'relative' },
  stepDot: { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' },
  stepLine: { position: 'absolute', top: '16px', left: '-50%', width: '100%', height: '3px', zIndex: 0 },
};

export default TrackReport;
