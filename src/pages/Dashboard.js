import React, { useState, useEffect } from 'react';
import { getDashboardStats, getAllReports, getLeaderboard } from '../services/reportService';
import { getClusterStats } from '../services/clusterService';
import { getEscalationReport } from '../services/escalationService';
import { ENTITY_NAMES_AR} from '../services/aiService';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [escalation, setEscalation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

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
    } catch (err) {
      console.error('Dashboard load error:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={s.page}>
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={s.spinner} />
          <p style={{ color: 'var(--text-dim)', marginTop: 16, fontSize: 14 }}>جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: '📊 نظرة عامة' },
    { id: 'ai', label: '🤖 ذكاء اصطناعي' },
    { id: 'reports', label: '📋 البلاغات' },
    { id: 'leaderboard', label: '🏆 ترتيب الجهات' },
  ];

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }} className="fade-up">
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1A1613', margin: '0 0 6px' }}>لوحة التحكم</h1>
        <p style={{ color: '#6B6560', fontSize: 14 }}>مراقبة البلاغات وأداء الذكاء الاصطناعي</p>
      </div>

      {/* Tabs */}
      <div style={s.tabBar} className="fade-up">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ ...s.tab, ...(activeTab === tab.id ? s.tabActive : {}) }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Overview */}
      {activeTab === 'overview' && (
        <div className="fade-up">
          {/* KPI Cards */}
          <div style={s.kpiGrid}>
            {[
              { label: 'إجمالي البلاغات', value: stats?.total || 0, icon: '📋', color: '#1B7F5F' },
              { label: 'بانتظار المعالجة', value: stats?.new || 0, icon: '⏳', color: '#EAB308' },
              { label: 'قيد المعالجة', value: stats?.inProgress || 0, icon: '🔄', color: '#3B82F6' },
              { label: 'تم الحل', value: stats?.resolved || 0, icon: '✅', color: '#22C55E' },
              { label: 'بلاغات حرجة', value: stats?.critical || 0, icon: '🚨', color: '#DC2626' },
              { label: 'متوسط الأولوية', value: stats?.avgScore || 0, icon: '⚡', color: '#F97316' },
            ].map((kpi, i) => (
              <div key={i} className="glass" style={s.kpiCard}>
                <span style={{ fontSize: 28 }}>{kpi.icon}</span>
                <p style={{ fontSize: 28, fontWeight: 800, color: kpi.color, margin: '6px 0 2px' }}>{kpi.value}</p>
                <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* Category & Neighborhood breakdown */}
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
              {/* By Category */}
              <div className="glass" style={{ padding: 20 }}>
                <h3 style={s.sectionTitle}>📂 حسب الفئة</h3>
                {Object.entries(stats.byCategory || {}).sort((a, b) => b[1] - a[1]).map(([cat, count], i) => {
                  const pct = Math.round((count / stats.total) * 100);
                  return (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: '#1A1613' }}>{cat}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={s.barBg}>
                        <div style={{ ...s.barFill, width: `${pct}%`, background: '#1B7F5F' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* By Neighborhood */}
              <div className="glass" style={{ padding: 20 }}>
                <h3 style={s.sectionTitle}>🏘️ حسب الحي</h3>
                {Object.entries(stats.byNeighborhood || {}).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([hood, count], i) => {
                  const pct = Math.round((count / stats.total) * 100);
                  return (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: '#1A1613' }}>{hood}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{count}</span>
                      </div>
                      <div style={s.barBg}>
                        <div style={{ ...s.barFill, width: `${pct}%`, background: '#3B82F6' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: AI Intelligence */}
      {activeTab === 'ai' && (
        <div className="fade-up">
          {/* AI KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
            <div className="glass" style={s.aiKpi}>
              <span style={{ fontSize: 22 }}>🎯</span>
              <p style={{ fontSize: 24, fontWeight: 800, color: '#1B7F5F', margin: '4px 0 2px' }}>{stats?.confidence?.average || 0}%</p>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>متوسط ثقة AI</p>
            </div>
            <div className="glass" style={s.aiKpi}>
              <span style={{ fontSize: 22 }}>⚠️</span>
              <p style={{ fontSize: 24, fontWeight: 800, color: '#EAB308', margin: '4px 0 2px' }}>{stats?.confidence?.lowConfidenceCount || 0}</p>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>ثقة منخفضة</p>
            </div>
            <div className="glass" style={s.aiKpi}>
              <span style={{ fontSize: 22 }}>📍</span>
              <p style={{ fontSize: 24, fontWeight: 800, color: '#2563EB', margin: '4px 0 2px' }}>{stats?.clusters?.totalClusters || 0}</p>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>مجموعات مكتشفة</p>
            </div>
            <div className="glass" style={s.aiKpi}>
              <span style={{ fontSize: 22 }}>⬆️</span>
              <p style={{ fontSize: 24, fontWeight: 800, color: '#F97316', margin: '4px 0 2px' }}>{escalation?.summary?.totalEscalated || 0}</p>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>بلاغات مُصعّدة</p>
            </div>
          </div>

          {/* Clusters Section */}
          <div className="glass" style={{ padding: 20, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📍</div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1613', margin: 0 }}>التجميع الجغرافي الذكي</h3>
                <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '2px 0 0' }}>
                  {clusters.length > 0 ? `${clusters.length} مجموعة تضم ${stats?.clusters?.clusteredReports || 0} بلاغ` : 'لم يتم كشف مجموعات بعد'}
                </p>
              </div>
            </div>
            {clusters.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {clusters.slice(0, 5).map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: 12 }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1613', margin: 0 }}>{c.category_ar || c.category}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '2px 0 0' }}>{c.neighborhood || 'غير محدد'}</p>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: '#2563EB' }}>{c.size}</span>
                      <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>بلاغ</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-dim)' }}>
                <p style={{ fontSize: 32, margin: '0 0 8px' }}>📍</p>
                <p style={{ fontSize: 13, margin: 0 }}>عند ورود بلاغات من نفس المنطقة والفئة، سيتم تجميعها تلقائياً</p>
              </div>
            )}
          </div>

          {/* Escalation Section */}
          <div className="glass" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚡</div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1613', margin: 0 }}>التصعيد الذكي</h3>
                <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '2px 0 0' }}>
                  {escalation?.summary ? `${escalation.summary.totalEscalated} بلاغ تم تصعيده — متوسط الرفع +${escalation.summary.avgBoost}` : 'البلاغات الجديدة لم تصعّد بعد'}
                </p>
              </div>
            </div>
            {escalation?.escalated?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {escalation.escalated.slice(0, 5).map((item, i) => (
                  <div key={i} style={{ padding: '12px 16px', background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1613' }}>
                        {item.report.category_ar || item.report.category}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{item.baseScore}</span>
                        <span style={{ fontSize: 12, color: '#F97316' }}>→</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: item.level.color }}>{item.dynamicScore}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {item.factors.map((f, j) => (
                        <span key={j} style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, background: 'rgba(0,0,0,0.04)', color: 'var(--text-dim)' }}>
                          {f.icon} {f.name} +{f.boost}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-dim)' }}>
                <p style={{ fontSize: 32, margin: '0 0 8px' }}>⚡</p>
                <p style={{ fontSize: 13, margin: 0 }}>البلاغات القديمة أو المتكررة سيتم تصعيد أولويتها تلقائياً</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Reports */}
      {activeTab === 'reports' && (
        <div className="fade-up">
          <div className="glass" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={s.sectionTitle}>جميع البلاغات ({reports.length})</h3>
              <button onClick={loadData} style={s.refreshBtn}>🔄 تحديث</button>
            </div>
            {reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>
                <p style={{ fontSize: 48, margin: '0 0 12px' }}>📭</p>
                <p style={{ fontSize: 14 }}>لا توجد بلاغات بعد — ارفع أول بلاغ!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reports.slice(0, 20).map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'rgba(245,241,237,0.3)', borderRadius: 14, border: '1px solid rgba(157,124,95,0.1)' }}>
                    {/* Priority circle */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: r.priority_score >= 80 ? 'rgba(220,38,38,0.1)' : r.priority_score >= 60 ? 'rgba(249,115,22,0.1)' : 'rgba(34,197,94,0.1)',
                      color: r.priority_score >= 80 ? '#DC2626' : r.priority_score >= 60 ? '#F97316' : '#22C55E',
                      fontSize: 16, fontWeight: 800, flexShrink: 0,
                    }}>
                      {r.priority_score}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1613', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.category_ar || r.category || 'غير مصنف'}
                        </p>
                        {r.cluster_id && <span style={{ padding: '1px 6px', borderRadius: 4, fontSize: 10, background: 'rgba(59,130,246,0.1)', color: '#2563EB' }}>مجموعة</span>}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>
                        {r.neighborhood || '—'} • {ENTITY_NAMES_AR[r.responsible_entity] || r.responsible_entity || '—'}
                      </p>
                    </div>
                    {/* Status badge */}
                    <span style={{
                      padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, flexShrink: 0,
                      background: r.status === 'resolved' ? 'rgba(34,197,94,0.1)' : r.status === 'in_progress' ? 'rgba(59,130,246,0.1)' : 'rgba(234,179,8,0.1)',
                      color: r.status === 'resolved' ? '#22C55E' : r.status === 'in_progress' ? '#3B82F6' : '#EAB308',
                    }}>
                      {r.status === 'resolved' ? 'تم' : r.status === 'in_progress' ? 'قيد المعالجة' : 'جديد'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="fade-up">
          <div className="glass" style={{ padding: 20 }}>
            <h3 style={{ ...s.sectionTitle, marginBottom: 6 }}>🏆 ترتيب الجهات حسب الأداء</h3>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '0 0 20px' }}>الجهات الأكثر تأخراً في معالجة البلاغات</p>

            {leaderboard.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>
                <p style={{ fontSize: 48, margin: '0 0 12px' }}>🏆</p>
                <p style={{ fontSize: 14 }}>لا توجد بيانات كافية بعد</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {leaderboard.map((entity, i) => {
                  const isFirst = i === 0;
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                      background: isFirst ? 'rgba(220,38,38,0.04)' : 'rgba(245,241,237,0.3)',
                      border: isFirst ? '2px solid rgba(220,38,38,0.15)' : '1px solid rgba(157,124,95,0.1)',
                      borderRadius: 14,
                    }}>
                      {/* Rank */}
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isFirst ? 'rgba(220,38,38,0.1)' : 'rgba(0,0,0,0.04)',
                        color: isFirst ? '#DC2626' : '#6B6560',
                        fontSize: 16, fontWeight: 800, flexShrink: 0,
                      }}>
                        #{i + 1}
                      </div>
                      {/* Entity info */}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1613', margin: '0 0 4px' }}>
                          {ENTITY_NAMES_AR[entity.name] || entity.name}
                        </p>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>إجمالي: {entity.total}</span>
                          <span style={{ fontSize: 12, color: '#22C55E' }}>✅ {entity.resolved}</span>
                          <span style={{ fontSize: 12, color: '#EAB308' }}>⏳ {entity.pending}</span>
                        </div>
                      </div>
                      {/* Delay % */}
                      <div style={{ textAlign: 'left' }}>
                        <p style={{
                          fontSize: 22, fontWeight: 800, margin: 0,
                          color: entity.delayPercentage >= 70 ? '#DC2626' : entity.delayPercentage >= 40 ? '#F97316' : '#22C55E',
                        }}>
                          {entity.delayPercentage}%
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: 0 }}>نسبة التأخير</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Entity breakdown by count */}
          {stats?.byEntity && (
            <div className="glass" style={{ padding: 20, marginTop: 14 }}>
              <h3 style={s.sectionTitle}>🏢 البلاغات حسب الجهة</h3>
              {Object.entries(stats.byEntity).sort((a, b) => b[1] - a[1]).map(([entity, count], i) => {
                const pct = Math.round((count / stats.total) * 100);
                return (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: '#1A1613' }}>{ENTITY_NAMES_AR[entity] || entity}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{count} ({pct}%)</span>
                    </div>
                    <div style={s.barBg}>
                      <div style={{ ...s.barFill, width: `${pct}%`, background: '#F97316' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { padding: '40px 20px', maxWidth: 900, margin: '0 auto', minHeight: 'calc(100vh - 140px)' },
  spinner: {
    width: 44, height: 44, border: '3px solid rgba(27,127,95,0.12)', borderTopColor: 'var(--primary)',
    borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite',
  },
  tabBar: {
    display: 'flex', gap: 6, marginBottom: 20, background: 'rgba(245,241,237,0.5)',
    padding: 4, borderRadius: 14, border: '1px solid rgba(157,124,95,0.1)',
  },
  tab: {
    flex: 1, padding: '10px 12px', border: 'none', background: 'transparent', borderRadius: 10,
    fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#6B6560', transition: 'all 0.2s',
    fontFamily: "'Tajawal', sans-serif",
  },
  tabActive: {
    background: '#fff', color: '#1B7F5F', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  kpiGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
  },
  kpiCard: {
    padding: '20px 16px', textAlign: 'center',
  },
  aiKpi: {
    padding: '16px 12px', textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 15, fontWeight: 700, color: '#1A1613', margin: '0 0 14px',
  },
  barBg: {
    background: 'rgba(0,0,0,0.04)', borderRadius: 6, height: 6, overflow: 'hidden',
  },
  barFill: {
    height: '100%', borderRadius: 6, transition: 'width 0.8s ease',
  },
  refreshBtn: {
    padding: '6px 14px', border: '1px solid rgba(157,124,95,0.15)', background: '#fff',
    borderRadius: 8, fontSize: 12, cursor: 'pointer', color: '#6B6560',
    fontFamily: "'Tajawal', sans-serif",
  },
};

export default Dashboard;