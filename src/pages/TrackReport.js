import React, { useState } from 'react';
import { supabase } from '../supabase';
import { ENTITY_NAMES_AR, severityToArabic} from '../services/aiService';

function TrackReport() {
  const [reportId, setReportId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    if (!reportId.trim()) { setError('ادخل رقم البلاغ'); return; }
    setLoading(true); setError('');
    try {
      const { data, error: e } = await supabase.from('reports').select('*').eq('id', reportId.trim()).single();
      if (e || !data) { setError('لم يتم العثور على بلاغ بهذا الرقم'); setResult(null); }
      else setResult(data);
    } catch { setError('حدث خطأ في البحث'); }
    setLoading(false);
  };

  const pColor = (s) => s >= 80 ? '#DC2626' : s >= 60 ? '#F97316' : s >= 40 ? '#D4A017' : '#006838';
  const steps = [{ label: 'مستلم', icon: '📩' }, { label: 'قيد المعالجة', icon: '⚙️' }, { label: 'منجز', icon: '✅' }];
  const stepIndex = result ? (result.status === 'resolved' ? 2 : result.status === 'in_progress' ? 1 : 0) : -1;

  return (
    <div style={s.page}>
      <div style={{ textAlign: 'center', marginBottom: 28 }} className="fade-up">
        <div style={s.headerIcon}>🔍</div>
        <h2 style={{ color: 'var(--primary)', fontSize: 24, fontWeight: 800, margin: '12px 0 6px' }}>تتبع بلاغي</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>ادخل رقم البلاغ لمعرفة حالته</p>
      </div>

      <div className="glass fade-up" style={{ padding: 20, marginBottom: 14 }}>
        <p style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>رقم البلاغ</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <input style={s.input} placeholder="الصق رقم البلاغ هنا..." value={reportId}
            onChange={e => setReportId(e.target.value)} dir="ltr"
            onKeyDown={e => e.key === 'Enter' && handleTrack()} />
          <button onClick={handleTrack} disabled={loading} style={s.searchBtn}>{loading ? '...' : '🔍'}</button>
        </div>
        {error && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 10 }}>{error}</p>}
      </div>

      {result && (
        <div className="fade-up">
          <div className="glass" style={{ padding: 24, marginBottom: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 52, fontWeight: 800, color: pColor(result.priority_score), lineHeight: 1 }}>{result.priority_score}</div>
            <p style={{ color: pColor(result.priority_score), fontSize: 13, marginTop: 6 }}>درجة الأولوية</p>
          </div>

          <div className="glass" style={{ padding: 20, marginBottom: 14 }}>
            <h3 style={s.cardTitle}>📋 تفاصيل البلاغ</h3>
            {[
              ['نوع المشكلة', result.category_ar || result.category || 'غير مصنف'],
              ['الحي', result.neighborhood || 'غير محدد'],
              ['الشدة', result.ai_severity ? `${result.ai_severity}/5 — ${severityToArabic(result.ai_severity)}` : 'غير محدد'],
              ['الجهة', ENTITY_NAMES_AR[result.responsible_entity] || result.responsible_entity || 'غير محدد'],
              ['التاريخ', new Date(result.created_at).toLocaleDateString('ar-SA')],
            ].map(([label, val], i) => (
              <div key={i} style={s.row}>
                <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>{label}</span>
                <span style={{ color: 'var(--text)', fontSize: 13, fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>

          <div className="glass" style={{ padding: 20, marginBottom: 14 }}>
            <h3 style={s.cardTitle}>📍 حالة البلاغ</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 20, right: '16%', left: '16%', height: 2, background: 'rgba(0,0,0,0.06)', zIndex: 0 }} />
              <div style={{ position: 'absolute', top: 20, right: '16%', height: 2, background: 'var(--primary)', zIndex: 1, width: stepIndex === 0 ? '0%' : stepIndex === 1 ? '34%' : '68%', transition: 'width 0.8s ease' }} />
              {steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 2, flex: 1 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 14,
                    background: i <= stepIndex ? 'rgba(0,104,56,0.1)' : '#fff',
                    border: i <= stepIndex ? '2px solid var(--primary)' : '2px solid rgba(0,0,0,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>{step.icon}</div>
                  <span style={{ color: i <= stepIndex ? 'var(--primary)' : 'var(--text-faint)', fontSize: 11, fontWeight: i <= stepIndex ? 700 : 400 }}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          {result.image_url && (
            <div className="glass" style={{ padding: 20, marginBottom: 14 }}>
              <h3 style={s.cardTitle}>📷 صورة البلاغ</h3>
              <img src={result.image_url} alt="report" style={{ width: '100%', borderRadius: 14, display: 'block' }} />
            </div>
          )}
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
  cardTitle: { color: 'var(--primary)', fontSize: 14, fontWeight: 700, margin: '0 0 16px' },
  row: { display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' },
  input: {
    flex: 1, padding: 14, borderRadius: 14, border: '1px solid rgba(0,0,0,0.1)',
    background: '#fff', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'Tajawal',
  },
  searchBtn: {
    padding: '14px 20px', background: 'linear-gradient(135deg, #006838, #00a65a)',
    color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer', fontSize: 18,
  },
};

export default TrackReport;
