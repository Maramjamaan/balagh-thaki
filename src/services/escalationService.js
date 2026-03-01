// =============================================
// خدمة التصعيد الذكي — Smart Escalation
// الطبقة الثانية: الذكاء (Intelligence)
// =============================================
// بدل أولوية ثابتة تنحسب مرة واحدة وما تتغير،
// الأولوية ديناميكية: تزيد مع الوقت، التكرار، وعدم الاستجابة

import { supabase } from '../supabase';

// === قواعد التصعيد ===
const ESCALATION_RULES = {
  // كل يوم بدون حل = +1 نقطة (حد أقصى 15)
  AGE_FACTOR: { pointsPerDay: 1, max: 15 },

  // كل بلاغ مكرر في نفس المنطقة = +5 (حد أقصى 25)
  DUPLICATE_FACTOR: { pointsPerReport: 5, max: 25 },

  // بلاغ حرج بدون استجابة خلال 48 ساعة = +10
  NO_RESPONSE_CRITICAL: { hours: 48, boost: 10 },

  // بلاغ يسد الطريق = +8
  BLOCKS_TRAFFIC: { boost: 8 },

  // بدون حواجز سلامة = +7
  NO_SAFETY_BARRIERS: { boost: 7 },

  // حفرية منتهية الترخيص = +10
  EXPIRED_LICENSE: { boost: 10 },
};

// === حساب الأولوية الديناميكية لبلاغ واحد ===
export function calculateDynamicPriority({
  basePriority,        // الأولوية الأساسية من priorityService
  createdAt,           // تاريخ إنشاء البلاغ
  status,              // الحالة الحالية
  clusterSize = 0,     // عدد البلاغات المشابهة
  blocksTraffic = false,
  hasSafetyBarriers = true,
  isExcavation = false,
  licenseExpired = false,
}) {
  let dynamicScore = basePriority;
  const factors = [];

  // 1. عامل العمر — كل يوم يزيد الأولوية
  const now = new Date();
  const created = new Date(createdAt);
  const daysOld = Math.floor((now - created) / (1000 * 60 * 60 * 24));

  if (daysOld > 0 && status !== 'resolved') {
    const ageBoost = Math.min(
      daysOld * ESCALATION_RULES.AGE_FACTOR.pointsPerDay,
      ESCALATION_RULES.AGE_FACTOR.max
    );
    dynamicScore += ageBoost;
    if (ageBoost > 0) {
      factors.push({
        name: 'عمر البلاغ',
        name_en: 'Report Age',
        boost: ageBoost,
        detail: `${daysOld} يوم بدون حل (+${ageBoost})`,
        icon: '⏱️',
      });
    }
  }

  // 2. عامل التكرار — بلاغات مشابهة قريبة
  if (clusterSize > 0) {
    const dupBoost = Math.min(
      clusterSize * ESCALATION_RULES.DUPLICATE_FACTOR.pointsPerReport,
      ESCALATION_RULES.DUPLICATE_FACTOR.max
    );
    dynamicScore += dupBoost;
    factors.push({
      name: 'بلاغات مكررة',
      name_en: 'Duplicate Reports',
      boost: dupBoost,
      detail: `${clusterSize} بلاغ مشابه (+${dupBoost})`,
      icon: '📍',
    });
  }

  // 3. عامل عدم الاستجابة — بلاغ حرج بدون رد
  if (basePriority >= 70 && status === 'new') {
    const hoursOld = (now - created) / (1000 * 60 * 60);
    if (hoursOld >= ESCALATION_RULES.NO_RESPONSE_CRITICAL.hours) {
      dynamicScore += ESCALATION_RULES.NO_RESPONSE_CRITICAL.boost;
      factors.push({
        name: 'تأخر الاستجابة',
        name_en: 'No Response',
        boost: ESCALATION_RULES.NO_RESPONSE_CRITICAL.boost,
        detail: `بلاغ حرج بدون استجابة لأكثر من ${Math.round(hoursOld)} ساعة`,
        icon: '🚨',
      });
    }
  }

  // 4. عامل إعاقة المرور
  if (blocksTraffic) {
    dynamicScore += ESCALATION_RULES.BLOCKS_TRAFFIC.boost;
    factors.push({
      name: 'يعيق المرور',
      name_en: 'Blocks Traffic',
      boost: ESCALATION_RULES.BLOCKS_TRAFFIC.boost,
      detail: 'المشكلة تسبب إعاقة مرورية',
      icon: '🚗',
    });
  }

  // 5. عامل السلامة — حفرية بدون حواجز
  if (isExcavation && !hasSafetyBarriers) {
    dynamicScore += ESCALATION_RULES.NO_SAFETY_BARRIERS.boost;
    factors.push({
      name: 'خطر سلامة',
      name_en: 'Safety Risk',
      boost: ESCALATION_RULES.NO_SAFETY_BARRIERS.boost,
      detail: 'حفرية بدون حواجز سلامة',
      icon: '⚠️',
    });
  }

  // 6. عامل انتهاء الترخيص
  if (isExcavation && licenseExpired) {
    dynamicScore += ESCALATION_RULES.EXPIRED_LICENSE.boost;
    factors.push({
      name: 'ترخيص منتهي',
      name_en: 'Expired License',
      boost: ESCALATION_RULES.EXPIRED_LICENSE.boost,
      detail: 'الحفرية تجاوزت مدة الترخيص',
      icon: '📋',
    });
  }

  // الحد الأقصى 100
  const finalScore = Math.min(Math.round(dynamicScore), 100);

  return {
    baseScore: basePriority,
    dynamicScore: finalScore,
    totalBoost: finalScore - basePriority,
    level: getDynamicLevel(finalScore),
    factors,
    escalated: finalScore > basePriority,
    escalationSummary: factors.length > 0
      ? `⬆️ تم رفع الأولوية من ${basePriority} إلى ${finalScore} بسبب ${factors.length} عوامل`
      : null,
  };
}

// === تحديد المستوى الديناميكي ===
function getDynamicLevel(score) {
  if (score >= 85) return { label: 'حرج جداً', label_en: 'Critical', color: '#991B1B', icon: '🔴' };
  if (score >= 70) return { label: 'حرج', label_en: 'High', color: '#DC2626', icon: '🟠' };
  if (score >= 55) return { label: 'مرتفع', label_en: 'Elevated', color: '#F97316', icon: '🟡' };
  if (score >= 40) return { label: 'متوسط', label_en: 'Medium', color: '#EAB308', icon: '🟢' };
  return { label: 'منخفض', label_en: 'Low', color: '#22C55E', icon: '⚪' };
}

// === تحديث أولويات جميع البلاغات النشطة ===
// يمكن استدعاؤها دورياً أو عند فتح لوحة التحكم
export async function recalculateAllPriorities() {
  try {
    const { data: activeReports, error } = await supabase
      .from('reports')
      .select('*')
      .neq('status', 'resolved');

    if (error || !activeReports) return [];

    const updates = [];

    for (const report of activeReports) {
      // حساب حجم المجموعة
      let clusterSize = 0;
      if (report.cluster_id) {
        const { count } = await supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .eq('cluster_id', report.cluster_id);
        clusterSize = (count || 1) - 1;
      }

      const dynamic = calculateDynamicPriority({
        basePriority: report.priority_score,
        createdAt: report.created_at,
        status: report.status,
        clusterSize,
        blocksTraffic: report.blocks_traffic,
        hasSafetyBarriers: report.has_safety_barriers,
        isExcavation: report.category === 'excavation',
        licenseExpired: false,
      });

      // تحديث إذا تغيرت الأولوية
      if (dynamic.dynamicScore !== report.priority_score) {
        updates.push({
          id: report.id,
          oldScore: report.priority_score,
          newScore: dynamic.dynamicScore,
          factors: dynamic.factors,
        });

        await supabase
          .from('reports')
          .update({
            priority_score: dynamic.dynamicScore,
            updated_at: new Date().toISOString(),
          })
          .eq('id', report.id);
      }
    }

    console.log(`[Escalation] Updated ${updates.length} report priorities`);
    return updates;
  } catch (err) {
    console.warn('[Escalation] Error recalculating:', err.message);
    return [];
  }
}

// === جلب تقرير التصعيد للوحة التحكم ===
export async function getEscalationReport() {
  try {
    const { data: reports } = await supabase
      .from('reports')
      .select('*')
      .neq('status', 'resolved')
      .order('priority_score', { ascending: false })
      .limit(20);

    if (!reports) return { escalated: [], summary: null };

    const escalatedReports = [];

    for (const report of reports) {
      let clusterSize = 0;
      if (report.cluster_id) {
        const { count } = await supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .eq('cluster_id', report.cluster_id);
        clusterSize = (count || 1) - 1;
      }

      const dynamic = calculateDynamicPriority({
        basePriority: report.priority_score,
        createdAt: report.created_at,
        status: report.status,
        clusterSize,
        blocksTraffic: report.blocks_traffic,
        hasSafetyBarriers: report.has_safety_barriers,
        isExcavation: report.category === 'excavation',
        licenseExpired: false,
      });

      if (dynamic.escalated) {
        escalatedReports.push({
          report,
          ...dynamic,
        });
      }
    }

    return {
      escalated: escalatedReports,
      summary: {
        totalActive: reports.length,
        totalEscalated: escalatedReports.length,
        avgBoost: escalatedReports.length > 0
          ? Math.round(escalatedReports.reduce((s, r) => s + r.totalBoost, 0) / escalatedReports.length)
          : 0,
      },
    };
  } catch (err) {
    console.warn('[Escalation] Error getting report:', err.message);
    return { escalated: [], summary: null };
  }
}