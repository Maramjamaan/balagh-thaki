import React, { useState, useEffect } from 'react';
import { getAllReports, getDashboardStats } from '../services/reportService';
import { ENTITY_NAMES_AR, severityToArabic, severityColor } from '../services/aiService';

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reports'); // reports أو leaderboard

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

  // فلاتر الأولوية
  const priorityFilters = [
    { id: 'all', label: 'الكل' },
    { id: 'critical', label: 'حرج' },
    { id: 'high', label: 'مرتفع' },
    { id: 'medium', label: 'متوسط' },
    { id: 'low', label: 'منخفض' },
  ];

  // فلاتر الفئات
  const categoryFilters = [
    { id: 'all', label: 'الكل', icon: '📋' },
    { id: 'excavation', label: 'حفريات', icon: '🚧' },
    { id: 'traffic', label: 'مرورية', icon: '🚦' },
    { id: 'water_leak,lighting,sidewalk,road_damage,debris', label: 'بنية تحتية', icon: '🔧' },
    { id: 'suggestion', label: 'اقتراحات', icon: '💡' },
  ];

  // تطبيق الفلاتر
  const filtered = reports.filter(r => {
    // فلتر الأولوية
    if (filter !== 'all') {
      if (filter === 'critical' && r.priority_score < 80) return false;
      if (filter === 'high' && (r.priority_score < 60 || r.priority_score >= 80)) return false;
      if (filter === 'medium' && (r.priority_score < 40 || r.priority_score >= 60)) return false;
      if (filter === 'low' && r.priority_score >= 40) return false;
    }
    // فلتر الفئة
    if (categoryFilter !== 'all') {
      const cats = categoryFilter.split(',');
      if (!cats.includes(r.category)) return false;
    }
    return true;
  });

  const pColor = (s) => s >= 80 ? '#DC2626' : s >= 60 ? '#F97316' : s >= 40 ? '#EAB308' : '#22C55E';
  const statusAr = { pending: 'بانتظار', in_progress: 'قيد المعالجة', resolved: 'تم الحل' };

  // ترتيب الشركات للـ Leaderboard
  const getLeaderboard = () => {
    if (!stats || !stats.byEntity) return [];
    return Object.entries(stats.byEntity)
      .map(([entity, data]) => ({
        entity,
        entityAr: ENTITY_NAMES_AR[entity] || entity,
        total: data.total,
        pending: data.pending,
        resolved: data.resolved,
        resolveRate: data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0,
        delayRate: data.total > 0 ? Math.round((data.pending / data.total) * 100) : 0,
      }))
      .filter(e => e.entity !== 'غير محدد')
      .sort((a, b) => b.delayRate - a.delayRate);
  };

  if (loading) return (
    <div style={{ ...styles.container, textAlign: 'center', paddingTop: 80 }}>
      <p style={{ color: '#888' }}>جاري تحميل البيانات...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: '#fff', fontSize: 22 }}>لوحة التحكم</h2>
        <p style={{ color: '#888', fontSize: 13, marginTop: 6 }}>البلاغات مرتبة تلقائياً حسب الأولوية</p>
      </div>

      {/* الإحصائيات */}
      {stats && (
        <div style={styles.statsGrid}>
          {[
            { label: 'إجمالي', value: stats.total, color: '#C8A951' },
            { label: 'بانتظار', value: stats.pending, color: '#F97316' },
            { label: 'تم الحل', value: stats.resolved, color: '#22C55E' },
            { label: 'حرجة', value: stats.critical, color: '#DC2626' },
          ].map((s, i) => (
            <div key={i} style={styles.statCard}>
              <div style={{ fontSize: 26, fontWeight: 'bold', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* تبويبات: بلاغات / ترتيب الشركات */}
      <div style={styles.tabsContainer}>
        <button
          onClick={() => setActiveTab('reports')}
          style={{ ...styles.tab, ...(activeTab === 'reports' ? styles.activeTab : {}) }}>
          البلاغات ({filtered.length})
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          style={{ ...styles.tab, ...(activeTab === 'leaderboard' ? styles.activeTab : {}) }}>
          ترتيب الشركات
        </button>
      </div>

      {/* محتوى التبويب */}
      {activeTab === 'reports' ? (
        <>
          {/* فلاتر الفئات */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {categoryFilters.map(f => (
              <button key={f.id} onClick={() => setCategoryFilter(f.id)}
                style={{
                  ...styles.filterBtn,
                  background: categoryFilter === f.id ? 'rgba(200,169,81,0.2)' : 'rgba(255,255,255,0.05)',
                  color: categoryFilter === f.id ? '#C8A951' : '#888',
                  fontWeight: categoryFilter === f.id ? 'bold' : 'normal',
                  whiteSpace: 'nowrap',
                }}>
                {f.icon} {f.label}
              </button>
            ))}
          </div>

          {/* فلاتر الأولوية */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {priorityFilters.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                style={{
                  ...styles.filterBtn,
                  background: filter === f.id ? 'rgba(200,169,81,0.2)' : 'rgba(255,255,255,0.05)',
                  color: filter === f.id ? '#C8A951' : '#888',
                  fontWeight: filter === f.id ? 'bold' : 'normal',
                }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* قائمة البلاغات */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#555' }}>
              <p style={{ fontSize: 28, marginBottom: 8 }}>&#8709;</p>
              <p>لا توجد بلاغات</p>
            </div>
          ) : (
            filtered.map((r) => (
              <div key={r.id} style={{ ...styles.reportCard, borderRight: `4px solid ${pColor(r.priority_score)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>
                    {r.category_ar || r.category || 'غير مصنف'}
                  </span>
                  <div style={{
                    background: `${pColor(r.priority_score)}15`,
                    padding: '4px 10px',
                    borderRadius: 8,
                    color: pColor(r.priority_score),
                    fontSize: 13,
                    fontWeight: 'bold'
                  }}>
                    {r.priority_score}/100
                  </div>
                </div>

                {/* الجهة المسؤولة */}
                {r.responsible_entity && (
                  <div style={{
                    display: 'inline-block',
                    background: 'rgba(59,130,246,0.1)',
                    color: '#3B82F6',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    marginBottom: 8
                  }}>
                    {ENTITY_NAMES_AR[r.responsible_entity] || r.responsible_entity}
                  </div>
                )}

                <p style={{ color: '#999', fontSize: 12, margin: '0 0 10px', lineHeight: 1.5 }}>
                  {r.description || ''}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#555' }}>
                  <span>{r.neighborhood || 'غير محدد'}</span>
                  <span style={{
                    color: r.status === 'resolved' ? '#22C55E' : r.status === 'in_progress' ? '#3B82F6' : '#F97316',
                    background: r.status === 'resolved' ? 'rgba(34,197,94,0.1)' : r.status === 'in_progress' ? 'rgba(59,130,246,0.1)' : 'rgba(249,115,22,0.1)',
                    padding: '2px 8px',
                    borderRadius: 6
                  }}>
                    {statusAr[r.status] || r.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </>
      ) : (
        /* ترتيب الشركات */
        <>
          <p style={{ color: '#888', fontSize: 12, marginBottom: 16 }}>
            ترتيب شركات الخدمات حسب نسبة التأخير — الأعلى تأخيراً في الأعلى
          </p>
          {getLeaderboard().length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#555' }}>
              <p>لا توجد بيانات كافية</p>
            </div>
          ) : (
            getLeaderboard().map((company, i) => (
              <div key={company.entity} style={styles.leaderCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      ...styles.rankBadge,
                      background: i === 0 ? 'rgba(220,38,38,0.2)' : i === 1 ? 'rgba(249,115,22,0.2)' : 'rgba(200,169,81,0.1)',
                      color: i === 0 ? '#DC2626' : i === 1 ? '#F97316' : '#C8A951',
                    }}>
                      #{i + 1}
                    </div>
                    <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{company.entityAr}</span>
                  </div>
                  <span style={{ color: '#DC2626', fontSize: 13, fontWeight: 'bold' }}>
                    {company.delayRate}% تأخير
                  </span>
                </div>

                {/* شريط التقدم */}
                <div style={styles.progressBg}>
                  <div style={{
                    height: '100%',
                    borderRadius: 6,
                    width: `${company.resolveRate}%`,
                    background: company.resolveRate >= 70 ? '#22C55E' : company.resolveRate >= 40 ? '#EAB308' : '#DC2626',
                    transition: 'width 1s ease'
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: '#666' }}>
                  <span>إجمالي: {company.total}</span>
                  <span style={{ color: '#F97316' }}>معلقة: {company.pending}</span>
                  <span style={{ color: '#22C55E' }}>منجزة: {company.resolved}</span>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px 16px',
    direction: 'rtl',
    maxWidth: 600,
    margin: '0 auto',
    background: '#050d05',
    minHeight: 'calc(100vh - 140px)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: 8,
    marginBottom: 20
  },
  statCard: {
    background: 'rgba(27,77,62,0.15)',
    borderRadius: 12,
    padding: '14px 8px',
    textAlign: 'center',
    border: '1px solid rgba(200,169,81,0.06)'
  },
  tabsContainer: {
    display: 'flex',
    gap: 0,
    marginBottom: 16,
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 3,
  },
  tab: {
    flex: 1,
    padding: '10px 16px',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    fontSize: 13,
    background: 'transparent',
    color: '#888',
    transition: 'all 0.3s',
  },
  activeTab: {
    background: 'rgba(200,169,81,0.15)',
    color: '#C8A951',
    fontWeight: 'bold',
  },
  filterBtn: {
    padding: '6px 12px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
  },
  reportCard: {
    background: 'rgba(27,77,62,0.15)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    border: '1px solid rgba(200,169,81,0.06)',
  },
  leaderCard: {
    background: 'rgba(27,77,62,0.15)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    border: '1px solid rgba(200,169,81,0.06)',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 'bold',
  },
  progressBg: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    height: 6,
    overflow: 'hidden'
  },
};

export default Dashboard;
