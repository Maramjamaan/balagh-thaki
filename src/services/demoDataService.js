import { supabase, isDemo } from '../supabase';
import riyadhAreas from '../data/riyadhAreas';

const EXCAVATION_TYPES = [
  { category: 'delayed_excavation', subcategory: 'delayed_permit', category_ar: 'حفرية متأخرة عن الترخيص', subcategory_ar: 'تجاوزت مدة الترخيص', entities: ['NWC','SEC','STC','Mobily'], sevRange: [3,5], ageRange: [35,120] },
  { category: 'abandoned_excavation', subcategory: 'abandoned_no_barriers', category_ar: 'حفرية مهجورة', subcategory_ar: 'مهجورة بدون حواجز سلامة', entities: ['NWC','SEC','STC'], sevRange: [4,5], ageRange: [60,180] },
  { category: 'post_paving_dig', subcategory: 'dig_after_pave', category_ar: 'حفر بعد السفلتة', subcategory_ar: 'إعادة حفر بعد السفلتة', entities: ['STC','Zain','NWC','Mobily'], sevRange: [3,5], ageRange: [1,15] },
  { category: 'no_safety_barriers', subcategory: 'missing_barriers', category_ar: 'حفرية بدون حواجز سلامة', subcategory_ar: 'مكشوفة بدون تحذير', entities: ['NWC','SEC','Municipality'], sevRange: [4,5], ageRange: [5,60] },
  { category: 'no_license_visible', subcategory: 'no_permit_sign', category_ar: 'حفرية بدون ترخيص ظاهر', subcategory_ar: 'لا يوجد لوحة ترخيص', entities: ['NWC','STC','Mobily','Zain'], sevRange: [2,4], ageRange: [3,45] },
  { category: 'active_excavation', subcategory: 'active_work', category_ar: 'حفرية نشطة', subcategory_ar: 'أعمال جارية', entities: ['NWC','SEC','STC','Municipality'], sevRange: [1,3], ageRange: [1,20] },
  { category: 'delayed_excavation', subcategory: 'stagnant_work', category_ar: 'حفرية متوقفة العمل', subcategory_ar: 'أعمال متوقفة منذ فترة', entities: ['SEC','Mobily','Zain'], sevRange: [3,4], ageRange: [20,90] },
  { category: 'abandoned_excavation', subcategory: 'abandoned_with_debris', category_ar: 'حفرية مهجورة بأنقاض', subcategory_ar: 'مهجورة مع مخلفات بناء', entities: ['NWC','SEC'], sevRange: [4,5], ageRange: [45,150] },
];

const STAGES = ['new', 'active', 'abandoned', 'partially_filled'];
const STATUSES = ['new', 'new', 'new', 'in_progress', 'in_progress', 'in_progress', 'resolved', 'resolved'];
const ROAD_CONDITIONS = ['intact', 'cracked', 'broken', 'destroyed'];
const LICENSE_ESTIMATES = ['likely_within_permit', 'likely_expired', 'clearly_expired', 'unknown'];
const SAFETY_LEVELS = ['low', 'medium', 'high', 'critical'];
const CLUSTER_IDS = ['CLT-NWC-OLAYA-001', 'CLT-SEC-MALAZ-002', 'CLT-STC-NAKHEEL-003', 'CLT-NWC-SULAIMANIYA-004', 'CLT-MOB-YASMIN-005', 'CLT-NWC-RAWDAH-006'];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function jitter(val, range = 0.004) { return val + (Math.random() - 0.5) * range * 2; }

function generateReport(index) {
  const area = pick(riyadhAreas);
  const type = pick(EXCAVATION_TYPES);
  const severity = rand(type.sevRange[0], type.sevRange[1]);
  const status = pick(STATUSES);
  const estimatedAge = rand(type.ageRange[0], type.ageRange[1]);
  const daysAgo = rand(0, 28);
  const created = new Date(Date.now() - daysAgo * 86400000);
  const entity = pick(type.entities);
  const confidence = rand(70, 98) / 100;
  const blocksTraffic = severity >= 4 ? Math.random() > 0.2 : Math.random() > 0.6;
  const hasSafety = type.category === 'no_safety_barriers' ? false : type.category === 'abandoned_excavation' ? Math.random() > 0.7 : Math.random() > 0.3;
  const hasLicense = type.category === 'no_license_visible' ? false : Math.random() > 0.4;
  const stage = type.category === 'abandoned_excavation' ? 'abandoned' : type.category === 'active_excavation' ? 'active' : pick(STAGES);

  // License status based on age
  const licenseStatus = estimatedAge > 60 ? 'clearly_expired' : estimatedAge > 30 ? 'likely_expired' : estimatedAge > 20 ? 'unknown' : 'likely_within_permit';
  const safetyRisk = severity >= 5 ? 'critical' : severity >= 4 ? 'high' : severity >= 3 ? 'medium' : 'low';

  let clusterId = null;
  if (index < 18 && Math.random() > 0.4) {
    clusterId = CLUSTER_IDS[Math.floor(index / 3)];
  }

  const basePriority = Math.min(100, Math.round(
    severity * 5 +
    (area.population / 100000) * 20 +
    (area.traffic / 100) * 20 +
    (clusterId ? 10 : 0) +
    (blocksTraffic ? 8 : 0) +
    (estimatedAge > 30 ? 5 : 0) +
    (!hasSafety ? 7 : 0) +
    rand(0, 8)
  ));

  return {
    id: `rpt-${String(index + 1).padStart(3, '0')}-${Math.random().toString(36).slice(2,6)}`,
    category: type.category,
    subcategory: type.subcategory,
    category_ar: type.category_ar,
    subcategory_ar: type.subcategory_ar,
    severity, ai_severity: severity,
    ai_confidence: confidence,
    ai_classification: type,
    responsible_entity: entity,
    status,
    priority_score: basePriority,
    latitude: jitter(area.lat),
    longitude: jitter(area.lng),
    neighborhood: area.name,
    description: type.category_ar + ' — حي ' + area.name + ' — عمرها التقديري ' + estimatedAge + ' يوم',
    image_url: '',
    excavation_stage: stage,
    estimated_age_days: estimatedAge,
    has_safety_barriers: hasSafety,
    has_visible_license: hasLicense,
    blocks_traffic: blocksTraffic,
    road_condition: pick(ROAD_CONDITIONS),
    license_status_estimate: licenseStatus,
    safety_risk_level: safetyRisk,
    cluster_id: clusterId,
    created_at: created.toISOString(),
    updated_at: created.toISOString(),
  };
}

let seeded = false;

export async function seedDemoData() {
  if (seeded) return;
  if (!isDemo && !supabase._isDemo) return;
  const store = supabase._demoStore;
  if (!store) return;

  store.reports = [];
  for (let i = 0; i < 45; i++) {
    store.reports.push(generateReport(i));
  }
  seeded = true;
  console.log(`[Demo] Seeded ${store.reports.length} excavation reports across Riyadh`);
}

export function isDemoMode() {
  return isDemo || !!supabase._isDemo;
}
