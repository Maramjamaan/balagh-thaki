import React, { useState, useEffect } from 'react';
import { getAllReports, getDashboardStats } from '../services/reportService';
import { ENTITY_NAMES_AR } from '../services/aiService';

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('reports');

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try { const [r, s] = await Promise.all([getAllReports(), getDashboardStats()]); setReports(r || []); setStats(s); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const filtered = reports.filter(r => {
    if (filter !== 'all') {
      if (filter === 'critical' && r.priority_score < 80) return false;
      if (filter === 'high' && (r.priority_score < 60 || r.priority_score >= 80)) return false;
      if (filter === 'medium' && (r.priority_score < 40 || r.priority_score >= 60)) return false;
      if (filter === 'low' && r.priority_score >= 40) return false;
    }
    if (catFilter !== 'all' && !catFilter.split(',').includes(r.category)) return false;
    return true;
  });

  const pColor = (s) => s >= 80 ? '#DC2626' : s >= 60 ? '#F97316' : s >= 40 ? '#D4A017' : '#006838';
  const statusAr = { new: 'جديد', pending: 'بانتظار', in_progress: 'قيد المعالجة', resolved: 'تم الحل' };

  const getLeaderboard = () => {
    if (!reports.length) return [];
    const ent = {};
    reports.forEach(r => { const e = r.responsible_entity; if (!e || e === 'غير محدد') return; if (!ent[e]) ent[e] = { entity: e, total: 0, pending: 0, resolved: 0 }; ent[e].total++; r.status === 'resolved' ? ent[e].resolved++ : ent[e].pending++; });
    return Object.values(ent).map(e => ({ ...e, entityAr: ENTITY_NAMES_AR[e.entity] || e.entity, resolveRate: e.total > 0 ? Math.round((e.resolved / e.total) * 100) : 0, delayRate: e.total > 0 ? Math.round((e.pending / e.total) * 100) : 0 })).sort((a, b) => b.delayRate - a.delayRate);
  };

  if (loading) return (
    <div style={{ ...s.page, textAlign: 'center', paddingTop: 100 }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(0,104,56,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--text-dim)', marginTop: 16 }}>جاري تحميل البيانات...</p>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={{ marginBottom: 20 }} className="fade-up">
        <h2 style={{ color: 'var(--primary)', fontSize: 22, fontWeight: 800 }}>لوحة التحكم</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>مرتبة تلقائياً حسب الأولوية الذكية</p>
      </div>

      {stats && (
        <div style={s.statsGrid} className="fade-up">
          {[
            { label: 'إجمالي', value: stats.total, color: 'var(--primary)', icon: '📊' },
            { label: 'بانتظار', value: stats.pending, color: 'var(--orange)', icon: '⏳' },
            { label: 'تم الحل', value: stats.resolved, color: 'var(--green)', icon: '✅' },
            { label: 'حرجة', value: stats.critical, color: 'var(--red)', icon: '🔴' },
          ].map((item, i) => (
            <div key={i} className="glass" style={{ padding: '14px 8px', textAlign: 'center' }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <div style={{ fontSize: 24, fontWeight: 800, color: item.color, marginTop: 4 }}>{item.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-faint)', marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={s.tabs} className="fade-up">
        {[['reports', `البلاغات (${filtered.length})`], ['leaderboard', 'ترتيب الشركات']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ ...s.tabBtn, ...(tab === id ? s.tabActive : {}) }}>{label}</button>
        ))}
      </div>

      {tab === 'reports' ? (
        <>
          <div style={s.filterRow} className="fade-up">
            {[{ id: 'all', label: 'الكل', icon: '📋' }, { id: 'excavation', label: 'حفريات', icon: '🚧' }, { id: 'traffic', label: 'مرورية', icon: '🚦' }, { id: 'water_leak,lighting,sidewalk,road_damage,debris', label: 'بنية تحتية', icon: '🔧' }, { id: 'suggestion', label: 'اقتراحات', icon: '💡' }].map(f => (
              <button key={f.id} onClick={() => setCatFilter(f.id)}
                style={{ ...s.filterBtn, ...(catFilter === f.id ? s.filterActive : {}) }}>{f.icon} {f.label}</button>
            ))}
          </div>
          <div style={{ ...s.filterRow, marginBottom: 16 }} className="fade-up">
            {[['all', 'الكل'], ['critical', 'حرج'], ['high', 'مرتفع'], ['medium', 'متوسط'], ['low', 'منخفض']].map(([id, label]) => (
              <button key={id} onClick={() => setFilter(id)}
                style={{ ...s.filterBtn, ...(filter === id ? s.filterActive : {}) }}>{label}</button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 50, color: 'var(--text-faint)' }}><p style={{ fontSize: 32, marginBottom: 8 }}>📭</p><p>لا توجد بلاغات</p></div>
          ) : (
            filtered.map((r, i) => (
              <div key={r.id} className="glass fade-up"
                style={{ padding: 16, marginBottom: 10, borderRight: `4px solid ${pColor(r.priority_score)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>{r.category_ar || r.category || 'غير مصنف'}</span>
                  <div style={{ background: `${pColor(r.priority_score)}15`, padding: '4px 10px', borderRadius: 10, color: pColor(r.priority_score), fontSize: 13, fontWeight: 800 }}>{r.priority_score}</div>
                </div>
                {r.responsible_entity && (
                  <span style={{ display: 'inline-block', background: 'rgba(43,125,233,0.06)', color: 'var(--blue)', padding: '2px 8px', borderRadius: 8, fontSize: 10, marginBottom: 8 }}>
                    {ENTITY_NAMES_AR[r.responsible_entity] || r.responsible_entity}
                  </span>
                )}
                {r.description && <p style={{ color: 'var(--text-dim)', fontSize: 12, margin: '0 0 10px', lineHeight: 1.6 }}>{r.description}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-faint)' }}>
                  <span>{r.neighborhood || ''}</span>
                  <span style={{
                    color: r.status === 'resolved' ? 'var(--green)' : 'var(--orange)',
                    background: r.status === 'resolved' ? 'rgba(0,104,56,0.06)' : 'rgba(249,115,22,0.06)',
                    padding: '2px 8px', borderRadius: 8,
                  }}>{statusAr[r.status] || r.status}</span>
                </div>
              </div>
            ))
          )}
        </>
      ) : (
        <>
          <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 16 }}>ترتيب الشركات حسب نسبة التأخير</p>
          {getLeaderboard().length === 0 ? (
            <div style={{ textAlign: 'center', padding: 50, color: 'var(--text-faint)' }}><p>أرسلي بلاغات أولاً</p></div>
          ) : (
            getLeaderboard().map((c, i) => (
              <div key={c.entity} className="glass fade-up" style={{ padding: 16, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: i === 0 ? 'rgba(220,38,38,0.08)' : i === 1 ? 'rgba(249,115,22,0.08)' : 'var(--primary-light)',
                      color: i === 0 ? 'var(--red)' : i === 1 ? 'var(--orange)' : 'var(--primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800,
                    }}>#{i + 1}</div>
                    <span style={{ color: 'var(--text)', fontWeight: 700, fontSize: 14 }}>{c.entityAr}</span>
                  </div>
                  <span style={{ color: 'var(--red)', fontSize: 13, fontWeight: 800 }}>{c.delayRate}%</span>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.04)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 6, width: `${c.resolveRate}%`, background: c.resolveRate >= 70 ? 'var(--green)' : c.resolveRate >= 40 ? 'var(--yellow)' : 'var(--red)', transition: 'width 1.2s ease' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, color: 'var(--text-faint)' }}>
                  <span>إجمالي: {c.total}</span>
                  <span style={{ color: 'var(--orange)' }}>معلقة: {c.pending}</span>
                  <span style={{ color: 'var(--green)' }}>منجزة: {c.resolved}</span>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}

const s = {
  page: { padding: '20px 16px', maxWidth: 600, margin: '0 auto', minHeight: 'calc(100vh - 140px)' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 20 },
  tabs: { display: 'flex', marginBottom: 16, background: '#fff', borderRadius: 14, padding: 3, border: '1px solid rgba(0,0,0,0.04)' },
  tabBtn: { flex: 1, padding: '10px 16px', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 13, background: 'transparent', color: 'var(--text-dim)', fontFamily: 'Tajawal' },
  tabActive: { background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 },
  filterRow: { display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', paddingBottom: 4 },
  filterBtn: { padding: '6px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 11, whiteSpace: 'nowrap', background: '#fff', color: 'var(--text-dim)', fontFamily: 'Tajawal', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' },
  filterActive: { background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 },
};

export default Dashboard;
