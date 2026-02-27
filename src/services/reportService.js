import { supabase } from '../supabase';
import { analyzeImage } from './aiService';
import { getCurrentLocation } from './locationService';
import { calculatePriority } from './priorityService';

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

// === إرسال بلاغ جديد (الدالة الرئيسية) ===
export async function submitReport(imageFile) {
  // 1. تحليل الصورة بالذكاء الاصطناعي
  const aiResult = await analyzeImage(imageFile);

  // 2. تحديد الموقع
  let location;
  try {
    location = await getCurrentLocation();
  } catch {
    // موقع افتراضي (وسط الرياض) لو المستخدم رفض تحديد الموقع
    location = {
      latitude: 24.7136,
      longitude: 46.6753,
      neighborhood: 'العليا'
    };
  }

  // 3. حساب تكرار البلاغات
  const reportCount = await getReportCount(location.neighborhood, aiResult.category);

  // 4. حساب الأولوية
  const priority = calculatePriority({
    severity: aiResult.severity,
    latitude: location.latitude,
    longitude: location.longitude,
    reportCount: reportCount + 1,
    daysOpen: 0,
    nearbySchoolsHospitals: 1,
    licenseExpired: false,
    delayDays: 0
  });

  // 5. رفع الصورة
  let imageUrl = null;
  try {
    imageUrl = await uploadImage(imageFile);
  } catch (err) {
    console.error('تنبيه: فشل رفع الصورة', err);
  }

  // 6. حفظ البلاغ في قاعدة البيانات
  const { data, error } = await supabase
    .from('reports')
    .insert({
      // الصورة
      image_url: imageUrl,

      // التصنيف (جديد)
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

      // الذكاء الاصطناعي (جديد)
      ai_classification: aiResult,
      ai_severity: aiResult.severity,
      ai_confidence: aiResult.confidence,

      // الأولوية
      priority_score: priority.score,

      // الحالة
      status: 'new',

      // الجهة المسؤولة (جديد)
      responsible_entity: aiResult.responsible_entity,

      // بيانات الحفرية (جديد)
      excavation_stage: aiResult.excavation_stage,
      has_safety_barriers: aiResult.has_safety_barriers,
      has_visible_license: aiResult.has_visible_license,
      blocks_traffic: aiResult.blocks_traffic,
    })
    .select()
    .single();

  if (error) throw new Error('فشل حفظ البلاغ: ' + error.message);

  return {
    report: data,
    ai: aiResult,
    location,
    priority
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
  const { data: reports } = await supabase
    .from('reports')
    .select('*');

  if (!reports || reports.length === 0) return null;

  const total = reports.length;
  const newCount = reports.filter(r => r.status === 'new').length;
  const inProgress = reports.filter(r => r.status === 'in_progress').length;
  const resolved = reports.filter(r => r.status === 'resolved').length;
  const critical = reports.filter(r => r.priority_score >= 80).length;
  const avgScore = Math.round(reports.reduce((sum, r) => sum + r.priority_score, 0) / total);

  // إحصائيات حسب الفئة
  const byCategory = {};
  const byNeighborhood = {};
  const byEntity = {};

  reports.forEach(r => {
    // حسب الفئة
    const cat = r.category_ar || r.category || 'غير مصنف';
    byCategory[cat] = (byCategory[cat] || 0) + 1;

    // حسب الحي
    const hood = r.neighborhood || 'غير محدد';
    byNeighborhood[hood] = (byNeighborhood[hood] || 0) + 1;

    // حسب الجهة المسؤولة (جديد)
    const entity = r.responsible_entity || 'غير محدد';
    byEntity[entity] = (byEntity[entity] || 0) + 1;
  });

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
    byEntity
  };
}

// === جلب بيانات ترتيب الشركات — Leaderboard (جديد) ===
export async function getLeaderboard() {
  const { data: reports } = await supabase
    .from('reports')
    .select('responsible_entity, status, priority_score, created_at')
    .eq('category', 'excavation');

  if (!reports || reports.length === 0) return [];

  // تجميع حسب الشركة
  const entities = {};
  reports.forEach(r => {
    const name = r.responsible_entity || 'غير محدد';
    if (!entities[name]) {
      entities[name] = {
        name,
        total: 0,
        resolved: 0,
        pending: 0,
        totalPriority: 0
      };
    }
    entities[name].total++;
    entities[name].totalPriority += r.priority_score;
    if (r.status === 'resolved') {
      entities[name].resolved++;
    } else {
      entities[name].pending++;
    }
  });

  // حساب النسب والترتيب
  const leaderboard = Object.values(entities).map(e => ({
    ...e,
    avgPriority: Math.round(e.totalPriority / e.total),
    delayPercentage: Math.round((e.pending / e.total) * 100)
  }));

  // ترتيب من الأسوأ للأفضل
  leaderboard.sort((a, b) => b.delayPercentage - a.delayPercentage);

  return leaderboard;
}

// === تحديث حالة بلاغ ===
export async function updateReportStatus(reportId, newStatus) {
  const updateData = {
    status: newStatus,
    updated_at: new Date().toISOString()
  };

  // لو البلاغ انحل، سجل تاريخ الحل
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
