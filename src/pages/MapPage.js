import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { ENTITY_NAMES_AR } from '../services/aiService';
import 'leaflet/dist/leaflet.css';

// === بيانات تجريبية للحفريات ===
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

// === حساب التأخير ===
function processExcavations(data) {
  const now = new Date();
  return data.map(ex => {
    const permitEnd = new Date(ex.permitDate);
    permitEnd.setDate(permitEnd.getDate() + ex.permitDays);
    const diffMs = now - permitEnd;
    const delayDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const remainingDays = -delayDays;

    let color, statusAr;
    if (delayDays > 30) {
      color = '#DC2626'; statusAr = 'متأخرة جداً';
    } else if (delayDays > 0) {
      color = '#F97316'; statusAr = 'متأخرة';
    } else if (remainingDays <= 7) {
      color = '#EAB308'; statusAr = 'قاربت على الانتهاء';
    } else {
      color = '#22C55E'; statusAr = 'في الموعد';
    }

    return { ...ex, delayDays, remainingDays, color, statusAr, permitEnd };
  }).sort((a, b) => b.delayDays - a.delayDays);
}

function MapPage() {
  const [excavations, setExcavations] = useState([]);
  const [companyFilter, setCompanyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState('map'); // map أو list

  useEffect(() => {
    setExcavations(processExcavations(MOCK_EXCAVATIONS));
  }, []);

  // فلترة
  const filtered = excavations.filter(ex => {
    if (companyFilter !== 'all' && ex.company !== companyFilter) return false;
    if (statusFilter === 'overdue' && ex.delayDays <= 0) return false;
    if (statusFilter === 'active' && ex.delayDays > 0) return false;
    return true;
  });

  // إحصائيات
  const totalOverdue = excavations.filter(e => e.delayDays > 0).length;
  const totalActive = excavations.filter(e => e.delayDays <= 0).length;
  const worstCompany = (() => {
    const counts = {};
    excavations.filter(e => e.delayDays > 0).forEach(e => {
      counts[e.company] = (counts[e.company] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? `${ENTITY_NAMES_AR[sorted[0][0]]} (${sorted[0][1]})` : '-';
  })();

  const companies = ['all', 'NWC', 'SEC', 'STC', 'Mobily', 'Zain'];

  return (
    <div style={styles.container}>
      {/* العنوان */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ color: '#fff', fontSize: 22 }}>خريطة الحفريات</h2>
        <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>مراقبة الحفريات النشطة والمتأخرة في الرياض</p>
        <div style={styles.mockBadge}>بيانات تجريبية — مصمم للربط مع منصة نسق</div>
      </div>

      {/* إحصائيات */}
      <div style={styles.statsRow}>
        <div style={{ ...styles.miniStat, borderColor: '#DC2626' }}>
          <span style={{ fontSize: 22, fontWeight: 'bold', color: '#DC2626' }}>{totalOverdue}</span>
          <span style={{ fontSize: 10, color: '#888' }}>متأخرة</span>
        </div>
        <div style={{ ...styles.miniStat, borderColor: '#22C55E' }}>
          <span style={{ fontSize: 22, fontWeight: 'bold', color: '#22C55E' }}>{totalActive}</span>
          <span style={{ fontSize: 10, color: '#888' }}>في الموعد</span>
        </div>
        <div style={{ ...styles.miniStat, borderColor: '#F97316' }}>
          <span style={{ fontSize: 22, fontWeight: 'bold', color: '#F97316' }}>{excavations.length}</span>
          <span style={{ fontSize: 10, color: '#888' }}>إجمالي</span>
        </div>
      </div>

      {/* أكثر شركة تأخيراً */}
      <div style={styles.worstBox}>
        <span style={{ color: '#888', fontSize: 12 }}>أكثر شركة تأخيراً:</span>
        <span style={{ color: '#DC2626', fontSize: 13, fontWeight: 'bold' }}> {worstCompany}</span>
      </div>

      {/* تبديل عرض خريطة / قائمة */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button onClick={() => setView('map')}
          style={{ ...styles.viewBtn, background: view === 'map' ? 'rgba(200,169,81,0.2)' : 'rgba(255,255,255,0.05)', color: view === 'map' ? '#C8A951' : '#888' }}>
          🗺️ خريطة
        </button>
        <button onClick={() => setView('list')}
          style={{ ...styles.viewBtn, background: view === 'list' ? 'rgba(200,169,81,0.2)' : 'rgba(255,255,255,0.05)', color: view === 'list' ? '#C8A951' : '#888' }}>
          📋 قائمة
        </button>
      </div>

      {/* فلاتر الشركات */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', paddingBottom: 4 }}>
        {companies.map(c => (
          <button key={c} onClick={() => setCompanyFilter(c)}
            style={{
              ...styles.filterBtn,
              background: companyFilter === c ? 'rgba(200,169,81,0.2)' : 'rgba(255,255,255,0.05)',
              color: companyFilter === c ? '#C8A951' : '#888',
              fontWeight: companyFilter === c ? 'bold' : 'normal',
              whiteSpace: 'nowrap',
            }}>
            {c === 'all' ? 'الكل' : ENTITY_NAMES_AR[c] || c}
          </button>
        ))}
      </div>

      {/* فلتر الحالة */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[
          { id: 'all', label: 'الكل' },
          { id: 'overdue', label: 'متأخرة فقط' },
          { id: 'active', label: 'في الموعد' },
        ].map(f => (
          <button key={f.id} onClick={() => setStatusFilter(f.id)}
            style={{
              ...styles.filterBtn,
              background: statusFilter === f.id ? 'rgba(200,169,81,0.2)' : 'rgba(255,255,255,0.05)',
              color: statusFilter === f.id ? '#C8A951' : '#888',
              fontWeight: statusFilter === f.id ? 'bold' : 'normal',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* === الخريطة === */}
      {view === 'map' && (
        <div style={styles.mapWrapper}>
          <MapContainer
            center={[24.7136, 46.6753]}
            zoom={11}
            style={{ height: '100%', width: '100%', borderRadius: 14 }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            {filtered.map(ex => (
              <CircleMarker
                key={ex.id}
                center={[ex.lat, ex.lng]}
                radius={ex.delayDays > 30 ? 14 : ex.delayDays > 0 ? 11 : 8}
                fillColor={ex.color}
                color={ex.color}
                weight={2}
                opacity={0.9}
                fillOpacity={0.6}
              >
                <Popup>
                  <div style={{ direction: 'rtl', fontFamily: 'Arial', minWidth: 180 }}>
                    <p style={{ fontWeight: 'bold', fontSize: 14, margin: '0 0 6px', color: '#333' }}>{ex.street}</p>
                    <p style={{ fontSize: 12, color: '#666', margin: '0 0 4px' }}>{ex.neighborhood}</p>
                    <p style={{ fontSize: 12, margin: '0 0 4px' }}>
                      <strong>الشركة:</strong> {ENTITY_NAMES_AR[ex.company]}
                    </p>
                    <p style={{ fontSize: 12, margin: '0 0 4px' }}>
                      <strong>النوع:</strong> {ex.type}
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 'bold', margin: '8px 0 0', color: ex.color }}>
                      {ex.delayDays > 0 ? `متأخرة ${ex.delayDays} يوم` : `باقي ${ex.remainingDays} يوم`}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>

          {/* مفتاح الألوان */}
          <div style={styles.legend}>
            <span style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#DC2626' }} /> متأخرة جداً</span>
            <span style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#F97316' }} /> متأخرة</span>
            <span style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#EAB308' }} /> قاربت</span>
            <span style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#22C55E' }} /> في الموعد</span>
          </div>
        </div>
      )}

      {/* === القائمة === */}
      {view === 'list' && (
        <div>
          {filtered.map(ex => (
            <div key={ex.id} style={{ ...styles.exCard, borderRight: `4px solid ${ex.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{ex.street}</span>
                  <span style={{ color: '#666', fontSize: 12, display: 'block', marginTop: 2 }}>{ex.neighborhood}</span>
                </div>
                <div style={{ ...styles.countdown, background: `${ex.color}15`, color: ex.color }}>
                  {ex.delayDays > 0 ? (
                    <>
                      <span style={{ fontSize: 18, fontWeight: 'bold' }}>+{ex.delayDays}</span>
                      <span style={{ fontSize: 9 }}>يوم تأخير</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 18, fontWeight: 'bold' }}>{ex.remainingDays}</span>
                      <span style={{ fontSize: 9 }}>يوم متبقي</span>
                    </>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={styles.tag}>{ENTITY_NAMES_AR[ex.company] || ex.company}</span>
                <span style={styles.tag}>{ex.type}</span>
                <span style={{ ...styles.tag, color: ex.color, borderColor: `${ex.color}40` }}>{ex.statusAr}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#555' }}>
              <p>لا توجد حفريات مطابقة للفلتر</p>
            </div>
          )}
        </div>
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
  mockBadge: {
    display: 'inline-block',
    marginTop: 8,
    padding: '4px 12px',
    borderRadius: 20,
    background: 'rgba(249,115,22,0.1)',
    border: '1px solid rgba(249,115,22,0.2)',
    fontSize: 11,
    color: '#F97316',
  },
  statsRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
  },
  miniStat: {
    flex: 1,
    background: 'rgba(27,77,62,0.15)',
    borderRadius: 12,
    padding: '12px 8px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderBottom: '3px solid',
  },
  worstBox: {
    background: 'rgba(220,38,38,0.08)',
    border: '1px solid rgba(220,38,38,0.15)',
    borderRadius: 10,
    padding: '10px 14px',
    marginBottom: 16,
    textAlign: 'center',
  },
  viewBtn: {
    flex: 1,
    padding: '10px',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 'bold',
  },
  filterBtn: {
    padding: '6px 12px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
  },
  mapWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    border: '1px solid rgba(200,169,81,0.1)',
    height: 400,
    position: 'relative',
  },
  legend: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    background: 'rgba(0,0,0,0.8)',
    borderRadius: 8,
    padding: '8px 12px',
    display: 'flex',
    gap: 10,
    zIndex: 1000,
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 10,
    color: '#ccc',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    display: 'inline-block',
  },
  exCard: {
    background: 'rgba(27,77,62,0.15)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    border: '1px solid rgba(200,169,81,0.06)',
  },
  countdown: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: 10,
    minWidth: 65,
  },
  tag: {
    fontSize: 11,
    color: '#888',
    padding: '2px 8px',
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.1)',
  },
};

export default MapPage;
