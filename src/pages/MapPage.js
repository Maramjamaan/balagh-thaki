import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getAllReports } from '../services/reportService';
import { getClusterStats } from '../services/clusterService';
import { ENTITY_NAMES_AR, severityToArabic } from '../services/aiService';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function createColoredIcon(color, size = 30, hasCluster = false) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 12}" viewBox="0 0 ${size} ${size + 12}">
    <defs><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.2"/></filter></defs>
    <path d="M${size/2} ${size+8} C${size/2} ${size+8} ${size-2} ${size*0.6} ${size-2} ${size/2.2} A${size/2.2-1} ${size/2.2-1} 0 1 0 2 ${size/2.2} C2 ${size*0.6} ${size/2} ${size+8} ${size/2} ${size+8}Z" fill="${color}" filter="url(#s)" stroke="white" stroke-width="1.5"/>
    <circle cx="${size/2}" cy="${size/2.2}" r="${size/(hasCluster?4:5)}" fill="white" opacity="${hasCluster?0.9:0.85}"/>
    ${hasCluster?`<circle cx="${size/2}" cy="${size/2.2}" r="${size/6}" fill="${color}"/>`:''}
  </svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [size, size + 12], iconAnchor: [size/2, size+8], popupAnchor: [0, -(size+4)] });
}

function getPriorityColor(s) {
  if (s >= 85) return '#991B1B'; if (s >= 70) return '#DC2626'; if (s >= 55) return '#F97316'; if (s >= 40) return '#EAB308'; return '#22C55E';
}

function getStatusAr(s) {
  if (s === 'resolved') return { label: 'تم الحل', color: '#22C55E' };
  if (s === 'in_progress') return { label: 'قيد المعالجة', color: '#2563EB' };
  return { label: 'جديد', color: '#EAB308' };
}

function FitBounds({ reports }) {
  const map = useMap();
  useEffect(() => {
    if (reports.length > 0) {
      const bounds = L.latLngBounds(reports.map(r => [r.latitude, r.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [reports, map]);
  return null;
}

function MapPage() {
  const [reports, setReports] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showLegend, setShowLegend] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [r, c] = await Promise.all([getAllReports().catch(() => []), getClusterStats().catch(() => [])]);
      setReports((r || []).filter(rep => rep.latitude && rep.longitude));
      setClusters(c || []);
    } catch (err) { console.error('Map error:', err); }
    setLoading(false);
  };

  const filtered = reports.filter(r => {
    if (filter === 'critical') return r.priority_score >= 70;
    if (filter === 'clusters') return r.cluster_id;
    if (filter === 'new') return r.status === 'new';
    if (filter === 'resolved') return r.status === 'resolved';
    return true;
  });

  const center = reports.length > 0 ? [reports[0].latitude, reports[0].longitude] : [24.7136, 46.6753];

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, border: '3px solid rgba(3,71,31,0.1)', borderTopColor: '#03471f', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#6B6560', marginTop: 16, fontSize: 14 }}>جاري تحميل خريطة الحفريات...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, padding: '10px 20px', background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.04)', zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>🗺️ خريطة حفريات الرياض</h2>
          <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: 12, background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }}>{filtered.length} حفرية</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[{ id: 'all', l: 'الكل' }, { id: 'critical', l: '🚨 حرجة' }, { id: 'clusters', l: '📍 مجموعات' }, { id: 'new', l: '⏳ جديدة' }].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '6px 12px', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: "'Tajawal', sans-serif",
              background: filter === f.id ? '#03471f' : '#fff', color: filter === f.id ? '#fff' : '#6B6560',
            }}>{f.l}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filtered.length > 0 && <FitBounds reports={filtered} />}

          {filter !== 'resolved' && clusters.map((c, i) => (
            <Circle key={`c-${i}`} center={[c.center.latitude, c.center.longitude]} radius={200}
              pathOptions={{ color: '#2563EB', fillColor: '#2563EB', fillOpacity: 0.06, weight: 2, dashArray: '6 4' }} />
          ))}

          {filtered.map((r, i) => {
            const color = getPriorityColor(r.priority_score);
            const icon = createColoredIcon(color, r.cluster_id ? 36 : 30, !!r.cluster_id);
            const st = getStatusAr(r.status);
            return (
              <Marker key={i} position={[r.latitude, r.longitude]} icon={icon}>
                <Popup maxWidth={260} minWidth={200}>
                  <div dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif", padding: 4 }}>
                    <p style={{ fontSize: 15, fontWeight: 800, margin: '0 0 4px' }}>{r.category_ar || r.category || 'غير مصنف'}</p>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <div style={{ flex: 1, padding: '6px 8px', borderRadius: 8, textAlign: 'center', background: `${color}12` }}>
                        <p style={{ fontSize: 18, fontWeight: 900, color, margin: 0 }}>{r.priority_score}</p>
                        <p style={{ fontSize: 10, color: '#6B6560', margin: 0 }}>أولوية</p>
                      </div>
                      <div style={{ flex: 1, padding: '6px 8px', borderRadius: 8, textAlign: 'center', background: `${st.color}12` }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: st.color, margin: 0 }}>{st.label}</p>
                        <p style={{ fontSize: 10, color: '#6B6560', margin: 0 }}>الحالة</p>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#6B6560' }}>
                      {[['الشدة', `${r.ai_severity||'—'}/5 — ${severityToArabic(r.ai_severity)}`], ['الحي', r.neighborhood||'—'], ['الجهة', ENTITY_NAMES_AR[r.responsible_entity]||r.responsible_entity||'—']].map(([l, v], j) => (
                        <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                          <span>{l}</span><span style={{ fontWeight: 600, color: '#1A1613' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                    {r.cluster_id && <div style={{ marginTop: 8, padding: '4px 8px', borderRadius: 6, background: 'rgba(37,99,235,0.06)', textAlign: 'center' }}><span style={{ fontSize: 11, color: '#2563EB', fontWeight: 600 }}>📍 جزء من مجموعة حفريات متكررة</span></div>}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {showLegend && (
          <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 1000, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: 14, padding: '12px 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.04)', minWidth: 150 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800 }}>دليل الألوان</span>
              <button onClick={() => setShowLegend(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#6B6560' }}>✕</button>
            </div>
            {[{ c: '#991B1B', l: 'حرج جداً (85+)' }, { c: '#DC2626', l: 'حرج (70-84)' }, { c: '#F97316', l: 'مرتفع (55-69)' }, { c: '#EAB308', l: 'متوسط (40-54)' }, { c: '#22C55E', l: 'منخفض (<40)' }].map((i, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: i.c, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#6B6560' }}>{i.l}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 6, marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px dashed #2563EB', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#2563EB' }}>نطاق مجموعة (200م)</span>
            </div>
          </div>
        )}

        {!showLegend && <button onClick={() => setShowLegend(true)} style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 1000, width: 40, height: 40, borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.95)', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', fontSize: 18, cursor: 'pointer' }}>🎨</button>}

        <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: 14, padding: '10px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', gap: 14 }}>
            {[{ v: reports.length, l: 'إجمالي', c: '#03471f' }, { v: reports.filter(r => r.priority_score >= 70).length, l: 'حرجة', c: '#DC2626' }, { v: clusters.length, l: 'مجموعات', c: '#2563EB' }].map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div style={{ width: 1, background: 'rgba(0,0,0,0.06)' }} />}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 18, fontWeight: 900, color: s.c, margin: 0 }}>{s.v}</p>
                  <p style={{ fontSize: 10, color: '#6B6560', margin: 0 }}>{s.l}</p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapPage;
