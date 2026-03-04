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
      setStats(s);
      setReports(r || []);
      setLeaderboard(l || []);
      setClusters(c || []);
      setEscalation(e);
    } catch (err) { console.error('Dashboard error:', err); }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={s.page}>
        <div style={{ textAlign: 'center', padding: 100 }}>
          <div style={s.spinner} />
          <p style={{ color: 'var(--text-dim)', marginTop: 16, fontSize: 14 }}>جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const categoryData = stats ? Object.entries(stats.byCategory || {}).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value) : [];
  const entityData = stats ? Object.entries(stats.byEntity || {}).map(([name, value]) => ({ name: ENTITY_NAMES_AR[name] || name, value })).sort((a, b) => b.value - a.value) : [];
  const neighborhoodData = stats ? Object.entries(stats.byNeighborhood || {}).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value })) : [];

  const statusData = stats ? [
    { name: 'جديد', value: stats.new || 0, color: '#EAB308' },
    { name: 'قيد المعالجة', value: stats.inProgress || 0, color: '#2563EB' },
    { name: 'تم الحل', value: stats.resolved || 0, color: '#22C55E' },
  ] : [];

  // Priority distribution
  const priorityBuckets = [
    { range: 'حرج (80+)', count: reports.filter(r => r.priority_score >= 80).length, color: '#DC2626' },
    { range: 'مرتفع (60-79)', count: reports.filter(r => r.priority_score >= 60 && r.priority_score < 80).length, color: '#F97316' },
    { range: 'متوسط (40-59)', count: reports.filter(r => r.priority_score >= 40 && r.priority_score < 60).length, color: '#EAB308' },
    { range: 'منخفض (<40)', count: reports.filter(r => r.priority_score < 40).length, color: '#22C55E' },
  ];

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: '📊' },
    { id: 'ai', label: 'ذكاء اصطناعي', icon: '🤖' },
    { id: 'reports', label: 'البلاغات', icon: '📋' },
    { id: 'leaderboard', label: 'ترتيب الجهات', icon: '🏆' },
  ];

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ marginBottom: 28 }} className="fade-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: role === 'government' ? 'rgba(26,58,92,0.08)' : 'var(--primary-light)', border: `1px solid ${role === 'government' ? 'rgba(26,58,92,0.15)' : 'var(--primary-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{role === 'government' ? '🏛️' : '📊'}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', margin: 0 }}>{role === 'government' ? 'لوحة التحكم الحكومية' : 'لوحة التحكم'}</h1>
              {role === 'government' && (
                <span style={{ padding: '3px 10px', borderRadius: 6, background: 'linear-gradient(135deg, #1a3a5c, #2d5a8e)', color: '#fff', fontSize: 10, fontWeight: 700 }}>جهة حكومية</span>
              )}
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: 13, margin: 0 }}>{role === 'government' ? 'إدارة البلاغات ومتابعة أداء الجهات' : 'مراقبة البلاغات وأداء الذكاء الاصطناعي'} — {stats?.total || 0} بلاغ</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabBar} className="fade-up">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ ...s.tab, ...(activeTab === tab.id ? s.tabActive : {}) }}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* === TAB: Overview === */}
      {activeTab === 'overview' && (
        <div>
          {/* KPI Row */}
          <div style={s.kpiGrid} className="fade-up">
            {[
              { label: 'إجمالي البلاغات', value: stats?.total || 0, icon: '📋', color: '#03471f', bg: 'rgba(3,71,31,0.06)' },
              { label: 'بانتظار المعالجة', value: stats?.new || 0, icon: '⏳', color: '#EAB308', bg: 'rgba(234,179,8,0.08)' },
              { label: 'قيد المعالجة', value: stats?.inProgress || 0, icon: '🔄', color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
              { label: 'تم الحل', value: stats?.resolved || 0, icon: '✅', color: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
              { label: 'بلاغات حرجة', value: stats?.critical || 0, icon: '🚨', color: '#DC2626', bg: 'rgba(220,38,38,0.08)' },
              { label: 'متوسط الأولوية', value: stats?.avgScore || 0, icon: '⚡', color: '#F97316', bg: 'rgba(249,115,22,0.08)' },
            ].map((kpi, i) => (
              <div key={i} className={`glass fade-up stagger-${i + 1}`} style={{ ...s.kpiCard, borderTop: `3px solid ${kpi.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '0 0 6px', fontWeight: 500 }}>{kpi.label}</p>
                    <p style={{ fontSize: 32, fontWeight: 900, color: kpi.color, margin: 0, lineHeight: 1 }}>{kpi.value}</p>
                  </div>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{kpi.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            {/* Status Pie Chart */}
            <div className="glass fade-up" style={{ padding: 24 }}>
              <h3 style={s.sectionTitle}>حالة البلاغات</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => `${val} بلاغ`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                {statusData.map((s2, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: s2.color }} />
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{s2.name} ({s2.value})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Bar Chart */}
            <div className="glass fade-up" style={{ padding: 24 }}>
              <h3 style={s.sectionTitle}>البلاغات حسب الفئة</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#6B6560' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#1A1613' }} width={110} />
                  <Tooltip formatter={(val) => `${val} بلاغ`} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Second Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            {/* Neighborhood Bar */}
            <div className="glass fade-up" style={{ padding: 24 }}>
              <h3 style={s.sectionTitle}>أكثر الأحياء بلاغات</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={neighborhoodData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B6560' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B6560' }} />
                  <Tooltip formatter={(val) => `${val} بلاغ`} />
                  <Bar dataKey="value" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Priority Distribution */}
            <div className="glass fade-up" style={{ padding: 24 }}>
              <h3 style={s.sectionTitle}>توزيع الأولويات</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 8 }}>
                {priorityBuckets.map((b, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 4, background: b.color }} />
                        <span style={{ fontSize: 13, color: 'var(--text)' }}>{b.range}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 800, color: b.color }}>{b.count}</span>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.04)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 6, background: b.color, width: `${(b.count / (stats?.total || 1)) * 100}%`, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Entity pie mini */}
              <div style={{ marginTop: 20 }}>
                <h3 style={{ ...s.sectionTitle, marginTop: 0 }}>الجهات المسؤولة</h3>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={entityData.slice(0, 6)} cx="50%" cy="50%" outerRadius={55} paddingAngle={2} dataKey="value" stroke="none">
                      {entityData.slice(0, 6).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val, name) => [`${val} بلاغ`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === TAB: AI Intelligence === */}
      {activeTab === 'ai' && (
        <div className="fade-up">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
            {[
              { icon: '🎯', value: `${stats?.confidence?.average || 0}%`, label: 'متوسط ثقة AI', color: '#03471f' },
              { icon: '⚠️', value: stats?.confidence?.lowConfidenceCount || 0, label: 'ثقة منخفضة', color: '#EAB308' },
              { icon: '📍', value: stats?.clusters?.totalClusters || 0, label: 'مجموعات مكتشفة', color: '#2563EB' },
              { icon: '⬆️', value: escalation?.summary?.totalEscalated || 0, label: 'بلاغات مُصعّدة', color: '#F97316' },
            ].map((kpi, i) => (
              <div key={i} className="glass" style={{ padding: '20px 16px', textAlign: 'center' }}>
                <span style={{ fontSize: 24 }}>{kpi.icon}</span>
                <p style={{ fontSize: 28, fontWeight: 900, color: kpi.color, margin: '6px 0 2px' }}>{kpi.value}</p>
                <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* Clusters */}
          <div className="glass" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📍</div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', margin: 0 }}>التجميع الجغرافي الذكي</h3>
                <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '2px 0 0' }}>
                  {clusters.length > 0 ? `${clusters.length} مجموعة تضم ${stats?.clusters?.clusteredReports || 0} بلاغ` : 'لم يتم كشف مجموعات بعد'}
                </p>
              </div>
            </div>
            {clusters.length > 0 ? (
              <div style={{ display: 'grid', gap: 8 }}>
                {clusters.slice(0, 6).map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(37,99,235,0.03)', border: '1px solid rgba(37,99,235,0.08)', borderRadius: 14 }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>{c.category_ar || c.category}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '2px 0 0' }}>{c.neighborhood || 'غير محدد'}</p>
                    </div>
                    <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 22, fontWeight: 900, color: '#2563EB' }}>{c.size}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>بلاغ</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="📍" text="عند ورود بلاغات من نفس المنطقة سيتم تجميعها تلقائياً" />
            )}
          </div>

          {/* Escalation */}
          <div className="glass" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(249,115,22,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⚡</div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', margin: 0 }}>التصعيد الذكي</h3>
                <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '2px 0 0' }}>
                  {escalation?.summary ? `${escalation.summary.totalEscalated} بلاغ تم تصعيده — متوسط الرفع +${escalation.summary.avgBoost}` : 'لم يتم تصعيد أي بلاغ بعد'}
                </p>
              </div>
            </div>
            {escalation?.escalated?.length > 0 ? (
              <div style={{ display: 'grid', gap: 8 }}>
                {escalation.escalated.slice(0, 5).map((item, i) => (
                  <div key={i} style={{ padding: '14px 18px', background: 'rgba(249,115,22,0.03)', border: '1px solid rgba(249,115,22,0.08)', borderRadius: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{item.report.category_ar || item.report.category}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{item.baseScore}</span>
                        <span style={{ color: '#F97316' }}>→</span>
                        <span style={{ fontSize: 15, fontWeight: 900, color: item.level.color }}>{item.dynamicScore}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {item.factors.map((f, j) => (
                        <span key={j} style={{ padding: '3px 10px', borderRadius: 8, fontSize: 11, background: 'rgba(0,0,0,0.03)', color: 'var(--text-dim)' }}>
                          {f.icon} {f.name} +{f.boost}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="⚡" text="البلاغات القديمة أو المتكررة سيتم تصعيد أولويتها تلقائياً" />
            )}
          </div>
        </div>
      )}

      {/* === TAB: Reports === */}
      {activeTab === 'reports' && (
        <div className="fade-up">
          <div className="glass" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: 0 }}>جميع البلاغات ({reports.length})</h3>
              <button onClick={loadData} style={s.refreshBtn}>🔄 تحديث</button>
            </div>
            {reports.length === 0 ? (
              <EmptyState icon="📭" text="لا توجد بلاغات بعد — ارفع أول بلاغ!" />
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {reports.slice(0, 25).map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.015)', borderRadius: 12, border: '1px solid rgba(0,0,0,0.03)' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: r.priority_score >= 80 ? 'rgba(220,38,38,0.08)' : r.priority_score >= 60 ? 'rgba(249,115,22,0.08)' : r.priority_score >= 40 ? 'rgba(234,179,8,0.08)' : 'rgba(34,197,94,0.08)',
                      color: r.priority_score >= 80 ? '#DC2626' : r.priority_score >= 60 ? '#F97316' : r.priority_score >= 40 ? '#EAB308' : '#22C55E',
                      fontSize: 16, fontWeight: 900, flexShrink: 0,
                    }}>
                      {r.priority_score}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.category_ar || r.category || 'غير مصنف'}
                        </p>
                        {r.cluster_id && <span style={{ padding: '1px 8px', borderRadius: 6, fontSize: 10, background: 'rgba(37,99,235,0.08)', color: '#2563EB', fontWeight: 600 }}>مجموعة</span>}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>
                        {r.neighborhood || '—'} • {ENTITY_NAMES_AR[r.responsible_entity] || r.responsible_entity || '—'}
                      </p>
                    </div>
                    <span style={{
                      padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, flexShrink: 0,
                      background: r.status === 'resolved' ? 'rgba(34,197,94,0.08)' : r.status === 'in_progress' ? 'rgba(37,99,235,0.08)' : 'rgba(234,179,8,0.08)',
                      color: r.status === 'resolved' ? '#22C55E' : r.status === 'in_progress' ? '#2563EB' : '#EAB308',
                    }}>
                      {r.status === 'resolved' ? '✅ تم' : r.status === 'in_progress' ? '🔄 قيد المعالجة' : '⏳ جديد'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* === TAB: Leaderboard === */}
      {activeTab === 'leaderboard' && (
        <div className="fade-up">
          <div className="glass" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: '0 0 4px' }}>🏆 ترتيب الجهات حسب الأداء</h3>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '0 0 20px' }}>نسبة التأخير في معالجة البلاغات</p>

            {leaderboard.length === 0 ? (
              <EmptyState icon="🏆" text="لا توجد بيانات كافية بعد" />
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {leaderboard.map((entity, i) => {
                  const isFirst = i === 0;
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px',
                      background: isFirst ? 'rgba(220,38,38,0.03)' : 'transparent',
                      border: isFirst ? '2px solid rgba(220,38,38,0.12)' : '1px solid rgba(0,0,0,0.04)',
                      borderRadius: 16,
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isFirst ? 'rgba(220,38,38,0.08)' : 'rgba(0,0,0,0.03)',
                        color: isFirst ? '#DC2626' : 'var(--text-dim)',
                        fontSize: 16, fontWeight: 900, flexShrink: 0,
                      }}>
                        #{i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', margin: '0 0 4px' }}>
                          {ENTITY_NAMES_AR[entity.name] || entity.name}
                        </p>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>إجمالي: {entity.total}</span>
                          <span style={{ fontSize: 12, color: '#22C55E' }}>✅ {entity.resolved}</span>
                          <span style={{ fontSize: 12, color: '#EAB308' }}>⏳ {entity.pending}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <p style={{
                          fontSize: 24, fontWeight: 900, margin: 0,
                          color: entity.delayPercentage >= 70 ? '#DC2626' : entity.delayPercentage >= 40 ? '#F97316' : '#22C55E',
                        }}>
                          {entity.delayPercentage}%
                        </p>
                        <p style={{ fontSize: 10, color: 'var(--text-dim)', margin: 0 }}>نسبة التأخير</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Entity chart */}
          {entityData.length > 0 && (
            <div className="glass" style={{ padding: 24, marginTop: 16 }}>
              <h3 style={s.sectionTitle}>البلاغات حسب الجهة</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={entityData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#6B6560' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#1A1613' }} width={100} />
                  <Tooltip formatter={(val) => `${val} بلاغ`} />
                  <Bar dataKey="value" fill="#F97316" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-dim)' }}>
      <p style={{ fontSize: 40, margin: '0 0 10px' }}>{icon}</p>
      <p style={{ fontSize: 13, margin: 0 }}>{text}</p>
    </div>
  );
}

const s = {
  page: { padding: '36px 24px', maxWidth: 960, margin: '0 auto', minHeight: 'calc(100vh - 140px)' },
  spinner: {
    width: 44, height: 44, border: '3px solid rgba(3,71,31,0.1)', borderTopColor: 'var(--primary)',
    borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite',
  },
  tabBar: {
    display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(0,0,0,0.03)',
    padding: 4, borderRadius: 14, border: '1px solid rgba(0,0,0,0.04)',
  },
  tab: {
    flex: 1, padding: '10px 12px', border: 'none', background: 'transparent', borderRadius: 10,
    fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--text-dim)', transition: 'all 0.2s',
    fontFamily: "'Tajawal', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  tabActive: {
    background: '#fff', color: 'var(--primary)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 },
  kpiCard: { padding: '20px 18px' },
  sectionTitle: { fontSize: 15, fontWeight: 800, color: 'var(--text)', margin: '0 0 14px' },
  refreshBtn: {
    padding: '8px 16px', border: '1px solid rgba(0,0,0,0.06)', background: '#fff',
    borderRadius: 10, fontSize: 12, cursor: 'pointer', color: 'var(--text-dim)',
    fontFamily: "'Tajawal', sans-serif", fontWeight: 600,
  },
};

export default Dashboard;
