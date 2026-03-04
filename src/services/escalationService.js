import { supabase } from '../supabase';

const RULES = {
  AGE: { ppd: 1, max: 15 }, DUP: { ppr: 5, max: 25 },
  NO_RESP: { hours: 48, boost: 10 }, TRAFFIC: { boost: 8 },
  NO_SAFETY: { boost: 7 }, EXPIRED: { boost: 10 },
};

export function calculateDynamicPriority({ basePriority, createdAt, status, clusterSize = 0, blocksTraffic = false, hasSafetyBarriers = true, isExcavation = false, licenseExpired = false }) {
  let score = basePriority;
  const factors = [];
  const now = new Date();
  const created = new Date(createdAt);
  const days = Math.floor((now - created) / 86400000);

  if (days > 0 && status !== 'resolved') {
    const boost = Math.min(days * RULES.AGE.ppd, RULES.AGE.max);
    if (boost > 0) { score += boost; factors.push({ name: 'عمر البلاغ', boost, detail: `${days} يوم بدون حل`, icon: '⏱️' }); }
  }
  if (clusterSize > 0) {
    const boost = Math.min(clusterSize * RULES.DUP.ppr, RULES.DUP.max);
    score += boost; factors.push({ name: 'بلاغات مكررة', boost, detail: `${clusterSize} بلاغ مشابه`, icon: '📍' });
  }
  if (basePriority >= 70 && status === 'new') {
    const hrs = (now - created) / 3600000;
    if (hrs >= RULES.NO_RESP.hours) { score += RULES.NO_RESP.boost; factors.push({ name: 'تأخر الاستجابة', boost: RULES.NO_RESP.boost, detail: `بلاغ حرج بدون استجابة`, icon: '🚨' }); }
  }
  if (blocksTraffic) { score += RULES.TRAFFIC.boost; factors.push({ name: 'يعيق المرور', boost: RULES.TRAFFIC.boost, detail: 'إعاقة مرورية', icon: '🚗' }); }
  if (isExcavation && !hasSafetyBarriers) { score += RULES.NO_SAFETY.boost; factors.push({ name: 'خطر سلامة', boost: RULES.NO_SAFETY.boost, detail: 'بدون حواجز سلامة', icon: '⚠️' }); }
  if (isExcavation && licenseExpired) { score += RULES.EXPIRED.boost; factors.push({ name: 'ترخيص منتهي', boost: RULES.EXPIRED.boost, detail: 'تجاوزت مدة الترخيص', icon: '📋' }); }

  const final = Math.min(Math.round(score), 100);
  const level = final >= 85 ? { label: 'حرج جداً', color: '#991B1B', icon: '🔴' } : final >= 70 ? { label: 'حرج', color: '#DC2626', icon: '🟠' } : final >= 55 ? { label: 'مرتفع', color: '#F97316', icon: '🟡' } : final >= 40 ? { label: 'متوسط', color: '#EAB308', icon: '🟢' } : { label: 'منخفض', color: '#22C55E', icon: '⚪' };

  return { baseScore: basePriority, dynamicScore: final, totalBoost: final - basePriority, level, factors, escalated: final > basePriority, escalationSummary: factors.length > 0 ? `⬆️ رفع من ${basePriority} إلى ${final}` : null };
}

export async function getEscalationReport() {
  try {
    const { data: reports } = await supabase.from('reports').select('*').neq('status', 'resolved').order('priority_score', { ascending: false }).limit(20);
    if (!reports) return { escalated: [], summary: null };
    const escalated = [];
    for (const r of reports) {
      let cs = 0;
      if (r.cluster_id) {
        const { count } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('cluster_id', r.cluster_id);
        cs = (count || 1) - 1;
      }
      const d = calculateDynamicPriority({ basePriority: r.priority_score, createdAt: r.created_at, status: r.status, clusterSize: cs, blocksTraffic: r.blocks_traffic, hasSafetyBarriers: r.has_safety_barriers, isExcavation: r.category === 'excavation', licenseExpired: false });
      if (d.escalated) escalated.push({ report: r, ...d });
    }
    return { escalated, summary: { totalActive: reports.length, totalEscalated: escalated.length, avgBoost: escalated.length > 0 ? Math.round(escalated.reduce((s, r) => s + r.totalBoost, 0) / escalated.length) : 0 } };
  } catch { return { escalated: [], summary: null }; }
}
