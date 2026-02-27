import React, { useState, useEffect } from 'react';
import { getAllReports, getDashboardStats } from '../services/reportService';

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [r, s] = await Promise.all([getAllReports(), getDashboardStats()]);
      setReports(r || []);
      setStats(s);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const filters = [
    { id: 'all', label: 'الكل' },
    { id: 'critical', label: 'حرج' },
    { id: 'high', label: 'مرتفع' },
    { id: 'medium', label: 'متوسط' },
    { id: 'low', label: 'منخفض' },
  ];

  const filtered = filter === 'all' ? reports : reports.filter(r => {
    if (filter === 'critical') return r.priority_score >= 80;
    if (filter === 'high') return r.priority_score >= 60 && r.priority_score < 80;
    if (filter === 'medium') return r.priority_score >= 40 && r.priority_score < 60;
    return r.priority_score < 40;
  });

  const statusAr = { pending: 'بانتظار المعالجة', in_progress: 'قيد المعالجة', resolved: 'تم الحل' };
  const pColor = (s) => s >= 80 ? '#DC2626' : s >= 60 ? '#F97316' : s >= 40 ? '#EAB308' : '#22C55E';

  if (loading) return (
    <div style={{ ...styles.container, textAlign: 'center', paddingTop: 80 }}>
      <p style={{ color: '#888' }}>جاري تحميل البيانات...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={{ marginBottom: 25 }}>
        <h2 style={{ color: '#fff', fontSize: 24 }}>لوحة التحكم</h2>
        <p style={{ color: '#888', fontSize: 13, marginTop: 6 }}>البلاغات مرتبة تلقائيا حسب الاولوية</p>
      </div>

      {/* Stats */}
      {stats && (
        <div style={styles.statsGrid}>
          {[
            { label: 'اجمالي البلاغات', value: stats.total, color: '#C8A951' },
            { label: 'بانتظار المعالجة', value: stats.pending, color: '#F97316' },
            { label: 'تم الحل', value: stats.resolved, color: '#22C55E' },
            { label: 'بلاغات حرجة', value: stats.critical, color: '#DC2626' },
            { label: 'قيد المعالجة', value: stats.inProgress, color: '#3B82F6' },
            { label: 'متوسط الاولوية', value: stats.avgScore, color: '#C8A951' },
          ].map((s, i) => (
            <div key={i} style={styles.statCard}>
              <div style={{ position: 'absolute', top: -15, right: -15, width: 50, height: 50, borderRadius: '50%', background: `${s.color}10` }} />
              <div style={{ fontSize: 28, fontWeight: 'bold', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12,
              background: filter === f.id ? 'rgba(200,169,81,0.2)' : 'rgba(255,255,255,0.05)',
              color: filter === f.id ? '#C8A951' : '#888',
              fontWeight: filter === f.id ? 'bold' : 'normal',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <h3 style={{ color: '#C8A951', fontSize: 15, marginBottom: 12 }}>البلاغات ({filtered.length})</h3>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#555' }}>
          <p style={{ fontSize: 28, marginBottom: 8 }}>&#8709;</p>
          <p>لا توجد بلاغات</p>
        </div>
      )}

      {filtered.map((r) => (
        <div key={r.id} style={{ ...styles.reportCard, borderRight: `4px solid ${pColor(r.priority_score)}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{r.category_name || 'غير مصنف'}</span>
            <div style={{ background: `${pColor(r.priority_score)}15`, padding: '4px 10px', borderRadius: 8, color: pColor(r.priority_score), fontSize: 13, fontWeight: 'bold' }}>
              {r.priority_score}/100
            </div>
          </div>
          <p style={{ color: '#999', fontSize: 12, margin: '0 0 10px', lineHeight: 1.5 }}>{r.description || ''}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#555' }}>
            <span>{r.neighborhood || 'غير محدد'}</span>
            <span style={{
              color: r.status === 'resolved' ? '#22C55E' : r.status === 'in_progress' ? '#3B82F6' : '#F97316',
              background: r.status === 'resolved' ? 'rgba(34,197,94,0.1)' : r.status === 'in_progress' ? 'rgba(59,130,246,0.1)' : 'rgba(249,115,22,0.1)',
              padding: '2px 8px', borderRadius: 6
            }}>{statusAr[r.status]}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: { padding: '30px 20px', direction: 'rtl', maxWidth: 600, margin: '0 auto', background: '#050d05', minHeight: 'calc(100vh - 140px)' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 },
  statCard: { background: 'rgba(27,77,62,0.15)', borderRadius: 14, padding: '18px 12px', textAlign: 'center', border: '1px solid rgba(200,169,81,0.06)', position: 'relative', overflow: 'hidden' },
  reportCard: { background: 'rgba(27,77,62,0.15)', borderRadius: 14, padding: 16, marginBottom: 10, border: '1px solid rgba(200,169,81,0.06)', transition: 'transform 0.2s' },
};

export default Dashboard;