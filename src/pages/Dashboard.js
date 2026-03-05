import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDashboardStats, getAllReports, getLeaderboard } from '../services/reportService';
import { getClusterStats } from '../services/clusterService';
import { getEscalationReport } from '../services/escalationService';
import { ENTITY_NAMES_AR } from '../services/aiService';

const COLORS = ['#03471f', '#C5A656', '#2563EB', '#F97316', '#DC2626', '#22C55E', '#8B5CF6', '#EC4899'];

function Dashboard({ role }) {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [escalation, setEscalation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, r, l, c, e] = await Promise.all([
        getDashboardStats().catch(() => null),
        getAllReports().catch(() => []),
        getLeaderboard().catch(() => []),
        getClusterStats().catch(() => []),
        getEscalationReport().catch(() => ({ escalated: [], summary: null })),
      ]);
      setStats(s); setReports(r || []); setLeaderboard(l || []); setClusters(c || []); setEscalation(e);
    } catch (err) { console.error('Dashboard error:', err); }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={st.page}>
        <div style={{ textAlign: 'center', padding: 100 }}>
          <div style={{ width: 44, height: 44, border: '3px solid rgba(3,71,31,0.1)', borderTopColor: '#03471f', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#6B6560', marginTop: 16, fontSize: 14 }}>جاري تحميل لوحة المراقبة...</p>
        </div>
      </div>
    );
  }

  const categoryData = stats ? Object.entries(stats.byCategory || {}).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value) : [];
  const entityData = stats ? Object.entries(stats.byEntity || {}).map(([name, value]) => ({ name: ENTITY_NAMES_AR[name] || name, value })).sort((a, b) => b.value - a.value) : [];
  const neighborhoodData = stats ? Object.entries(stats.byNeighborhood || {}).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value })) : [];

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: '📊' },
    { id: 'charts', label: 'التحليلات', icon: '📈' },
    { id: 'reports', label: 'الحفريات', icon: '🚧' },
    { id: 'leaderboard', label: 'ترتيب الجهات', icon: '🏆' },
  ];

  return (
    <div style={st.page}>
      {/* Header */}
      <div style={{ marginBottom: 24 }} className="fade-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1A1613', margin: 0 }}>
              {role === 'government' ? '🏛️ لوحة مراقبة الحفريات' : '📊 لوحة المراقبة'}
            </h1>
            <p style={{ color: '#A0A0A0', fontSize: 12, margin: '4px 0 0' }}>{stats?.total || 0} حفرية مرصودة في أحياء الرياض</p>
          </div>
          <button onClick={loadData} style={{ padding: '8px 16px', border: '1px solid rgba(0,0,0,0.08)', background: '#fff', borderRadius: 10, fontSize: 12, cursor: 'pointer', color: '#6B6560', fontFamily: "'Tajawal', sans-serif", fontWeight: 600 }}>🔄 تحديث</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={st.tabBar} className="fade-up">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ ...st.tab, ...(activeTab === tab.id ? st.tabActive : {}) }}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* =============== TAB: OVERVIEW =============== */}
      {activeTab === 'overview' && (
        <div className="fade-up">
          {/* KPIs - 4 big numbers */}
          <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { value: stats?.total || 0, label: 'إجمالي الحفريات', color: '#1A1613', icon: '🚧' },
              { value: stats?.critical || 0, label: 'حرجة', color: '#DC2626', icon: '🔴' },
              { value: stats?.new || 0, label: 'بانتظار المعالجة', color: '#F97316', icon: '⏳' },
              { value: stats?.avgScore || 0, label: 'متوسط الأولوية', color: '#C5A656', icon: '⚡' },
            ].map((kpi, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 14, padding: '20px 16px', textAlign: 'center' }}>
                <span style={{ fontSize: 14 }}>{kpi.icon}</span>
                <p style={{ fontSize: 32, fontWeight: 900, color: kpi.color, margin: '4px 0 2px', lineHeight: 1 }}>{kpi.value}</p>
                <p style={{ fontSize: 11, color: '#A0A0A0', margin: 0 }}>{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* Two columns: Leaderboard + Recent Reports */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="info-grid">

            {/* Leaderboard Mini */}
            <div style={st.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1A1613', margin: 0 }}>🏆 ترتيب الجهات — الأكثر تأخيراً</h3>
                <button onClick={() => setActiveTab('leaderboard')} style={{ background: 'none', border: 'none', fontSize: 11, color: '#C5A656', cursor: 'pointer', fontFamily: "'Tajawal', sans-serif", fontWeight: 700 }}>عرض الكل ←</button>
              </div>
              {leaderboard.length === 0 ? (
                <p style={{ fontSize: 13, color: '#A0A0A0', textAlign: 'center', padding: 24 }}>لا توجد بيانات بعد</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {leaderboard.slice(0, 5).map((entity, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: i === 0 ? 'rgba(220,38,38,0.03)' : 'transparent', borderRadius: 10, border: i === 0 ? '1px solid rgba(220,38,38,0.08)' : '1px solid transparent' }}>
                      <span style={{ fontSize: 13, fontWeight: 900, color: i === 0 ? '#DC2626' : '#A0A0A0', width: 22 }}>#{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#1A1613', margin: 0 }}>{ENTITY_NAMES_AR[entity.name] || entity.name}</p>
                        <p style={{ fontSize: 11, color: '#A0A0A0', margin: 0 }}>{entity.total} حفرية • {entity.pending} بانتظار</p>
                      </div>
                      <span style={{ fontSize: 18, fontWeight: 900, color: entity.delayPercentage >= 70 ? '#DC2626' : entity.delayPercentage >= 40 ? '#F97316' : '#22C55E' }}>
                        {entity.delayPercentage}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Reports */}
            <div style={st.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1A1613', margin: 0 }}>🕐 آخر البلاغات</h3>
                <button onClick={() => setActiveTab('reports')} style={{ background: 'none', border: 'none', fontSize: 11, color: '#C5A656', cursor: 'pointer', fontFamily: "'Tajawal', sans-serif", fontWeight: 700 }}>عرض الكل ←</button>
              </div>
              {reports.length === 0 ? (
                <p style={{ fontSize: 13, color: '#A0A0A0', textAlign: 'center', padding: 24 }}>لا توجد بلاغات بعد</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {reports.slice(0, 6).map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 10, background: i % 2 === 0 ? 'rgba(0,0,0,0.015)' : 'transparent' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 900,
                        background: r.priority_score >= 80 ? 'rgba(220,38,38,0.08)' : r.priority_score >= 60 ? 'rgba(249,115,22,0.08)' : 'rgba(234,179,8,0.08)',
                        color: r.priority_score >= 80 ? '#DC2626' : r.priority_score >= 60 ? '#F97316' : '#EAB308',
                      }}>{r.priority_score}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: '#1A1613', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.category_ar || 'غير مصنف'}</p>
                        <p style={{ fontSize: 10, color: '#A0A0A0', margin: 0 }}>{r.neighborhood || '—'} • {ENTITY_NAMES_AR[r.responsible_entity] || '—'}</p>
                      </div>
                      <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, fontWeight: 600, background: r.status === 'resolved' ? 'rgba(34,197,94,0.08)' : r.status === 'in_progress' ? 'rgba(37,99,235,0.08)' : 'rgba(234,179,8,0.08)', color: r.status === 'resolved' ? '#22C55E' : r.status === 'in_progress' ? '#2563EB' : '#EAB308' }}>
                        {r.status === 'resolved' ? 'تم' : r.status === 'in_progress' ? 'قيد' : 'جديد'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
            {[
              { icon: '🎯', value: `${stats?.confidence?.average || 0}%`, label: 'متوسط ثقة AI', color: '#03471f' },
              { icon: '📍', value: stats?.clusters?.totalClusters || 0, label: 'مجموعات مكتشفة', color: '#2563EB' },
              { icon: '⬆️', value: escalation?.summary?.totalEscalated || 0, label: 'تم تصعيدها', color: '#F97316' },
            ].map((kpi, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 12, padding: '16px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22 }}>{kpi.icon}</span>
                <div>
                  <p style={{ fontSize: 20, fontWeight: 900, color: kpi.color, margin: 0, lineHeight: 1 }}>{kpi.value}</p>
                  <p style={{ fontSize: 10, color: '#A0A0A0', margin: 0 }}>{kpi.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =============== TAB: CHARTS =============== */}
      {activeTab === 'charts' && (
        <div className="fade-up">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="info-grid">
            {/* Category */}
            <div style={st.card}>
              <h3 style={st.cardTitle}>الحفريات حسب النوع</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#A0A0A0' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#1A1613' }} width={110} />
                  <Tooltip formatter={(val) => `${val} حفرية`} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Entity */}
            <div style={st.card}>
              <h3 style={st.cardTitle}>الحفريات حسب الجهة</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={entityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#A0A0A0' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#1A1613' }} width={100} />
                  <Tooltip formatter={(val) => `${val} حفرية`} />
                  <Bar dataKey="value" fill="#C5A656" radius={[0, 6, 6, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Neighborhood */}
            <div style={st.card}>
              <h3 style={st.cardTitle}>أكثر الأحياء حفريات</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={neighborhoodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#A0A0A0' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#A0A0A0' }} />
                  <Tooltip formatter={(val) => `${val} حفرية`} />
                  <Bar dataKey="value" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Status Pie */}
            <div style={st.card}>
              <h3 style={st.cardTitle}>حالة الحفريات</h3>
              {(() => {
                const statusData = [
                  { name: 'جديد', value: stats?.new || 0, color: '#EAB308' },
                  { name: 'قيد المعالجة', value: stats?.inProgress || 0, color: '#2563EB' },
                  { name: 'تم الحل', value: stats?.resolved || 0, color: '#22C55E' },
                ];
                return (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none">
                          {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(val) => `${val} حفرية`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 4 }}>
                      {statusData.map((s2, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: s2.color }} />
                          <span style={{ fontSize: 11, color: '#6B6560' }}>{s2.name} ({s2.value})</span>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Priority distribution */}
          <div style={{ ...st.card, marginTop: 16 }}>
            <h3 style={st.cardTitle}>توزيع الأولويات</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }} className="kpi-grid">
              {[
                { range: 'حرج (80+)', count: reports.filter(r => r.priority_score >= 80).length, color: '#DC2626' },
                { range: 'مرتفع (60-79)', count: reports.filter(r => r.priority_score >= 60 && r.priority_score < 80).length, color: '#F97316' },
                { range: 'متوسط (40-59)', count: reports.filter(r => r.priority_score >= 40 && r.priority_score < 60).length, color: '#EAB308' },
                { range: 'منخفض (<40)', count: reports.filter(r => r.priority_score < 40).length, color: '#22C55E' },
              ].map((b, i) => (
                <div key={i} style={{ textAlign: 'center', padding: 16 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: b.color, margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 24, fontWeight: 900, color: b.color, margin: '0 0 2px' }}>{b.count}</p>
                  <p style={{ fontSize: 11, color: '#A0A0A0', margin: 0 }}>{b.range}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =============== TAB: REPORTS =============== */}
      {activeTab === 'reports' && (
        <div className="fade-up">
          <div style={st.card}>
            <h3 style={{ ...st.cardTitle, marginBottom: 16 }}>جميع الحفريات ({reports.length})</h3>
            {reports.length === 0 ? (
              <Empty icon="📭" text="لا توجد حفريات — بلّغ عن أول حفرية!" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {reports.slice(0, 30).map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, background: i % 2 === 0 ? 'rgba(0,0,0,0.015)' : 'transparent' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, fontWeight: 900,
                      background: r.priority_score >= 80 ? 'rgba(220,38,38,0.08)' : r.priority_score >= 60 ? 'rgba(249,115,22,0.08)' : r.priority_score >= 40 ? 'rgba(234,179,8,0.08)' : 'rgba(34,197,94,0.08)',
                      color: r.priority_score >= 80 ? '#DC2626' : r.priority_score >= 60 ? '#F97316' : r.priority_score >= 40 ? '#EAB308' : '#22C55E',
                    }}>{r.priority_score}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1613', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.category_ar || r.category || 'غير مصنف'}</p>
                        {r.cluster_id && <span style={{ padding: '1px 6px', borderRadius: 4, fontSize: 9, background: 'rgba(37,99,235,0.08)', color: '#2563EB', fontWeight: 600 }}>مجموعة</span>}
                      </div>
                      <p style={{ fontSize: 11, color: '#A0A0A0', margin: 0 }}>{r.neighborhood || '—'} • {ENTITY_NAMES_AR[r.responsible_entity] || r.responsible_entity || '—'}</p>
                    </div>
                    <span style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, flexShrink: 0,
                      background: r.status === 'resolved' ? 'rgba(34,197,94,0.08)' : r.status === 'in_progress' ? 'rgba(37,99,235,0.08)' : 'rgba(234,179,8,0.08)',
                      color: r.status === 'resolved' ? '#22C55E' : r.status === 'in_progress' ? '#2563EB' : '#EAB308',
                    }}>
                      {r.status === 'resolved' ? '✅ تم' : r.status === 'in_progress' ? '🔄 قيد' : '⏳ جديد'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =============== TAB: LEADERBOARD =============== */}
      {activeTab === 'leaderboard' && (
        <div className="fade-up">
          {/* Top 3 podium */}
          {leaderboard.length >= 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
              {leaderboard.slice(0, 3).map((entity, i) => {
                const medals = ['🥇', '🥈', '🥉'];
                const colors = ['#DC2626', '#F97316', '#EAB308'];
                return (
                  <div key={i} style={{ background: '#fff', border: `2px solid ${colors[i]}15`, borderRadius: 16, padding: 24, textAlign: 'center' }}>
                    <span style={{ fontSize: 32 }}>{medals[i]}</span>
                    <p style={{ fontSize: 15, fontWeight: 800, color: '#1A1613', margin: '8px 0 4px' }}>{ENTITY_NAMES_AR[entity.name] || entity.name}</p>
                    <p style={{ fontSize: 36, fontWeight: 900, color: colors[i], margin: '0 0 4px', lineHeight: 1 }}>{entity.delayPercentage}%</p>
                    <p style={{ fontSize: 11, color: '#A0A0A0', margin: 0 }}>نسبة التأخير</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 10, fontSize: 11, color: '#6B6560' }}>
                      <span>📋 {entity.total}</span>
                      <span>✅ {entity.resolved}</span>
                      <span>⏳ {entity.pending}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full list */}
          <div style={st.card}>
            <h3 style={{ ...st.cardTitle, marginBottom: 16 }}>🏆 ترتيب كامل — نسبة التأخير</h3>
            {leaderboard.length === 0 ? (
              <Empty icon="🏆" text="لا توجد بيانات كافية بعد" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {leaderboard.map((entity, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, background: i === 0 ? 'rgba(220,38,38,0.02)' : 'transparent', border: '1px solid rgba(0,0,0,0.03)' }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: i < 3 ? '#DC2626' : '#A0A0A0', width: 28, textAlign: 'center' }}>#{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1613', margin: '0 0 2px' }}>{ENTITY_NAMES_AR[entity.name] || entity.name}</p>
                      <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#A0A0A0' }}>
                        <span>إجمالي: {entity.total}</span>
                        <span style={{ color: '#22C55E' }}>✅ {entity.resolved}</span>
                        <span style={{ color: '#EAB308' }}>⏳ {entity.pending}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: 22, fontWeight: 900, margin: 0, color: entity.delayPercentage >= 70 ? '#DC2626' : entity.delayPercentage >= 40 ? '#F97316' : '#22C55E' }}>{entity.delayPercentage}%</p>
                      <p style={{ fontSize: 9, color: '#A0A0A0', margin: 0 }}>تأخير</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Entity chart */}
          {entityData.length > 0 && (
            <div style={{ ...st.card, marginTop: 16 }}>
              <h3 style={st.cardTitle}>توزيع الحفريات حسب الجهة</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={entityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#A0A0A0' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#1A1613' }} width={100} />
                  <Tooltip formatter={(val) => `${val} حفرية`} />
                  <Bar dataKey="value" fill="#C5A656" radius={[0, 6, 6, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Empty({ icon, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 20px', color: '#A0A0A0' }}>
      <p style={{ fontSize: 36, margin: '0 0 8px' }}>{icon}</p>
      <p style={{ fontSize: 13, margin: 0 }}>{text}</p>
    </div>
  );
}

const st = {
  page: { padding: '32px 24px', maxWidth: 960, margin: '0 auto', minHeight: 'calc(100vh - 140px)' },
  tabBar: {
    display: 'flex', gap: 3, marginBottom: 20, background: 'rgba(0,0,0,0.03)',
    padding: 3, borderRadius: 12, border: '1px solid rgba(0,0,0,0.04)',
  },
  tab: {
    flex: 1, padding: '9px 10px', border: 'none', background: 'transparent', borderRadius: 9,
    fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#A0A0A0', transition: 'all 0.2s',
    fontFamily: "'Tajawal', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
  },
  tabActive: { background: '#fff', color: '#03471f', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  card: { background: '#fff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 16, padding: 22 },
  cardTitle: { fontSize: 14, fontWeight: 800, color: '#1A1613', margin: '0 0 14px' },
};

export default Dashboard;