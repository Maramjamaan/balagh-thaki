import { supabase } from '../supabase';
import { analyzeImage } from './aiService';
import { getCurrentLocation } from './locationService';
import { calculatePriority } from './priorityService';
import { validateClassification } from './confidenceService';
import { checkForDuplicate, linkToCluster } from './clusterService';
import { calculateDynamicPriority } from './escalationService';

async function uploadImage(imageFile) {
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const { error } = await supabase.storage.from('report-images').upload(fileName, imageFile);
  if (error) throw new Error('فشل رفع الصورة: ' + error.message);
  const { data: urlData } = supabase.storage.from('report-images').getPublicUrl(fileName);
  return urlData.publicUrl;
}

async function getReportCount(neighborhood, category) {
  const { count } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('neighborhood', neighborhood).eq('category', category);
  return count || 0;
}

export async function submitReport(imageFile) {
  const aiResult = await analyzeImage(imageFile);
  const validation = validateClassification(aiResult);
  let location;
  try { location = await getCurrentLocation(); } catch { location = { latitude: 24.7136, longitude: 46.6753, neighborhood: 'العليا' }; }
  const clusterResult = await checkForDuplicate(location.latitude, location.longitude, aiResult.category);
  const reportCount = await getReportCount(location.neighborhood, aiResult.category);
  const basePriority = calculatePriority({ severity: aiResult.severity, latitude: location.latitude, longitude: location.longitude, reportCount: reportCount + 1 + clusterResult.nearbyCount, daysOpen: 0, nearbySchoolsHospitals: 1 });
  const dynamicPriority = calculateDynamicPriority({ basePriority: basePriority.score, createdAt: new Date().toISOString(), status: 'new', clusterSize: clusterResult.nearbyCount, blocksTraffic: aiResult.blocks_traffic, hasSafetyBarriers: aiResult.has_safety_barriers, isExcavation: true });

  let imageUrl = null;
  try { imageUrl = await uploadImage(imageFile); } catch (err) { console.warn('Image upload failed', err); }

  const { data, error } = await supabase.from('reports').insert({
    image_url: imageUrl,
    category: aiResult.category, subcategory: aiResult.subcategory,
    category_ar: aiResult.category_ar, subcategory_ar: aiResult.subcategory_ar,
    latitude: location.latitude, longitude: location.longitude, neighborhood: location.neighborhood,
    description: aiResult.description_ar, ai_classification: aiResult,
    ai_severity: aiResult.severity, ai_confidence: aiResult.confidence,
    priority_score: dynamicPriority.dynamicScore, status: 'new',
    responsible_entity: aiResult.responsible_entity, excavation_stage: aiResult.excavation_stage,
    has_safety_barriers: aiResult.has_safety_barriers, has_visible_license: aiResult.has_visible_license,
    blocks_traffic: aiResult.blocks_traffic,
    cluster_id: clusterResult.isDuplicate ? clusterResult.cluster.id : null,
  }).select().single();

  if (error) throw new Error('فشل حفظ البلاغ: ' + error.message);
  if (clusterResult.isDuplicate) await linkToCluster(data.id, clusterResult);

  return {
    report: data, ai: aiResult, location,
    priority: { ...basePriority, score: dynamicPriority.dynamicScore, baseScore: basePriority.score, dynamic: dynamicPriority },
    validation, cluster: clusterResult, escalation: dynamicPriority,
  };
}

export async function getAllReports() {
  const { data, error } = await supabase.from('reports').select('*').order('priority_score', { ascending: false });
  if (error) throw new Error('فشل جلب البلاغات');
  return data;
}

export async function getDashboardStats() {
  const { data: reports } = await supabase.from('reports').select('*');
  if (!reports || reports.length === 0) return null;
  const total = reports.length;
  const newCount = reports.filter(r => r.status === 'new').length;
  const inProgress = reports.filter(r => r.status === 'in_progress').length;
  const resolved = reports.filter(r => r.status === 'resolved').length;
  const critical = reports.filter(r => r.priority_score >= 80).length;
  const avgScore = Math.round(reports.reduce((s, r) => s + r.priority_score, 0) / total);

  const clustered = reports.filter(r => r.cluster_id);
  const uniqueClusters = [...new Set(clustered.map(r => r.cluster_id))];

  const byCategory = {}, byNeighborhood = {}, byEntity = {};
  reports.forEach(r => {
    const cat = r.category_ar || r.category || 'غير مصنف';
    byCategory[cat] = (byCategory[cat] || 0) + 1;
    const hood = r.neighborhood || 'غير محدد';
    byNeighborhood[hood] = (byNeighborhood[hood] || 0) + 1;
    const entity = r.responsible_entity || 'غير محدد';
    byEntity[entity] = (byEntity[entity] || 0) + 1;
  });

  const confVals = reports.filter(r => r.ai_confidence).map(r => r.ai_confidence);
  const avgConf = confVals.length > 0 ? Math.round((confVals.reduce((s, c) => s + c, 0) / confVals.length) * 100) : 0;

  return {
    total, new: newCount, pending: newCount, inProgress, resolved, critical, avgScore,
    byCategory, byNeighborhood, byEntity,
    clusters: { totalClusters: uniqueClusters.length, clusteredReports: clustered.length, avgClusterSize: uniqueClusters.length > 0 ? Math.round(clustered.length / uniqueClusters.length * 10) / 10 : 0 },
    confidence: { average: avgConf, lowConfidenceCount: confVals.filter(c => c < 0.6).length },
  };
}

export async function getLeaderboard() {
  const { data: reports } = await supabase.from('reports').select('responsible_entity, status, priority_score, created_at');
  if (!reports || reports.length === 0) return [];
  const entities = {};
  reports.forEach(r => {
    const name = r.responsible_entity || 'غير محدد';
    if (!entities[name]) entities[name] = { name, total: 0, resolved: 0, pending: 0, totalPriority: 0 };
    entities[name].total++;
    entities[name].totalPriority += r.priority_score;
    if (r.status === 'resolved') entities[name].resolved++;
    else entities[name].pending++;
  });
  return Object.values(entities).map(e => ({
    ...e, avgPriority: Math.round(e.totalPriority / e.total),
    delayPercentage: Math.round((e.pending / e.total) * 100),
  })).sort((a, b) => b.delayPercentage - a.delayPercentage);
}

export async function updateReportStatus(reportId, newStatus) {
  const updateData = { status: newStatus, updated_at: new Date().toISOString() };
  if (newStatus === 'resolved') updateData.resolved_at = new Date().toISOString();
  const { data, error } = await supabase.from('reports').update(updateData).eq('id', reportId).select().single();
  if (error) throw new Error('فشل التحديث');
  return data;
}