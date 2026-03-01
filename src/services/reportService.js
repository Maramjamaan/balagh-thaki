import { supabase } from '../supabase';
import { analyzeImage } from './aiService';
import { getCurrentLocation } from './locationService';
import { calculatePriority } from './priorityService';
import { validateClassification } from './confidenceService';
import { checkForDuplicate, linkToCluster } from './clusterService';
import { calculateDynamicPriority } from './escalationService';

// === رفع صورة البلاغ إلى Supabase Storage ===
async function uploadImage(imageFile) {
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

  const { error } = await supabase.storage
    .from('report-images')
    .upload(fileName, imageFile);

  if (error) throw new Error('فشل رفع الصورة: ' + error.message);

  const { data: urlData } = supabase.storage
    .from('report-images')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

// === حساب تكرار البلاغات في نفس الحي ونفس النوع ===
async function getReportCount(neighborhood, category) {
  const { count } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('neighborhood', neighborhood)
    .eq('category', category);

  return count || 0;
}

// =============================================
// إرسال بلاغ جديد — مع الميزات الثلاث الجديدة
// =============================================
export async function submitReport(imageFile) {
  // === 1. تحليل الصورة بالذكاء الاصطناعي ===
  const aiResult = await analyzeImage(imageFile);

  // === 2. التحقق من الثقة (Feature 1: Confidence Validation) ===
  const validation = validateClassification(aiResult);
  console.log('[Awla] Confidence validation:', validation.summary);

  // === 3. تحديد الموقع ===
  let location;
  try {
    location = await getCurrentLocation();
  } catch {
    location = {
      latitude: 24.7136,
      longitude: 46.6753,
      neighborhood: 'العليا',
    };
  }

  // === 4. كشف البلاغات المكررة (Feature 2: Clustering) ===
  const clusterResult = await checkForDuplicate(
    location.latitude,
    location.longitude,
    aiResult.category
  );
  if (clusterResult.isDuplicate) {
    console.log('[Awla] Duplicate detected:', clusterResult.message);
  }

  // === 5. حساب تكرار البلاغات ===
  const reportCount = await getReportCount(location.neighborhood, aiResult.category);

  // === 6. حساب الأولوية الأساسية ===
  const basePriority = calculatePriority({
    severity: aiResult.severity,
    latitude: location.latitude,
    longitude: location.longitude,
    reportCount: reportCount + 1 + clusterResult.nearbyCount,
    daysOpen: 0,
    nearbySchoolsHospitals: 1,
    licenseExpired: false,
    delayDays: 0,
  });

  // === 7. حساب الأولوية الديناميكية (Feature 3: Smart Escalation) ===
  const dynamicPriority = calculateDynamicPriority({
    basePriority: basePriority.score,
    createdAt: new Date().toISOString(),
    status: 'new',
    clusterSize: clusterResult.nearbyCount,
    blocksTraffic: aiResult.blocks_traffic,
    hasSafetyBarriers: aiResult.has_safety_barriers,
    isExcavation: aiResult.category === 'excavation',
    licenseExpired: false,
  });

  // === 8. رفع الصورة ===
  let imageUrl = null;
  try {
    imageUrl = await uploadImage(imageFile);
  } catch (err) {
    console.error('تنبيه: فشل رفع الصورة', err);
  }

  // === 9. حفظ البلاغ في قاعدة البيانات ===
  const { data, error } = await supabase
    .from('reports')
    .insert({
      image_url: imageUrl,

      // التصنيف
      category: aiResult.category,
      subcategory: aiResult.subcategory,
      category_ar: aiResult.category_ar,
      subcategory_ar: aiResult.subcategory_ar,

      // الموقع
      latitude: location.latitude,
      longitude: location.longitude,
      neighborhood: location.neighborhood,

      // الوصف
      description: aiResult.description_ar,

      // الذكاء الاصطناعي
      ai_classification: aiResult,
      ai_severity: aiResult.severity,
      ai_confidence: aiResult.confidence,

      // الأولوية — الآن ديناميكية!
      priority_score: dynamicPriority.dynamicScore,

      // الحالة
      status: 'new',

      // الجهة المسؤولة
      responsible_entity: aiResult.responsible_entity,

      // بيانات الحفرية
      excavation_stage: aiResult.excavation_stage,
      has_safety_barriers: aiResult.has_safety_barriers,
      has_visible_license: aiResult.has_visible_license,
      blocks_traffic: aiResult.blocks_traffic,

      // التجميع (جديد)
      cluster_id: clusterResult.isDuplicate ? clusterResult.cluster.id : null,
    })
    .select()
    .single();

  if (error) throw new Error('فشل حفظ البلاغ: ' + error.message);

  // === 10. ربط البلاغات في المجموعة ===
  if (clusterResult.isDuplicate) {
    await linkToCluster(data.id, clusterResult);
  }

  // === إرجاع النتيجة الكاملة ===
  return {
    report: data,
    ai: aiResult,
    location,
    priority: {
      ...basePriority,
      // نضيف البيانات الديناميكية
      score: dynamicPriority.dynamicScore,
      baseScore: basePriority.score,
      dynamic: dynamicPriority,
    },
    // الميزات الجديدة
    validation,     // Feature 1: نتيجة التحقق من الثقة
    cluster: clusterResult, // Feature 2: نتيجة كشف التكرار
    escalation: dynamicPriority, // Feature 3: نتيجة التصعيد الذكي
  };
}

// === جلب كل البلاغات (للوحة التحكم) ===
export async function getAllReports() {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('priority_score', { ascending: false });

  if (error) throw new Error('فشل جلب البلاغات: ' + error.message);
  return data;
}

// === جلب إحصائيات لوحة التحكم ===
export async function getDashboardStats() {
  const { data: reports } = await supabase.from('reports').select('*');

  if (!reports || reports.length === 0) return null;

  const total = reports.length;
  const newCount = reports.filter((r) => r.status === 'new').length;
  const inProgress = reports.filter((r) => r.status === 'in_progress').length;
  const resolved = reports.filter((r) => r.status === 'resolved').length;
  const critical = reports.filter((r) => r.priority_score >= 80).length;
  const avgScore = Math.round(reports.reduce((sum, r) => sum + r.priority_score, 0) / total);

  // إحصائيات التجميع (جديد)
  const clusteredReports = reports.filter((r) => r.cluster_id);
  const uniqueClusters = [...new Set(clusteredReports.map((r) => r.cluster_id))];

  // إحصائيات حسب الفئة
  const byCategory = {};
  const byNeighborhood = {};
  const byEntity = {};

  reports.forEach((r) => {
    const cat = r.category_ar || r.category || 'غير مصنف';
    byCategory[cat] = (byCategory[cat] || 0) + 1;

    const hood = r.neighborhood || 'غير محدد';
    byNeighborhood[hood] = (byNeighborhood[hood] || 0) + 1;

    const entity = r.responsible_entity || 'غير محدد';
    byEntity[entity] = (byEntity[entity] || 0) + 1;
  });

  // إحصائيات الثقة (جديد)
  const confidenceValues = reports.filter((r) => r.ai_confidence).map((r) => r.ai_confidence);
  const avgConfidence = confidenceValues.length > 0
    ? Math.round((confidenceValues.reduce((s, c) => s + c, 0) / confidenceValues.length) * 100)
    : 0;
  const lowConfidence = confidenceValues.filter((c) => c < 0.6).length;

  return {
    total,
    new: newCount,
    pending: newCount,
    inProgress,
    resolved,
    critical,
    avgScore,
    byCategory,
    byNeighborhood,
    byEntity,
    // إحصائيات جديدة
    clusters: {
      totalClusters: uniqueClusters.length,
      clusteredReports: clusteredReports.length,
      avgClusterSize: uniqueClusters.length > 0
        ? Math.round(clusteredReports.length / uniqueClusters.length * 10) / 10
        : 0,
    },
    confidence: {
      average: avgConfidence,
      lowConfidenceCount: lowConfidence,
    },
  };
}

// === جلب بيانات ترتيب الشركات — Leaderboard ===
export async function getLeaderboard() {
  const { data: reports } = await supabase
    .from('reports')
    .select('responsible_entity, status, priority_score, created_at')
    .eq('category', 'excavation');

  if (!reports || reports.length === 0) return [];

  const entities = {};
  reports.forEach((r) => {
    const name = r.responsible_entity || 'غير محدد';
    if (!entities[name]) {
      entities[name] = { name, total: 0, resolved: 0, pending: 0, totalPriority: 0 };
    }
    entities[name].total++;
    entities[name].totalPriority += r.priority_score;
    if (r.status === 'resolved') {
      entities[name].resolved++;
    } else {
      entities[name].pending++;
    }
  });

  const leaderboard = Object.values(entities).map((e) => ({
    ...e,
    avgPriority: Math.round(e.totalPriority / e.total),
    delayPercentage: Math.round((e.pending / e.total) * 100),
  }));

  leaderboard.sort((a, b) => b.delayPercentage - a.delayPercentage);
  return leaderboard;
}

// === تحديث حالة بلاغ ===
export async function updateReportStatus(reportId, newStatus) {
  const updateData = {
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (newStatus === 'resolved') {
    updateData.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('reports')
    .update(updateData)
    .eq('id', reportId)
    .select()
    .single();

  if (error) throw new Error('فشل تحديث الحالة: ' + error.message);
  return data;
}