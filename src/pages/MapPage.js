import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getAllReports } from '../services/reportService';
import { getClusterStats } from '../services/clusterService';
import { ENTITY_NAMES_AR, severityToArabic } from '../services/aiService';
import 'leaflet/dist/leaflet.css';

// === Fix default Leaflet icon issue in React ===
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// === Custom colored markers using SVG ===
function createColoredIcon(color, size = 32, hasCluster = false) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 12}" viewBox="0 0 ${size} ${size + 12}">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/>
        </filter>
      </defs>
      <path d="M${size / 2} ${size + 8} C${size / 2} ${size + 8} ${size - 2} ${size * 0.6} ${size - 2} ${size / 2.2}
        A${size / 2.2 - 1} ${size / 2.2 - 1} 0 1 0 2 ${size / 2.2}
        C2 ${size * 0.6} ${size / 2} ${size + 8} ${size / 2} ${size + 8}Z"
        fill="${color}" filter="url(#shadow)" stroke="white" stroke-width="1.5"/>
      ${hasCluster ? `<circle cx="${size / 2}" cy="${size / 2.2}" r="${size / 4}" fill="white" opacity="0.9"/>
        <circle cx="${size / 2}" cy="${size / 2.2}" r="${size / 6}" fill="${color}"/>` :
        `<circle cx="${size / 2}" cy="${size / 2.2}" r="${size / 5}" fill="white" opacity="0.85"/>`}
    </svg>`;

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size + 12],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -(size + 4)],
  });
}

// === Priority → Color ===
function getPriorityColor(score) {
  if (score >= 85) return '#991B1B';
  if (score >= 70) return '#DC2626';
  if (score >= 55) return '#F97316';
  if (score >= 40) return '#EAB308';
  return '#22C55E';
}

// === Category → Icon emoji ===
function getCategoryEmoji(category) {
  const map = {
    excavation: '🚧', water_leak: '💧', lighting: '💡', traffic: '🚦',
    sidewalk: '🚶', road_damage: '🛣️', debris: '🏗️', suggestion: '💡',
  };
  return map[category] || '📋';
}

// === Status → Arabic ===
function getStatusAr(status) {
  if (status === 'resolved') return { label: 'تم الحل', color: '#22C55E' };
  if (status === 'in_progress') return { label: 'قيد المعالجة', color: '#3B82F6' };
  return { label: 'جديد', color: '#EAB308' };
}

// === Auto-fit map to markers ===
function FitBounds({ reports }) {
  const map = useMap();
  useEffect(() => {
    if (reports.length > 0) {
      const bounds = L.latLngBounds(reports.map(r => [r.latitude, r.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [reports, map]);
  return null;
}

function MapPage() {
  const [reports, setReports] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | critical | clusters | category
  const [showLegend, setShowLegend] = useState(true);

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    setLoading(true);
    try {
      const [r, c] = await Promise.all([
        getAllReports().catch(() => []),
        getClusterStats().catch(() => []),
      ]);
      setReports((r || []).filter(rep => rep.latitude && rep.longitude));
      setClusters(c || []);
    } catch (err) {
      console.error('Map load error:', err);
    }
    setLoading(false);
  };

  // === Filter reports ===
  const filteredReports = reports.filter(r => {
    if (filter === 'critical') return r.priority_score >= 70;
    if (filter === 'clusters') return r.cluster_id;
    if (filter === 'new') return r.status === 'new';
    if (filter === 'resolved') return r.status === 'resolved';
    return true;
  });

  // Riyadh center default
  const center = reports.length > 0
    ? [reports[0].latitude, reports[0].longitude]
    : [24.7136, 46.6753];

  if (loading) {
    return (
      <div style={s.page}>
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={s.spinner} />
          <p style={{ color: 'var(--text-dim)', marginTop: 16, fontSize: 14 }}>جاري تحميل الخريطة...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={s.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A1613', margin: 0 }}>🗺️ خريطة البلاغات</h2>
          <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: 12, background: 'rgba(27,127,95,0.08)', color: '#1B7F5F', fontWeight: 600 }}>
            {filteredReports.length} بلاغ
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'critical', label: '🚨 حرج' },
            { id: 'clusters', label: '📍 مجموعات' },
            { id: 'new', label: '⏳ جديد' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              style={{ ...s.filterBtn, ...(filter === f.id ? s.filterActive : {}) }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}
          zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredReports.length > 0 && <FitBounds reports={filteredReports} />}

          {/* Cluster circles (200m radius) */}
          {filter !== 'resolved' && clusters.map((cluster, i) => (
            <Circle key={`cluster-${i}`}
              center={[cluster.center.latitude, cluster.center.longitude]}
              radius={200}
              pathOptions={{
                color: '#2563EB',
                fillColor: '#2563EB',
                fillOpacity: 0.08,
                weight: 2,
                dashArray: '6 4',
              }}
            />
          ))}

          {/* Report markers */}
          {filteredReports.map((report, i) => {
            const color = getPriorityColor(report.priority_score);
            const hasCluster = !!report.cluster_id;
            const icon = createColoredIcon(color, hasCluster ? 36 : 30, hasCluster);
            const statusInfo = getStatusAr(report.status);

            return (
              <Marker key={i} position={[report.latitude, report.longitude]} icon={icon}>
                <Popup maxWidth={280} minWidth={220}>
                  <div dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif", padding: 4 }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 24 }}>{getCategoryEmoji(report.category)}</span>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1613', margin: 0 }}>
                          {report.category_ar || report.category || 'غير مصنف'}
                        </p>
                        <p style={{ fontSize: 12, color: '#6B6560', margin: '2px 0 0' }}>
                          {report.subcategory_ar || ''}
                        </p>
                      </div>
                    </div>

                    {/* Priority + Status */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                      <div style={{
                        flex: 1, padding: '8px 10px', borderRadius: 10, textAlign: 'center',
                        background: `${color}12`, border: `1px solid ${color}25`,
                      }}>
                        <p style={{ fontSize: 20, fontWeight: 800, color, margin: 0 }}>{report.priority_score}</p>
                        <p style={{ fontSize: 10, color: '#6B6560', margin: 0 }}>أولوية</p>
                      </div>
                      <div style={{
                        flex: 1, padding: '8px 10px', borderRadius: 10, textAlign: 'center',
                        background: `${statusInfo.color}12`, border: `1px solid ${statusInfo.color}25`,
                      }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: statusInfo.color, margin: 0 }}>{statusInfo.label}</p>
                        <p style={{ fontSize: 10, color: '#6B6560', margin: 0 }}>الحالة</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div style={{ fontSize: 12, color: '#6B6560' }}>
                      {[
                        ['الشدة', `${report.ai_severity || '—'}/5 — ${severityToArabic(report.ai_severity)}`],
                        ['الحي', report.neighborhood || '—'],
                        ['الجهة', ENTITY_NAMES_AR[report.responsible_entity] || report.responsible_entity || '—'],
                        ['الثقة', report.ai_confidence ? `${Math.round(report.ai_confidence * 100)}%` : '—'],
                      ].map(([label, val], j) => (
                        <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                          <span>{label}</span>
                          <span style={{ color: '#1A1613', fontWeight: 600 }}>{val}</span>
                        </div>
                      ))}
                    </div>

                    {/* Cluster badge */}
                    {hasCluster && (
                      <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 8, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', textAlign: 'center' }}>
                        <span style={{ fontSize: 11, color: '#2563EB', fontWeight: 600 }}>
                          📍 جزء من مجموعة بلاغات متشابهة
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    {report.description && (
                      <p style={{ fontSize: 12, color: '#6B6560', margin: '8px 0 0', lineHeight: 1.6, borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 8 }}>
                        {report.description}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Legend */}
        {showLegend && (
          <div style={s.legend}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1613' }}>دليل الألوان</span>
              <button onClick={() => setShowLegend(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#6B6560' }}>✕</button>
            </div>
            {[
              { color: '#991B1B', label: 'حرج جداً (85+)' },
              { color: '#DC2626', label: 'حرج (70-84)' },
              { color: '#F97316', label: 'مرتفع (55-69)' },
              { color: '#EAB308', label: 'متوسط (40-54)' },
              { color: '#22C55E', label: 'منخفض (<40)' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 12, height: 12, borderRadius: 4, background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#6B6560' }}>{item.label}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 6, marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px dashed #2563EB', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#2563EB' }}>نطاق مجموعة (200م)</span>
            </div>
          </div>
        )}

        {/* Show legend button if hidden */}
        {!showLegend && (
          <button onClick={() => setShowLegend(true)} style={s.legendToggle}>
            🎨
          </button>
        )}

        {/* Stats overlay */}
        <div style={s.statsOverlay}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#1B7F5F', margin: 0 }}>{reports.length}</p>
              <p style={{ fontSize: 10, color: '#6B6560', margin: 0 }}>إجمالي</p>
            </div>
            <div style={{ width: 1, background: 'rgba(0,0,0,0.08)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#DC2626', margin: 0 }}>{reports.filter(r => r.priority_score >= 70).length}</p>
              <p style={{ fontSize: 10, color: '#6B6560', margin: 0 }}>حرج</p>
            </div>
            <div style={{ width: 1, background: 'rgba(0,0,0,0.08)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#2563EB', margin: 0 }}>{clusters.length}</p>
              <p style={{ fontSize: 10, color: '#6B6560', margin: 0 }}>مجموعات</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  spinner: {
    width: 44, height: 44, border: '3px solid rgba(27,127,95,0.12)', borderTopColor: '#1B7F5F',
    borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite',
  },
  topBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10,
    padding: '12px 20px', background: '#fff', borderBottom: '1px solid rgba(157,124,95,0.1)',
    zIndex: 1000,
  },
  filterBtn: {
    padding: '6px 12px', border: '1px solid rgba(157,124,95,0.15)', background: '#fff',
    borderRadius: 8, fontSize: 12, cursor: 'pointer', color: '#6B6560',
    fontFamily: "'Tajawal', sans-serif", transition: 'all 0.2s',
  },
  filterActive: {
    background: '#1B7F5F', color: '#fff', borderColor: '#1B7F5F',
  },
  legend: {
    position: 'absolute', bottom: 20, right: 20, zIndex: 1000,
    background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
    borderRadius: 14, padding: '12px 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    border: '1px solid rgba(157,124,95,0.1)', minWidth: 160,
  },
  legendToggle: {
    position: 'absolute', bottom: 20, right: 20, zIndex: 1000,
    width: 40, height: 40, borderRadius: 12, border: 'none',
    background: 'rgba(255,255,255,0.95)', boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
    fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  statsOverlay: {
    position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 1000,
    background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
    borderRadius: 14, padding: '10px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    border: '1px solid rgba(157,124,95,0.1)',
  },
};

export default MapPage;