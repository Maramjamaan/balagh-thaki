import React, { useState } from 'react';

const excavations = [
  { id: 1, company: 'المياه الوطنية (NWC)', location: 'طريق الملك فهد', lat: 24.7136, lng: 46.6753, daysDelayed: 45, licenseDays: 60, status: 'متأخرة' },
  { id: 2, company: 'السعودية للكهرباء (SEC)', location: 'طريق الملك عبدالله', lat: 24.7200, lng: 46.6800, daysDelayed: 0, licenseDays: 30, status: 'في الموعد' },
  { id: 3, company: 'STC', location: 'طريق العليا', lat: 24.7300, lng: 46.6700, daysDelayed: 15, licenseDays: 45, status: 'متأخرة' },
  { id: 4, company: 'موبايلي', location: 'شارع التخصصي', lat: 24.7100, lng: 46.6900, daysDelayed: 0, licenseDays: 30, status: 'في الموعد' },
  { id: 5, company: 'المياه الوطنية (NWC)', location: 'طريق الملك خالد', lat: 24.7400, lng: 46.6600, daysDelayed: 22, licenseDays: 60, status: 'متأخرة' },
];

function MapPage() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('الكل');

  const filtered = excavations.filter(e => {
    if (filter === 'متأخرة فقط') return e.status === 'متأخرة';
    if (filter === 'في الموعد') return e.status === 'في الموعد';
    return true;
  });

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* Header */}
        <div style={{ marginBottom: 28, textAlign: 'right' }}>
          <h1 style={s.title}>خريطة الحفريات</h1>
          <p style={s.subtitle}>متابعة حية لجميع الحفريات المرخصة في الرياض</p>
        </div>

        <div style={s.grid}>
          {/* Map */}
          <div style={s.mapWrapper}>
            <div style={s.mapCard}>
              {/* Map Header */}
              <div style={s.mapHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span style={{ color: '#fff', fontSize: 15, fontWeight: 500 }}>خريطة الرياض التفاعلية</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
                  <select value={filter} onChange={e => setFilter(e.target.value)} style={s.filterSelect}>
                    <option>الكل</option>
                    <option>متأخرة فقط</option>
                    <option>في الموعد</option>
                  </select>
                </div>
              </div>

              {/* Map Area */}
              <div style={s.mapArea}>
                {/* Grid bg */}
                <div style={s.gridBg}>
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i} style={{ border: '1px solid rgba(157,124,95,0.06)' }} />
                  ))}
                </div>

                {/* Markers */}
                {filtered.map(exc => {
                  const left = `${((exc.lng - 46.65) / 0.05) * 100}%`;
                  const top = `${100 - ((exc.lat - 24.70) / 0.05) * 100}%`;
                  const isDelayed = exc.status === 'متأخرة';
                  return (
                    <button key={exc.id} onClick={() => setSelected(exc)}
                      style={{ ...s.marker, left, top }}>
                      {isDelayed && <span style={s.pulse} />}
                      <div style={{ ...s.dot, background: isDelayed ? '#DC3545' : '#1B7F5F' }}>
                        <div style={s.dotInner} />
                      </div>
                    </button>
                  );
                })}

                {/* Legend */}
                <div style={s.legend}>
                  <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px' }}>دليل الألوان</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#DC3545' }} />
                    <span style={{ fontSize: 13 }}>متأخرة</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#1B7F5F' }} />
                    <span style={{ fontSize: 13 }}>في الموعد</span>
                  </div>
                </div>

                {/* Scale */}
                <div style={s.scale}>
                  <div style={{ height: 3, width: 60, background: '#1A1613', borderRadius: 2 }} />
                  <span style={{ fontSize: 11 }}>5 كم</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={s.sidebar}>
            {/* Stats */}
            <div style={s.card}>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 20px' }}>إحصائيات الحفريات</h3>
              <div style={s.statRow}>
                <span style={{ color: '#6B6560', fontSize: 14 }}>إجمالي الحفريات</span>
                <span style={{ fontSize: 22, fontWeight: 700 }}>156</span>
              </div>
              <div style={s.statRow}>
                <span style={{ color: '#6B6560', fontSize: 14 }}>متأخرة</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#DC3545' }}>30</span>
              </div>
              <div style={s.statRow}>
                <span style={{ color: '#6B6560', fontSize: 14 }}>في الموعد</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#1B7F5F' }}>126</span>
              </div>
            </div>

            {/* Selected or Placeholder */}
            {selected ? (
              <div style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>تفاصيل الحفرية</h3>
                  <button onClick={() => setSelected(null)} style={s.closeBtn}>✕</button>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <p style={s.detailLabel}>الموقع</p>
                  <p style={s.detailValue}>{selected.location}</p>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <p style={s.detailLabel}>الشركة</p>
                  <p style={s.detailValue}>{selected.company}</p>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <p style={s.detailLabel}>الحالة</p>
                  <span style={{
                    display: 'inline-block', padding: '4px 14px', borderRadius: 10,
                    fontSize: 13, fontWeight: 600, color: '#fff',
                    background: selected.status === 'متأخرة' ? '#DC3545' : '#1B7F5F',
                  }}>{selected.status}</span>
                </div>
                {selected.daysDelayed > 0 ? (
                  <div style={{ ...s.alertBox, background: 'rgba(220,53,69,0.08)', border: '2px solid rgba(220,53,69,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC3545" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      <span style={{ fontWeight: 500 }}>متأخرة عن الموعد</span>
                    </div>
                    <p style={{ fontSize: 24, fontWeight: 700, color: '#DC3545', margin: '0 0 4px' }}>{selected.daysDelayed} يوم</p>
                    <p style={{ fontSize: 13, color: '#6B6560', margin: 0 }}>من أصل {selected.licenseDays} يوم ترخيص</p>
                  </div>
                ) : (
                  <div style={{ ...s.alertBox, background: 'rgba(27,127,95,0.08)', border: '2px solid rgba(27,127,95,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B7F5F" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span style={{ fontWeight: 500 }}>في الموعد المحدد</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#6B6560', margin: 0 }}>مدة الترخيص: {selected.licenseDays} يوم</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={s.placeholder}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#A0A0A0" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <p style={{ color: '#6B6560', margin: '12px 0 0', fontSize: 14 }}>انقر على أي علامة في الخريطة لعرض التفاصيل</p>
              </div>
            )}

            {/* About */}
            <div style={s.aboutCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1613" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>عن الخريطة</h3>
              </div>
              <p style={{ fontSize: 13, color: '#6B6560', lineHeight: 1.8, margin: 0 }}>
                تعرض الخريطة جميع الحفريات المرخصة في الرياض مع عداد تنازلي لكل منها. العلامات الحمراء تشير للحفريات المتأخرة، والخضراء للحفريات في الموعد.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: 'calc(100vh - 140px)', padding: '40px 16px' },
  container: { maxWidth: 1200, margin: '0 auto' },
  title: { fontSize: 36, fontWeight: 700, color: '#1A1613', margin: '0 0 6px', fontFamily: "'Tajawal', sans-serif" },
  subtitle: { fontSize: 16, color: '#6B6560', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 },
  mapWrapper: { minWidth: 0 },
  mapCard: {
    background: '#fff', borderRadius: 20, overflow: 'hidden',
    border: '2px solid rgba(157,124,95,0.15)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  },
  mapHeader: {
    background: '#1B7F5F', padding: '14px 20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  filterSelect: {
    background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: 8, padding: '6px 12px', color: '#fff', fontSize: 13,
    outline: 'none', fontFamily: "'Tajawal', sans-serif", cursor: 'pointer',
  },
  mapArea: {
    position: 'relative', height: 500, background: 'rgba(245,241,237,0.3)', padding: 32,
  },
  gridBg: {
    position: 'absolute', inset: 0,
    display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gridTemplateRows: 'repeat(10, 1fr)',
    opacity: 0.6,
  },
  marker: {
    position: 'absolute', transform: 'translate(-50%, -50%)',
    background: 'none', border: 'none', cursor: 'pointer', padding: 0, zIndex: 2,
  },
  pulse: {
    position: 'absolute', width: 24, height: 24, borderRadius: '50%',
    background: 'rgba(220,53,69,0.3)', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
  },
  dot: {
    width: 24, height: 24, borderRadius: '50%', position: 'relative',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transition: 'transform 0.2s',
  },
  dotInner: {
    position: 'absolute', top: -2, right: -2,
    width: 10, height: 10, borderRadius: '50%',
    background: '#fff', border: '2px solid currentColor',
  },
  legend: {
    position: 'absolute', bottom: 16, left: 16,
    background: '#fff', borderRadius: 14, padding: '14px 18px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '2px solid rgba(157,124,95,0.15)',
  },
  scale: {
    position: 'absolute', bottom: 16, right: 16,
    background: '#fff', borderRadius: 12, padding: '10px 14px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '2px solid rgba(157,124,95,0.15)',
    display: 'flex', alignItems: 'center', gap: 8,
  },
  sidebar: { display: 'flex', flexDirection: 'column', gap: 20 },
  card: {
    background: '#fff', borderRadius: 20, padding: 24,
    border: '2px solid rgba(157,124,95,0.15)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
  },
  statRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid rgba(157,124,95,0.08)',
  },
  placeholder: {
    background: 'rgba(245,241,237,0.5)', borderRadius: 20, padding: 32,
    border: '2px dashed rgba(157,124,95,0.2)', textAlign: 'center',
  },
  closeBtn: {
    background: 'none', border: 'none', fontSize: 18, color: '#6B6560',
    cursor: 'pointer', padding: '4px 8px',
  },
  detailLabel: { fontSize: 13, color: '#6B6560', margin: '0 0 2px' },
  detailValue: { fontSize: 15, color: '#1A1613', margin: 0, fontWeight: 500 },
  alertBox: { borderRadius: 14, padding: 16 },
  aboutCard: {
    background: 'linear-gradient(135deg, rgba(157,124,95,0.15), rgba(212,165,116,0.15))',
    borderRadius: 20, padding: 24, border: '2px solid rgba(157,124,95,0.2)',
  },
};

// Ping animation
const pingStyle = document.createElement('style');
pingStyle.textContent = `
  @keyframes ping {
    75%, 100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
  }
  @media (max-width: 900px) {
    div[style*="grid-template-columns: 1fr 340px"] {
      grid-template-columns: 1fr !important;
    }
  }
`;
document.head.appendChild(pingStyle);

export default MapPage;