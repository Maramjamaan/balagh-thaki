const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

// === هل الذكاء الاصطناعي مفعّل؟ ===
const isAIEnabled = () => {
  return OPENAI_API_KEY && OPENAI_API_KEY !== 'demo';
};

// === تحليل الصورة بالذكاء الاصطناعي (الوضع الحقيقي) ===
async function analyzeWithOpenAI(imageBase64) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Analyze this image of a street/road issue in Saudi Arabia. Return ONLY valid JSON:
{
  "category": "excavation|water_leak|lighting|traffic|sidewalk|road_damage|debris|suggestion|other",
  "subcategory": "specific issue like: delayed_excavation, abandoned_excavation, no_license_visible, post_paving_dig, traffic_diversion, uturn_request, signal_request, speed_bump_request, road_opening_request, water_leak, broken_light, area_blackout, flooding, unsafe_sidewalk, road_cracks, construction_debris, roundabout_suggestion, crosswalk_suggestion, parking_suggestion, shading_suggestion",
  "category_ar": "الاسم بالعربي",
  "subcategory_ar": "التصنيف الفرعي بالعربي",
  "severity": 1-5,
  "excavation_stage": "new|active|abandoned|partially_filled|complete|not_applicable",
  "has_safety_barriers": true/false,
  "has_visible_license": true/false,
  "blocks_traffic": true/false,
  "responsible_entity": "NWC|SEC|STC|Mobily|Zain|Municipality|Traffic_Dept|RIPC|Municipality_Planning|Cleaning_Company",
  "confidence": 0.0-1.0,
  "description_ar": "وصف المشكلة بالعربي",
  "description_en": "English description"
}`
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'حلل هذه الصورة وحدد نوع مشكلة البنية التحتية وشدتها والجهة المسؤولة' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }
      ],
      max_tokens: 500
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'خطأ في الذكاء الاصطناعي');
  }

  const text = data.choices[0].message.content;
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
  return JSON.parse(jsonStr);
}

// === التحليل التجريبي (بدون مفتاح ذكاء اصطناعي) ===
function analyzeDemo(imageFile) {
  const demoResults = [
    {
      category: 'excavation', subcategory: 'delayed_excavation',
      category_ar: 'حفرية متأخرة عن الترخيص', subcategory_ar: 'حفرية متأخرة',
      severity: 4, excavation_stage: 'abandoned', has_safety_barriers: false,
      has_visible_license: false, blocks_traffic: true,
      responsible_entity: 'NWC', confidence: 0.92,
      description_ar: 'حفرية مهجورة متأخرة عن موعد الترخيص بدون حواجز سلامة',
      description_en: 'Abandoned excavation past license deadline with no safety barriers'
    },
    {
      category: 'excavation', subcategory: 'abandoned_excavation',
      category_ar: 'حفرية مهجورة', subcategory_ar: 'حفرية مهجورة بدون حواجز',
      severity: 5, excavation_stage: 'abandoned', has_safety_barriers: false,
      has_visible_license: false, blocks_traffic: true,
      responsible_entity: 'SEC', confidence: 0.88,
      description_ar: 'حفرية مهجورة بدون حواجز سلامة تشكل خطر على المارة',
      description_en: 'Abandoned excavation without safety barriers posing danger'
    },
    {
      category: 'excavation', subcategory: 'post_paving_dig',
      category_ar: 'حفر بعد السفلتة', subcategory_ar: 'شارع اتسفلت ورجعوا حفروه',
      severity: 4, excavation_stage: 'active', has_safety_barriers: true,
      has_visible_license: true, blocks_traffic: true,
      responsible_entity: 'STC', confidence: 0.85,
      description_ar: 'شارع جديد تم سفلتته ثم أعيد حفره لأعمال اتصالات',
      description_en: 'Newly paved street re-excavated for telecom work'
    },
    {
      category: 'water_leak', subcategory: 'water_leak',
      category_ar: 'تسرب مياه', subcategory_ar: 'تسرب مياه مستمر',
      severity: 3, excavation_stage: 'not_applicable', has_safety_barriers: false,
      has_visible_license: false, blocks_traffic: false,
      responsible_entity: 'NWC', confidence: 0.90,
      description_ar: 'تسرب مياه مستمر يسبب تجمع المياه في الشارع',
      description_en: 'Continuous water leak causing water accumulation'
    },
    {
      category: 'lighting', subcategory: 'broken_light',
      category_ar: 'إنارة معطلة', subcategory_ar: 'عمود إنارة معطل',
      severity: 2, excavation_stage: 'not_applicable', has_safety_barriers: false,
      has_visible_license: false, blocks_traffic: false,
      responsible_entity: 'Municipality', confidence: 0.85,
      description_ar: 'عمود إنارة معطل في منطقة سكنية',
      description_en: 'Broken street light in residential area'
    },
    {
      category: 'traffic', subcategory: 'uturn_request',
      category_ar: 'طلب فتح يوتيرن', subcategory_ar: 'يوتيرن مغلق بدون بدائل',
      severity: 3, excavation_stage: 'not_applicable', has_safety_barriers: false,
      has_visible_license: false, blocks_traffic: false,
      responsible_entity: 'Traffic_Dept', confidence: 0.87,
      description_ar: 'يوتيرن مغلق يسبب تحويلة طويلة للسكان',
      description_en: 'Closed U-turn causing long detour for residents'
    },
    {
      category: 'traffic', subcategory: 'speed_bump_request',
      category_ar: 'طلب مطب صناعي', subcategory_ar: 'شارع سكني بدون مطبات',
      severity: 3, excavation_stage: 'not_applicable', has_safety_barriers: false,
      has_visible_license: false, blocks_traffic: false,
      responsible_entity: 'Municipality', confidence: 0.83,
      description_ar: 'شارع سكني سرعة السيارات فيه عالية ويحتاج مطب',
      description_en: 'Residential street needs speed bump due to high speeds'
    },
    {
      category: 'road_damage', subcategory: 'road_cracks',
      category_ar: 'تشققات في الطريق', subcategory_ar: 'تشققات خطيرة',
      severity: 3, excavation_stage: 'not_applicable', has_safety_barriers: false,
      has_visible_license: false, blocks_traffic: false,
      responsible_entity: 'Municipality', confidence: 0.86,
      description_ar: 'تشققات واضحة في الاسفلت تحتاج صيانة عاجلة',
      description_en: 'Visible road cracks requiring urgent maintenance'
    },
    {
      category: 'debris', subcategory: 'construction_debris',
      category_ar: 'مخلفات بناء', subcategory_ar: 'أنقاض بناء في الشارع',
      severity: 3, excavation_stage: 'not_applicable', has_safety_barriers: false,
      has_visible_license: false, blocks_traffic: true,
      responsible_entity: 'Municipality', confidence: 0.89,
      description_ar: 'مخلفات بناء متراكمة على جانب الطريق',
      description_en: 'Construction debris accumulated on roadside'
    },
    {
      category: 'suggestion', subcategory: 'shading_suggestion',
      category_ar: 'اقتراح تشجير وتظليل', subcategory_ar: 'شارع يحتاج تظليل',
      severity: 1, excavation_stage: 'not_applicable', has_safety_barriers: false,
      has_visible_license: false, blocks_traffic: false,
      responsible_entity: 'Municipality_Planning', confidence: 0.80,
      description_ar: 'شارع مكشوف يحتاج تشجير وتظليل لراحة المشاة',
      description_en: 'Exposed street needs trees and shading for pedestrians'
    },
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      const random = demoResults[Math.floor(Math.random() * demoResults.length)];
      resolve(random);
    }, 2000);
  });
}

// === خريطة الجهات المسؤولة بالعربي ===
export const ENTITY_NAMES_AR = {
  'NWC': 'المياه الوطنية',
  'SEC': 'السعودية للكهرباء',
  'STC': 'STC',
  'Mobily': 'موبايلي',
  'Zain': 'زين',
  'Municipality': 'الأمانة',
  'Traffic_Dept': 'إدارة المرور',
  'RIPC': 'مركز البنية التحتية',
  'Municipality_Planning': 'تخطيط الأمانة',
  'Cleaning_Company': 'شركة النظافة',
};

// === تحويل الشدة من رقم إلى نص عربي ===
export function severityToArabic(severity) {
  if (severity >= 5) return 'حرج';
  if (severity >= 4) return 'مرتفع';
  if (severity >= 3) return 'متوسط';
  if (severity >= 2) return 'منخفض';
  return 'بسيط';
}

// === لون الشدة ===
export function severityColor(severity) {
  if (severity >= 5) return '#DC2626';
  if (severity >= 4) return '#F97316';
  if (severity >= 3) return '#EAB308';
  if (severity >= 2) return '#3B82F6';
  return '#22C55E';
}

// === تحويل الصورة إلى نص مشفر ===
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// === الدالة الرئيسية ===
export async function analyzeImage(imageFile) {
  if (isAIEnabled()) {
    const base64 = await fileToBase64(imageFile);
    return await analyzeWithOpenAI(base64);
  } else {
    return await analyzeDemo(imageFile);
  }
}

export { isAIEnabled };
