import { supabase, isDemo } from '../supabase';
import riyadhAreas from '../data/riyadhAreas';

const DEMO_CATEGORIES = [
  { category: 'excavation', subcategory: 'delayed_excavation', category_ar: 'حفرية متأخرة', subcategory_ar: 'حفرية متأخرة عن الترخيص', entities: ['NWC','SEC','STC'], sevRange: [3,5] },
  { category: 'excavation', subcategory: 'abandoned_excavation', category_ar: 'حفرية مهجورة', subcategory_ar: 'حفرية مهجورة بدون حواجز', entities: ['NWC','SEC','Mobily'], sevRange: [4,5] },
  { category: 'excavation', subcategory: 'post_paving_dig', category_ar: 'حفر بعد السفلتة', subcategory_ar: 'إعادة حفر بعد السفلتة', entities: ['STC','Zain','NWC'], sevRange: [3,5] },
  { category: 'water_leak', subcategory: 'water_leak', category_ar: 'تسرب مياه', subcategory_ar: 'تسرب مياه رئيسي', entities: ['NWC'], sevRange: [2,4] },
  { category: 'lighting', subcategory: 'broken_light', category_ar: 'إنارة معطلة', subcategory_ar: 'عمود إنارة معطل', entities: ['Municipality','SEC'], sevRange: [1,3] },
  { category: 'traffic', subcategory: 'uturn_request', category_ar: 'طلب فتح يوتيرن', subcategory_ar: 'يوتيرن مغلق', entities: ['Traffic_Dept'], sevRange: [2,3] },
  { category: 'traffic', subcategory: 'signal_request', category_ar: 'طلب إشارة مرورية', subcategory_ar: 'تقاطع بدون إشارة', entities: ['Traffic_Dept'], sevRange: [3,4] },
  { category: 'road_damage', subcategory: 'road_cracks', category_ar: 'تشققات في الطريق', subcategory_ar: 'تشققات خطيرة', entities: ['Municipality','RIPC'], sevRange: [2,4] },
  { category: 'sidewalk', subcategory: 'unsafe_sidewalk', category_ar: 'رصيف تالف', subcategory_ar: 'رصيف متهالك', entities: ['Municipality'], sevRange: [2,3] },
  { category: 'debris', subcategory: 'construction_debris', category_ar: 'مخلفات بناء', subcategory_ar: 'أنقاض متراكمة', entities: ['Cleaning_Company','Municipality'], sevRange: [2,4] },
  { category: 'suggestion', subcategory: 'shading_suggestion', category_ar: 'اقتراح تظليل', subcategory_ar: 'شارع يحتاج تشجير', entities: ['Municipality_Planning'], sevRange: [1,2] },
];

const STATUSES = ['new', 'new', 'new', 'in_progress', 'in_progress', 'in_progress', 'resolved', 'resolved'];
const CLUSTER_IDS = ['CLT-RYD-001', 'CLT-RYD-002', 'CLT-RYD-003', 'CLT-RYD-004', 'CLT-RYD-005'];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function jitter(val, range = 0.004) { return val + (Math.random() - 0.5) * range * 2; }

function generateReport(index) {
  const area = pick(riyadhAreas);
  const cat = pick(DEMO_CATEGORIES);
  const severity = rand(cat.sevRange[0], cat.sevRange[1]);
  const status = pick(STATUSES);
  const daysAgo = rand(0, 28);
  const created = new Date(Date.now() - daysAgo * 86400000);
  const entity = pick(cat.entities);
  const confidence = rand(65, 98) / 100;
  const blocksTraffic = cat.category === 'excavation' ? Math.random() > 0.3 : Math.random() > 0.7;
  const hasSafety = cat.category === 'excavation' ? Math.random() > 0.5 : true;

  let clusterId = null;
  if (index < 15 && Math.random() > 0.45) {
    clusterId = CLUSTER_IDS[Math.floor(index / 3)];
  }

  const basePriority = Math.min(100, Math.round(
    severity * 5 + (area.population / 100000) * 20 + (area.traffic / 100) * 20 +
    (clusterId ? 10 : 0) + (blocksTraffic ? 8 : 0) + rand(0, 8)
  ));

  return {
    id: `rpt-${String(index + 1).padStart(3, '0')}-${Math.random().toString(36).slice(2,6)}`,
    category: cat.category,
    subcategory: cat.subcategory,
    category_ar: cat.category_ar,
    subcategory_ar: cat.subcategory_ar,
    severity, ai_severity: severity,
    ai_confidence: confidence,
    ai_classification: cat,
    responsible_entity: entity,
    status,
    priority_score: basePriority,
    latitude: jitter(area.lat),
    longitude: jitter(area.lng),
    neighborhood: area.name,
    description: cat.subcategory_ar + ' — حي ' + area.name,
    image_url: '',
    excavation_stage: cat.category === 'excavation' ? pick(['abandoned', 'active', 'new', 'partially_filled']) : 'not_applicable',
    has_safety_barriers: hasSafety,
    has_visible_license: Math.random() > 0.4,
    blocks_traffic: blocksTraffic,
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
  console.log(`[Demo] Seeded ${store.reports.length} reports`);
}

export function isDemoMode() {
  return isDemo || !!supabase._isDemo;
}
