import React, { useState } from 'react';

const mockReports = [
  { id: 'BLG-001', type: 'حفريات', area: 'حي النزهة', priority: 94, status: 'عاجل', color: '#e74c3c', icon: '⚠️' },
  { id: 'BLG-002', type: 'تسرب مياه', area: 'حي العليا', priority: 87, status: 'عاجل', color: '#e74c3c', icon: '💧' },
  { id: 'BLG-003', type: 'حفرة', area: 'حي الملز', priority: 76, status: 'مرتفع', color: '#e67e22', icon: '🕳️' },
  { id: 'BLG-004', type: 'إنارة معطلة', area: 'حي الورود', priority: 61, status: 'متوسط', color: '#f39c12', icon: '💡' },
  { id: 'BLG-005', type: 'مخلفات', area: 'حي السليمانية', priority: 45, status: 'منخفض', color: '#27ae60', icon: '🗑️' },
  { id: 'BLG-006', type: 'تشققات', area: 'حي الروضة', priority: 38, status: 'منخفض', color: '#27ae60', icon: '🔧' },
];

const stats = [
  { label: 'إجمالي البلاغات', value: '124', icon: '📋', color: '#2e86c1' },
  { label: 'بلاغات عاجلة', value: '18', icon: '🚨', color: '#e74c3c' },
  { label: 'قيد المعالجة', value: '43', icon: '⚙️', color: '#f39c12' },
  { label: 'منجزة اليوم', value: '12', icon: '✅', color: '#27ae60' },
];

function Dashboard() {
  const [filter, setFilter] = useState('الكل');
  const filters = ['الكل', 'عاجل', 'مرتفع', 'متوسط', 'منخفض'];

  const filtered = filter === 'الكل' ? mockReports : mockReports.filter(r => r.status === filter);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>لوحة تحكم الأمانة</h2>
        <p style={styles.subtitle}>البلاغات مرتبة تلقائياً حسب الأولوية</p>
      </div>

      {/* الإحصائيات */}
      <div style={styles.statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} style={{ ...styles.statCard, borderTop: `4px solid ${stat.color}` }}>
            <span style={styles.statIcon}>{stat.icon}</span>
            <span style={{ ...styles.statValue, color: stat.color }}>{stat.value}</span>
            <span style={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* الخريطة الحرارية */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>🗺️ الخريطة الحرارية</h3>
        <div style={styles.heatmap}>
          {mockReports.map((r, i) => (
            <div key={i} style={{ ...styles.heatDot, background: r.color, width: `${r.priority * 0.6}px`, height: `${r.priority * 0.6}px`, top: `${20 + i * 25}px`, left: `${30 + i * 80}px` }}>
              <span style={styles.heatLabel}>{r.icon}</span>
            </div>
          ))}
          <div style={styles.heatmapBg}>خريطة الرياض</div>
        </div>
      </div>

      {/* قائمة البلاغات */}
      <div style={styles.card}>
        <div style={styles.listHeader}>
          <h3 style={styles.sectionTitle}>📋 البلاغات حسب الأولوية</h3>
          <div style={styles.filters}>
            {filters.map(f => (
              <button key={f} style={{ ...styles.filterBtn, background: filter === f ? '#1a5276' : '#f0f4f8', color: filter === f ? 'white' : '#333' }} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.map((report, i) => (
          <div key={i} style={styles.reportRow}>
            <div style={styles.reportRank}>{i + 1}</div>
            <div style={styles.reportIcon}>{report.icon}</div>
            <div style={styles.reportInfo}>
              <strong>{report.type}</strong>
              <span style={styles.reportArea}>📍 {report.area}</span>
            </div>
            <div style={styles.reportRight}>
              <div style={styles.priorityBar}>
                <div style={{ ...styles.priorityFill, width: `${report.priority}%`, background: report.color }} />
              </div>
              <span style={{ ...styles.badge, background: report.color }}>{report.status} • {report.priority}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '32px', direction: 'rtl', maxWidth: '900px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '28px', color: '#1a5276', fontWeight: 'bold' },
  subtitle: { color: '#7f8c8d', marginTop: '8px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' },
  statCard: { background: 'white', borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: '6px' },
  statIcon: { fontSize: '28px' },
  statValue: { fontSize: '32px', fontWeight: 'bold' },
  statLabel: { fontSize: '12px', color: '#7f8c8d' },
  card: { background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  sectionTitle: { color: '#1a5276', marginBottom: '16px' },
  heatmap: { position: 'relative', height: '180px', background: 'linear-gradient(135deg, #eaf4fb, #d6eaf8)', borderRadius: '12px', overflow: 'hidden' },
  heatDot: { position: 'absolute', borderRadius: '50%', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  heatLabel: { fontSize: '16px' },
  heatmapBg: { position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', color: '#aaa', fontSize: '12px' },
  listHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' },
  filters: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  filterBtn: { padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  reportRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f0f0f0' },
  reportRank: { width: '28px', height: '28px', borderRadius: '50%', background: '#eaf4fb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#1a5276', fontSize: '13px' },
  reportIcon: { fontSize: '24px' },
  reportInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  reportArea: { fontSize: '12px', color: '#7f8c8d' },
  reportRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', minWidth: '120px' },
  priorityBar: { width: '100px', height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' },
  priorityFill: { height: '100%', borderRadius: '3px' },
  badge: { color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
};

export default Dashboard;
