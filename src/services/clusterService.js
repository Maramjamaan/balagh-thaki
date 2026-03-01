// =============================================
// خدمة التجميع الجغرافي — Geographic Clustering
// الطبقة الثانية: الذكاء (Intelligence)
// =============================================
// بدل ما تنشئ بلاغ منفصل لكل تقرير،
// نكشف البلاغات المتشابهة القريبة ونجمعها في مجموعة واحدة
// هذا يحل مشكلة حقيقية: البلدية تستلم 50 بلاغ لنفس الحفرة

import { supabase } from '../supabase';

// === ثوابت التجميع ===
const CLUSTER_RADIUS_KM = 0.2;       // 200 متر — نصف قطر البحث
const CLUSTER_TIME_WINDOW_DAYS = 30;  // 30 يوم — نافذة زمنية
const CLUSTER_PRIORITY_BOOST = 5;     // كل بلاغ مكرر يرفع الأولوية 5 نقاط
const MAX_CLUSTER_BOOST = 25;         // الحد الأقصى لرفع الأولوية من التكرار

// === حساب المسافة بين نقطتين بالكيلومتر (Haversine) ===
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// === البحث عن بلاغات مشابهة قريبة ===
export async function findNearbyReports(latitude, longitude, category) {
  // حساب حدود البحث المبدئية (مربع تقريبي)
  const latOffset = CLUSTER_RADIUS_KM / 111; // ~111 كم لكل درجة عرض
  const lngOffset = CLUSTER_RADIUS_KM / (111 * Math.cos((latitude * Math.PI) / 180));

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - CLUSTER_TIME_WINDOW_DAYS);

  try {
    const { data: nearbyReports, error } = await supabase
      .from('reports')
      .select('id, latitude, longitude, category, priority_score, status, cluster_id, created_at, neighborhood, category_ar')
      .eq('category', category)
      .gte('latitude', latitude - latOffset)
      .lte('latitude', latitude + latOffset)
      .gte('longitude', longitude - lngOffset)
      .lte('longitude', longitude + lngOffset)
      .gte('created_at', cutoffDate.toISOString())
      .neq('status', 'resolved');

    if (error) {
      console.warn('[Clustering] Supabase query error:', error.message);
      return [];
    }

    // تصفية دقيقة بالمسافة الفعلية (Haversine)
    const filtered = (nearbyReports || []).filter((report) => {
      const distance = haversineDistance(
        latitude,
        longitude,
        report.latitude,
        report.longitude
      );
      return distance <= CLUSTER_RADIUS_KM;
    });

    return filtered;
  } catch (err) {
    console.warn('[Clustering] Error finding nearby reports:', err.message);
    return [];
  }
}

// === تحديد ما إذا كان البلاغ مكرر ===
export async function checkForDuplicate(latitude, longitude, category) {
  const nearbyReports = await findNearbyReports(latitude, longitude, category);

  if (nearbyReports.length === 0) {
    return {
      isDuplicate: false,
      cluster: null,
      nearbyCount: 0,
      priorityBoost: 0,
      message: null,
    };
  }

  // البحث عن cluster_id موجود
  const existingCluster = nearbyReports.find((r) => r.cluster_id);
  const clusterId = existingCluster?.cluster_id || generateClusterId();

  // حساب رفع الأولوية
  const clusterSize = nearbyReports.length;
  const priorityBoost = Math.min(clusterSize * CLUSTER_PRIORITY_BOOST, MAX_CLUSTER_BOOST);

  return {
    isDuplicate: true,
    cluster: {
      id: clusterId,
      size: clusterSize + 1, // +1 للبلاغ الجديد
      reports: nearbyReports.map((r) => r.id),
      center: {
        latitude: nearbyReports.reduce((sum, r) => sum + r.latitude, latitude) / (clusterSize + 1),
        longitude: nearbyReports.reduce((sum, r) => sum + r.longitude, longitude) / (clusterSize + 1),
      },
    },
    nearbyCount: clusterSize,
    priorityBoost,
    message: `📍 تم رصد ${clusterSize} بلاغ مشابه في نفس المنطقة — تم دمجه في مجموعة`,
    message_detail: `تم العثور على ${clusterSize} بلاغ(ات) من نوع "${nearbyReports[0]?.category_ar || category}" في نطاق ${CLUSTER_RADIUS_KM * 1000} متر خلال آخر ${CLUSTER_TIME_WINDOW_DAYS} يوم`,
  };
}

// === تحديث البلاغات القريبة بمعرف المجموعة ===
export async function linkToCluster(reportId, clusterResult) {
  if (!clusterResult.isDuplicate || !clusterResult.cluster) return;

  const clusterId = clusterResult.cluster.id;

  try {
    // تحديث البلاغ الجديد
    await supabase
      .from('reports')
      .update({ cluster_id: clusterId })
      .eq('id', reportId);

    // تحديث البلاغات القريبة التي ليس لديها cluster_id
    for (const existingId of clusterResult.cluster.reports) {
      await supabase
        .from('reports')
        .update({ cluster_id: clusterId })
        .eq('id', existingId)
        .is('cluster_id', null);
    }

    console.log(`[Clustering] Linked ${clusterResult.cluster.size} reports to cluster ${clusterId}`);
  } catch (err) {
    console.warn('[Clustering] Error linking cluster:', err.message);
  }
}

// === جلب بيانات المجموعات للوحة التحكم ===
export async function getClusterStats() {
  try {
    const { data: reports } = await supabase
      .from('reports')
      .select('cluster_id, category, category_ar, neighborhood, priority_score, status, latitude, longitude')
      .not('cluster_id', 'is', null);

    if (!reports || reports.length === 0) return [];

    // تجميع حسب cluster_id
    const clusters = {};
    reports.forEach((r) => {
      if (!clusters[r.cluster_id]) {
        clusters[r.cluster_id] = {
          id: r.cluster_id,
          category: r.category,
          category_ar: r.category_ar,
          neighborhood: r.neighborhood,
          reports: [],
          totalPriority: 0,
          hasUnresolved: false,
        };
      }
      clusters[r.cluster_id].reports.push(r);
      clusters[r.cluster_id].totalPriority += r.priority_score;
      if (r.status !== 'resolved') {
        clusters[r.cluster_id].hasUnresolved = true;
      }
    });

    // حساب الإحصائيات لكل مجموعة
    return Object.values(clusters).map((c) => ({
      ...c,
      size: c.reports.length,
      avgPriority: Math.round(c.totalPriority / c.reports.length),
      center: {
        latitude: c.reports.reduce((s, r) => s + r.latitude, 0) / c.reports.length,
        longitude: c.reports.reduce((s, r) => s + r.longitude, 0) / c.reports.length,
      },
    })).sort((a, b) => b.size - a.size);
  } catch (err) {
    console.warn('[Clustering] Error getting stats:', err.message);
    return [];
  }
}

// === توليد معرف مجموعة فريد ===
function generateClusterId() {
  return `CLT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}