import { supabase } from '../supabase';
import { analyzeImage } from './aiService';
import { getCurrentLocation } from './locationService';
import { calculatePriority } from './priorityService';

// === رفع صورة البلاغ إلى Supabase Storage ===
async function uploadImage(imageFile) {
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

  const { data, error } = await supabase.storage
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
    .eq('category_name', category);

  return count || 0;
}

// === إرسال بلاغ جديد (الدالة الرئيسية) ===
export async function submitReport(imageFile, phone) {
  // 1. تحليل الصورة بالذكاء الاصطناعي
  const aiResult = await analyzeImage(imageFile);

  // 2. تحديد الموقع
  let location;
  try {
    location = await getCurrentLocation();
  } catch {
    // موقع افتراضي (وسط الرياض) لو المستخدم رفض GPS
    location = {
      latitude: 24.7136,
      longitude: 46.6753,
      neighborhood: 'العليا'
    };
  }

  // 3. حساب تكرار البلاغات
  const reportCount = await getReportCount(location.neighborhood, aiResult.category_ar);

  // 4. حساب الأولوية
  const priority = calculatePriority({
    severity: aiResult.severity,
    latitude: location.latitude,
    longitude: location.longitude,
    reportCount: reportCount + 1
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
      image_url: imageUrl,
      category_name: aiResult.category_ar,
      description: aiResult.description_ar,
      severity: aiResult.severity,
      latitude: location.latitude,
      longitude: location.longitude,
      neighborhood: location.neighborhood,
      priority_score: priority.score,
      status: 'pending',
      reporter_phone: phone || null,
      ai_analysis: {
        ...aiResult,
        priority_breakdown: priority.breakdown
      }
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

  if (!reports) return null;

  const total = reports.length;
  const pending = reports.filter(r => r.status === 'pending').length;
  const inProgress = reports.filter(r => r.status === 'in_progress').length;
  const resolved = reports.filter(r => r.status === 'resolved').length;
  const critical = reports.filter(r => r.priority_score >= 80).length;
  const avgScore = total > 0 ? Math.round(reports.reduce((sum, r) => sum + r.priority_score, 0) / total) : 0;

  // أكثر الأحياء بلاغات
  const byCat = {};
  const byHood = {};
  reports.forEach(r => {
    byCat[r.category_name] = (byCat[r.category_name] || 0) + 1;
    byHood[r.neighborhood] = (byHood[r.neighborhood] || 0) + 1;
  });

  return {
    total,
    pending,
    inProgress,
    resolved,
    critical,
    avgScore,
    byCategory: byCat,
    byNeighborhood: byHood
  };
}

// === تحديث حالة بلاغ ===
export async function updateReportStatus(reportId, newStatus) {
  const { data, error } = await supabase
    .from('reports')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', reportId)
    .select()
    .single();

  if (error) throw new Error('فشل تحديث الحالة: ' + error.message);
  return data;
}