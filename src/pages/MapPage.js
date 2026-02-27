import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { ENTITY_NAMES_AR } from '../services/aiService';
import 'leaflet/dist/leaflet.css';

const MOCK_EXCAVATIONS = [
  { id: 1, company: 'NWC', type: 'مياه', street: 'طريق الملك فهد', neighborhood: 'العليا', lat: 24.6900, lng: 46.6850, permitDate: '2025-12-01', permitDays: 30 },
  { id: 2, company: 'NWC', type: 'صرف', street: 'شارع التحلية', neighborhood: 'السليمانية', lat: 24.6950, lng: 46.6750, permitDate: '2025-12-15', permitDays: 60 },
  { id: 3, company: 'NWC', type: 'مياه', street: 'شارع العروبة', neighborhood: 'الملز', lat: 24.6650, lng: 46.7150, permitDate: '2026-01-01', permitDays: 30 },
  { id: 4, company: 'SEC', type: 'كهرباء', street: 'طريق خريص', neighborhood: 'الروضة', lat: 24.6700, lng: 46.7500, permitDate: '2025-11-20', permitDays: 45 },
  { id: 5, company: 'SEC', type: 'كهرباء', street: 'شارع الأمير سلطان', neighborhood: 'الورود', lat: 24.7000, lng: 46.7000, permitDate: '2026-01-10', permitDays: 30 },
  { id: 6, company: 'SEC', type: 'كهرباء', street: 'طريق الدائري', neighborhood: 'النخيل', lat: 24.7800, lng: 46.6250, permitDate: '2026-01-20', permitDays: 45 },
  { id: 7, company: 'STC', type: 'اتصالات', street: 'شارع الثلاثين', neighborhood: 'النسيم', lat: 24.6800, lng: 46.7800, permitDate: '2026-02-01', permitDays: 30 },
  { id: 8, company: 'STC', type: 'اتصالات', street: 'شارع الأربعين', neighborhood: 'الياسمين', lat: 24.8200, lng: 46.6350, permitDate: '2025-12-20', permitDays: 30 },
  { id: 9, company: 'Mobily', type: 'اتصالات', street: 'شارع الخمسين', neighborhood: 'حطين', lat: 24.7600, lng: 46.6200, permitDate: '2026-02-10', permitDays: 30 },
  { id: 10, company: 'Zain', type: 'اتصالات', street: 'شارع المعذر', neighborhood: 'الملقا', lat: 24.8000, lng: 46.6150, permitDate: '2026-01-05', permitDays: 30 },
  { id: 11, company: 'NWC', type: 'مياه', street: 'شارع البطحاء', neighborhood: 'البطحاء', lat: 24.6400, lng: 46.7200, permitDate: '2025-11-15', permitDays: 60 },
  { id: 12, company: 'NWC', type: 'صرف', street: 'شارع الديرة', neighborhood: 'الديرة', lat: 24.6500, lng: 46.7100, permitDate: '2026-01-25', permitDays: 45 },
  { id: 13, company: 'SEC', type: 'كهرباء', street: 'شارع السويدي', neighborhood: 'السويدي', lat: 24.6100, lng: 46.6400, permitDate: '2026-02-15', permitDays: 30 },
  { id: 14, company: 'NWC', type: 'مياه', street: 'طريق الشفا', neighborhood: 'الشفا', lat: 24.5500, lng: 46.6800, permitDate: '2026-01-15', permitDays: 30 },
  { id: 15, company: 'STC', type: 'ألياف', street: 'شارع الروابي', neighborhood: 'الروابي', lat: 24.6600, lng: 46.7700, permitDate: '2026-02-20', permitDays: 30 },
  { id: 16, company: 'NWC', type: 'مياه', street: 'شارع العزيزية', neighborhood: 'العزيزية', lat: 24.6000, lng: 46.7300, permitDate: '2025-12-10', permitDays: 30 },
  { id: 17, company: 'SEC', type: 'كهرباء', street: 'شارع الصحافة', neighborhood: 'الصحافة', lat: 24.7400, lng: 46.6600, permitDate: '2026-01-30', permitDays: 30 },
  { id: 18, company: 'NWC', type: 'صرف', street: 'شارع ظهرة لبن', neighborhood: 'ظهرة لبن', lat: 24.6300, lng: 46.6200, permitDate: '2025-11-25', permitDays: 60 },
  { id: 19, company: 'Mobily', type: 'اتصالات', street: 'شارع الغدير', neighborhood: 'الغدير', lat: 24.7500, lng: 46.6400, permitDate: '2026-02-05', permitDays: 30 },
  { id: 20, company: 'NWC', type: 'مياه', street: 'شارع الربيع', neighborhood: 'الربيع', lat: 24.8100, lng: 46.6500, permitDate: '2026-01-08', permitDays: 45 },
];

function processExcavations(data) {
  const now = new Date();
  return data.map(ex => {
    const permitEnd = new Date(ex.permitDate);
    permitEnd.setDate(permitEnd.getDate() + ex.permitDays);
    const diffMs = now - permitEnd;
    const delayDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const remainingDays = -delayDays;
    let color, statusAr;
    if (delayDays > 30) { color = '#DC2626'; statusAr = 'متأخرة جداً'; }
    else if (delayDays > 0) { color = '#F97316'; statusAr = 'متأخرة'; }
    else if (remainingDays <= 7) { color = '#D4A017'; statusAr = 'قاربت على الانتهاء'; }
    else { color = '#006838'; statusAr = 'في الموعد'; }
    return { ...ex, delayDays, remainingDays, color, statusAr, permitEnd };
  }).sort((a, b) => b.delayDays - a.delayDays);
}

function MapPage() {
  const [excavations, setExcavations] = useState([]);
  const [companyFilter, setCompanyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState('map');

  useEffect(() => { setExcavations(processExcavations(MOCK_EXCAVATIONS)); }, []);

  const filtered = excavations.filter(ex => {
    if (companyFilter !== 'all' && ex.company !== companyFilter) return false;
    if (statusFilter === 'overdue' && ex.delayDays <= 0) return false;
    if (statusFilter === 'active' && ex.delayDays > 0) return false;
    return true;
  });

  const totalOverdue = excavations.filter(e => e.delayDays > 0).length;
  const totalActive = excavations.filter(e => e.delayDays <= 0).length;
  const worstCompany = (() => {
    const counts = {};
    excavations.filter(e => e.delayDays > 0).forEach(e => { counts[e.company] = (counts[e.company] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? `${ENTITY_NAMES_AR[sorted[0][0]]} (${sorted[0][1]})` : '-';
  })();

  const companies = ['all', 'NWC', 'SEC', 'STC', 'Mobily', 'Zain'];

  return (
    <div style={s.page}>
      <div style={{ marginBottom: 16 }} className="fade-up">
        <h2 style={{ color: 'var(--primary)', fontSize: 22, fontWeight: 800 }}>خريطة الحفريات</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>مراقبة الحفريات النشطة والمتأخرة في الرياض</p>
        <div style={s.mockBadge}>بيانات تجريبية — مصمم للربط مع منصة نسق</div>
      </div>

      {/* Stats */}
      <div style={s.statsRow} className="fade-up">
        <div className="glass" style={{ ...s.miniStat, borderBottomColor: '#DC2626' }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#DC2626' }}>{totalOverdue}</span>
          <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>متأخرة</span>
        </div>
        <div className="glass" style={{ ...s.miniStat, borderBottomColor: '#006838' }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#006838' }}>{totalActive}</span>
          <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>في الموعد</span>
        </div>
        <div className="glass" style={{ ...s.miniStat, borderBottomColor: '#F97316' }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#F97316' }}>{excavations.length}</span>
          <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>إجمالي</span>
        </div>
      </div>

      {/* Worst company */}
      <div style={s.worstBox} className="fade-up">
        <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>أكثر شركة تأخيراً:</span>
        <span style={{ color: '#DC2626', fontSize: 13, fontWeight: 800 }}> {worstCompany}</span>
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }} className="fade-up">
        <button onClick={() => setView('map')}
          style={{ ...s.viewBtn, ...(view === 'map' ? s.viewActive : {}) }}>🗺️ خريطة</button>
        <button onClick={() => setView('list')}
          style={{ ...s.viewBtn, ...(view === 'list' ? s.viewActive : {}) }}>📋 قائمة</button>
      </div>

      {/* Company filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', paddingBottom: 4 }} className="fade-up">
        {companies.map(c => (
          <button key={c} onClick={() => setCompanyFilter(c)}
            style={{ ...s.filterBtn, ...(companyFilter === c ? s.filterActive : {}) }}>
            {c === 'all' ? 'الكل' : ENTITY_NAMES_AR[c] || c}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }} className="fade-up">
        {[{ id: 'all', label: 'الكل' }, { id: 'overdue', label: 'متأخرة فقط' }, { id: 'active', label: 'في الموعد' }].map(f => (
          <button key={f.id} onClick={() => setStatusFilter(f.id)}
            style={{ ...s.filterBtn, ...(statusFilter === f.id ? s.filterActive : {}) }}>{f.label}</button>
        ))}
      </div>

      {/* Map */}
      {view === 'map' && (
        <div style={s.mapWrapper} className="fade-up">
          <MapContainer center={[24.7136, 46.6753]} zoom={11} style={{ height: '100%', width: '100%', borderRadius: 16 }} scrollWheelZoom={true}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            {filtered.map(ex => (
              <CircleMarker key={ex.id} center={[ex.lat, ex.lng]}
                radius={ex.delayDays > 30 ? 14 : ex.delayDays > 0 ? 11 : 8}
                fillColor={ex.color} color={ex.color} weight={2} opacity={0.9} fillOpacity={0.6}>
                <Popup>
                  <div style={{ direction: 'rtl', fontFamily: 'Tajawal', minWidth: 180 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 6px', color: '#006838' }}>{ex.street}</p>
                    <p style={{ fontSize: 12, color: '#666', margin: '0 0 4px' }}>{ex.neighborhood}</p>
                    <p style={{ fontSize: 12, margin: '0 0 4px', color: '#333' }}><strong>الشركة:</strong> {ENTITY_NAMES_AR[ex.company]}</p>
                    <p style={{ fontSize: 12, margin: '0 0 4px', color: '#333' }}><strong>النوع:</strong> {ex.type}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, margin: '8px 0 0', color: ex.color }}>
                      {ex.delayDays > 0 ? `متأخرة ${ex.delayDays} يوم` : `باقي ${ex.remainingDays} يوم`}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          {/* Legend */}
          <div style={s.legend}>
            <span style={s.legendItem}><span style={{ ...s.legendDot, background: '#DC2626' }} /> متأخرة جداً</span>
            <span style={s.legendItem}><span style={{ ...s.legendDot, background: '#F97316' }} /> متأخرة</span>
            <span style={s.legendItem}><span style={{ ...s.legendDot, background: '#D4A017' }} /> قاربت</span>
            <span style={s.legendItem}><span style={{ ...s.legendDot, background: '#006838' }} /> في الموعد</span>
          </div>
        </div>
      )}

      {/* List */}
      {view === 'list' && (
        <div>
          {filtered.map(ex => (
            <div key={ex.id} className="glass fade-up" style={{ padding: 16, marginBottom: 10, borderRight: `4px solid ${ex.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>{ex.street}</span>
                  <span style={{ color: 'var(--text-faint)', fontSize: 12, display: 'block', marginTop: 2 }}>{ex.neighborhood}</span>
                </div>
                <div style={{ ...s.countdown, background: `${ex.color}10`, color: ex.color }}>
                  {ex.delayDays > 0 ? (
                    <><span style={{ fontSize: 18, fontWeight: 800 }}>+{ex.delayDays}</span><span style={{ fontSize: 9 }}>يوم تأخير</span></>
                  ) : (
                    <><span style={{ fontSize: 18, fontWeight: 800 }}>{ex.remainingDays}</span><span style={{ fontSize: 9 }}>يوم متبقي</span></>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={s.tag}>{ENTITY_NAMES_AR[ex.company] || ex.company}</span>
                <span style={s.tag}>{ex.type}</span>
                <span style={{ ...s.tag, color: ex.color, borderColor: `${ex.color}30` }}>{ex.statusAr}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-faint)' }}><p>لا توجد حفريات مطابقة للفلتر</p></div>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  page: { padding: '20px 16px', maxWidth: 600, margin: '0 auto', minHeight: 'calc(100vh - 140px)' },
  mockBadge: {
    display: 'inline-block', marginTop: 8, padding: '4px 12px', borderRadius: 20,
    background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.12)',
    fontSize: 11, color: '#F97316',
  },
  statsRow: { display: 'flex', gap: 8, marginBottom: 16 },
  miniStat: {
    flex: 1, padding: '12px 8px', textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    borderBottom: '3px solid',
  },
  worstBox: {
    background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.1)',
    borderRadius: 12, padding: '10px 14px', marginBottom: 16, textAlign: 'center',
  },
  viewBtn: {
    flex: 1, padding: 10, borderRadius: 12, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 700, fontFamily: 'Tajawal',
    background: '#fff', color: 'var(--text-dim)', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
  },
  viewActive: { background: 'var(--primary-light)', color: 'var(--primary)' },
  filterBtn: {
    padding: '6px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
    fontSize: 11, whiteSpace: 'nowrap', fontFamily: 'Tajawal',
    background: '#fff', color: 'var(--text-dim)', boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
  },
  filterActive: { background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 },
  mapWrapper: {
    borderRadius: 16, overflow: 'hidden', marginBottom: 16,
    border: '1px solid rgba(0,0,0,0.06)', height: 400, position: 'relative',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  },
  legend: {
    position: 'absolute', bottom: 10, right: 10,
    background: 'rgba(255,255,255,0.95)', borderRadius: 10, padding: '8px 12px',
    display: 'flex', gap: 10, zIndex: 1000, flexWrap: 'wrap',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  legendItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#555' },
  legendDot: { width: 10, height: 10, borderRadius: '50%', display: 'inline-block' },
  countdown: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '8px 12px', borderRadius: 12, minWidth: 65,
  },
  tag: {
    fontSize: 11, color: 'var(--text-dim)', padding: '2px 8px', borderRadius: 8,
    border: '1px solid rgba(0,0,0,0.06)', background: '#fff',
  },
};

export default MapPage;
