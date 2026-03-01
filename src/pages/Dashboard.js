import React, { useState, useEffect } from 'react';
import { getAllReports, getDashboardStats } from '../services/reportService';
import { ENTITY_NAMES_AR } from '../services/aiService';

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [catFilter, setCatFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try { const [r, s] = await Promise.all([getAllReports(), getDashboardStats()]); setReports(r || []); setStats(s); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const filtered = reports.filter(r => {
    if (catFilter === 'all') return true;
    if (catFilter === 'excavation') return r.category === 'excavation';
    if (catFilter === 'infrastructure') return ['water_leak', 'lighting', 'sidewalk', 'road_damage'].includes(r.category);
    if (catFilter === 'traffic') return r.category === 'traffic';
    if (catFilter === 'suggestion') return r.category === 'suggestion';
    return true;
  });

  const pColor = (s) => s >= 80 ? '#D94545' : s >= 60 ? '#D4A574' : '#1B7F5F';
  const statusStyle = (st) => {
    if (st === 'new' || st === 'pending') return { bg: '#D94545', color: '#fff', label: 'عاجل' };
    if (st === 'in_progress') return { bg: '#D4A574', color: '#fff', label: 'قيد المعالجة' };
    if (st === 'resolved') return { bg: '#1B7F5F', color: '#fff', label: 'تم الإنجاز' };
    return { bg: '#F5F1ED', color: '#1A1613', label: st };
  };

  const getLeaderboard = () => {
    if (!reports.length) return [];
    const ent = {};
    reports.forEach(r => {
      const e = r.responsible_entity;
      if (!e || e === 'غير محدد') return;
      if (!ent[e]) ent[e] = { entity: e, total: 0, pending: 0, resolved: 0 };
      ent[e].total++;
      r.status === 'resolved' ? ent[e].resolved++ : ent[e].pending++;
    });
    return Object.values(ent).map(e => ({
      ...e,
      entityAr: ENTITY_NAMES_AR[e.entity] || e.entity,
      resolveRate: e.total > 0 ? Math.round((e.resolved / e.total) * 100) : 0,
    })).sort((a, b) => a.resolveRate - b.resolveRate);
  };

  if (loading) return (
    <div style={{ ...s.page, textAlign: 'center', paddingTop: 100 }}>
      <div style={{ width: 44, height: 44, border: '3px solid rgba(27,127,95,0.12)', borderTopColor: '#1B7F5F', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#6B6560', marginTop: 16 }}>جاري تحميل البيانات...</p>
    </div>
  );

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ marginBottom: 32 }} className="fade-up">
        <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1A1613', textAlign: 'right' }}>لوحة التحكم</h1>
        <p style={{ color: '#6B6560', fontSize: 16, marginTop: 4 }}>إحصائيات وتحليلات شاملة للبلاغات</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div style={s.statsGrid} className="fade-up">
          {[
            { label: 'إجمالي البلاغات', value: stats.total, icon: '⚠️', color: '#1B7F5F', change: '+12%', up: true },
            { label: 'قيد المعالجة', value: stats.inProgress + stats.pending, icon: '⏱️', color: '#ffc300', change: '-5%', up: false },
            { label: 'تم الإنجاز', value: stats.resolved, icon: '✅', color: '#4A8FDB', change: '+18%', up: true },
            { label: 'حرجة', value: stats.critical, icon: '🔴', color: '#D94545', change: '+3%', up: true },
          ].map((item, i) => (
            <div key={i} style={s.statCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ ...s.statBadge, background: item.up ? 'rgba(74,143,219,0.1)' : 'rgba(157,124,95,0.1)', color: item.up ? '#4A8FDB' : '#ffc300' }}>
                  {item.up ? '📈' : '📉'} {item.change}
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {item.icon}
                </div>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#1A1613', marginBottom: 4 }}>{item.value}</div>
              <div style={{ fontSize: 13, color: '#6B6560' }}>{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard */}
      <div style={s.card} className="fade-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <span style={{ fontSize: 28 }}>🏆</span>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A1613', margin: 0 }}>تصنيف الشركات</h2>
        </div>

        {getLeaderboard().length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6B6560', padding: 24 }}>لا توجد بيانات كافية</p>
        ) : (
          getLeaderboard().map((c, i) => (
            <div key={c.entity} style={s.leaderRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: i === 0 ? '#ffc300' : i === 1 ? '#D4A574' : '#F5F1ED',
                  color: i < 2 ? '#fff' : '#1A1613',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 700, flexShrink: 0,
                }}>{i + 1}</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1613', margin: '0 0 2px' }}>{c.entityAr}</p>
                  <p style={{ fontSize: 12, color: '#6B6560', margin: 0 }}>{c.pending} متأخرة من أصل {c.total}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 160 }}>
                <div style={{ flex: 1, background: '#F5F1ED', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#1B7F5F', borderRadius: 6, width: `${c.resolveRate}%`, transition: 'width 1s ease' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1613', minWidth: 36 }}>{c.resolveRate}%</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reports */}
      <div style={s.card} className="fade-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A1613', margin: 0 }}>البلاغات الحديثة</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 16 }}>🔽</span>
            {[
              { id: 'all', label: 'الكل' },
              { id: 'excavation', label: 'حفريات' },
              { id: 'infrastructure', label: 'بنية تحتية' },
              { id: 'traffic', label: 'مرورية' },
              { id: 'suggestion', label: 'اقتراحات' },
            ].map(f => (
              <button key={f.id} onClick={() => setCatFilter(f.id)}
                style={{
                  ...s.filterBtn,
                  ...(catFilter === f.id ? s.filterActive : {}),
                }}>{f.label}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#6B6560' }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>📭</p>
            <p>لا توجد بلاغات</p>
          </div>
        ) : (
          filtered.slice(0, 10).map((r) => {
            const st = statusStyle(r.status);
            return (
              <div key={r.id} style={s.reportRow}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: '#6B6560', direction: 'ltr' }}>{r.id?.slice(0, 13)}</span>
                    <span style={{ background: st.bg, color: st.color, padding: '4px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>{st.label}</span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1613', margin: '0 0 4px' }}>{r.category_ar || r.category || 'غير مصنف'}</p>
                  <p style={{ fontSize: 13, color: '#6B6560', margin: 0 }}>{r.neighborhood || ''}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 11, color: '#6B6560', marginBottom: 4 }}>الأولوية</p>
                    <span style={{
                      background: `${pColor(r.priority_score)}12`,
                      color: pColor(r.priority_score),
                      padding: '4px 12px', borderRadius: 10,
                      fontSize: 14, fontWeight: 700,
                    }}>{r.priority_score}/100</span>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 80 }}>
                    <p style={{ fontSize: 11, color: '#6B6560', marginBottom: 4 }}>الجهة</p>
                    <p style={{ fontSize: 13, color: '#1A1613', margin: 0, fontWeight: 500 }}>{ENTITY_NAMES_AR[r.responsible_entity] || r.responsible_entity || '-'}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 11, color: '#6B6560', marginBottom: 4 }}>التاريخ</p>
                    <p style={{ fontSize: 13, color: '#1A1613', margin: 0 }}>{new Date(r.created_at).toLocaleDateString('sv')}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {filtered.length > 10 && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button style={s.moreBtn}>عرض المزيد</button>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { padding: '40px 20px', maxWidth: 1200, margin: '0 auto', minHeight: 'calc(100vh - 140px)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 },
  statCard: {
    background: '#fff', borderRadius: 20, padding: 24,
    border: '2px solid rgba(157,124,95,0.15)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
  },
  statBadge: {
    padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
    display: 'inline-flex', alignItems: 'center', gap: 4,
  },
  card: {
    background: '#fff', borderRadius: 20, padding: 28,
    border: '2px solid rgba(157,124,95,0.15)', marginBottom: 28,
    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
  },
  leaderRow: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '16px 20px', background: 'rgba(245,241,237,0.4)',
    borderRadius: 14, marginBottom: 10, flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '8px 16px', borderRadius: 10, border: 'none',
    cursor: 'pointer', fontSize: 13, fontWeight: 500,
    background: '#F5F1ED', color: '#6B6560',
    fontFamily: "'Tajawal', sans-serif",
  },
  filterActive: {
    background: '#1B7F5F', color: '#fff', fontWeight: 700,
  },
  reportRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 24px', background: 'rgba(245,241,237,0.3)',
    borderRadius: 14, marginBottom: 10, flexWrap: 'wrap', gap: 16,
    borderBottom: '1px solid rgba(157,124,95,0.08)',
  },
  moreBtn: {
    background: '#F5F1ED', color: '#1A1613',
    padding: '12px 32px', borderRadius: 14, border: 'none',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Tajawal', sans-serif",
  },
};

export default Dashboard;