import { supabase } from '../supabase';

const CLUSTER_RADIUS_KM = 0.2;
const CLUSTER_TIME_WINDOW_DAYS = 30;
const CLUSTER_PRIORITY_BOOST = 5;
const MAX_CLUSTER_BOOST = 25;

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function findNearbyReports(latitude, longitude, category) {
  const latOff = CLUSTER_RADIUS_KM / 111;
  const lngOff = CLUSTER_RADIUS_KM / (111 * Math.cos((latitude * Math.PI) / 180));
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - CLUSTER_TIME_WINDOW_DAYS);
  try {
    const { data, error } = await supabase.from('reports').select('id, latitude, longitude, category, priority_score, status, cluster_id, created_at, neighborhood, category_ar').eq('category', category).gte('latitude', latitude - latOff).lte('latitude', latitude + latOff).gte('longitude', longitude - lngOff).lte('longitude', longitude + lngOff).neq('status', 'resolved');
    if (error) return [];
    return (data || []).filter(r => haversineDistance(latitude, longitude, r.latitude, r.longitude) <= CLUSTER_RADIUS_KM);
  } catch { return []; }
}

export async function checkForDuplicate(latitude, longitude, category) {
  const nearby = await findNearbyReports(latitude, longitude, category);
  if (nearby.length === 0) return { isDuplicate: false, cluster: null, nearbyCount: 0, priorityBoost: 0, message: null };
  const existing = nearby.find(r => r.cluster_id);
  const clusterId = existing?.cluster_id || `CLT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const boost = Math.min(nearby.length * CLUSTER_PRIORITY_BOOST, MAX_CLUSTER_BOOST);
  return {
    isDuplicate: true,
    cluster: { id: clusterId, size: nearby.length + 1, reports: nearby.map(r => r.id), center: { latitude: nearby.reduce((s, r) => s + r.latitude, latitude) / (nearby.length + 1), longitude: nearby.reduce((s, r) => s + r.longitude, longitude) / (nearby.length + 1) } },
    nearbyCount: nearby.length, priorityBoost: boost,
    message: `📍 تم رصد ${nearby.length} بلاغ مشابه`,
    message_detail: `${nearby.length} بلاغ(ات) من نوع "${nearby[0]?.category_ar || category}" في نطاق ${CLUSTER_RADIUS_KM * 1000} متر`,
  };
}

export async function linkToCluster(reportId, clusterResult) {
  if (!clusterResult.isDuplicate || !clusterResult.cluster) return;
  const cid = clusterResult.cluster.id;
  try {
    await supabase.from('reports').update({ cluster_id: cid }).eq('id', reportId);
    for (const eid of clusterResult.cluster.reports) {
      await supabase.from('reports').update({ cluster_id: cid }).eq('id', eid).is('cluster_id', null);
    }
  } catch (err) { console.warn('[Clustering] Link error:', err.message); }
}

export async function getClusterStats() {
  try {
    const { data } = await supabase.from('reports').select('cluster_id, category, category_ar, neighborhood, priority_score, status, latitude, longitude').not('cluster_id', 'is', null);
    if (!data || data.length === 0) return [];
    const clusters = {};
    data.forEach(r => {
      if (!clusters[r.cluster_id]) clusters[r.cluster_id] = { id: r.cluster_id, category: r.category, category_ar: r.category_ar, neighborhood: r.neighborhood, reports: [], totalPriority: 0, hasUnresolved: false };
      clusters[r.cluster_id].reports.push(r);
      clusters[r.cluster_id].totalPriority += r.priority_score;
      if (r.status !== 'resolved') clusters[r.cluster_id].hasUnresolved = true;
    });
    return Object.values(clusters).map(c => ({
      ...c, size: c.reports.length, avgPriority: Math.round(c.totalPriority / c.reports.length),
      center: { latitude: c.reports.reduce((s, r) => s + r.latitude, 0) / c.reports.length, longitude: c.reports.reduce((s, r) => s + r.longitude, 0) / c.reports.length },
    })).sort((a, b) => b.size - a.size);
  } catch { return []; }
}
