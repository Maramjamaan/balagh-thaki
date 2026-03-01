// =============================================
// خدمة الذكاء الاصطناعي — أولى | Awla
// يدعم: Claude API (Anthropic) + OpenAI + Demo Mode
// =============================================

// === المفاتيح من ملف .env ===
const CLAUDE_API_KEY = process.env.REACT_APP_CLAUDE_API_KEY;
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const AI_PROVIDER = process.env.REACT_APP_AI_PROVIDER || 'auto'; // 'claude' | 'openai' | 'demo' | 'auto'

// === تحديد المزود النشط ===
function getActiveProvider() {
  if (AI_PROVIDER === 'claude' && CLAUDE_API_KEY) return 'claude';
  if (AI_PROVIDER === 'openai' && OPENAI_API_KEY) return 'openai';
  if (AI_PROVIDER === 'demo') return 'demo';

  // Auto mode: try Claude first, then OpenAI, then Demo
  if (AI_PROVIDER === 'auto') {
    if (CLAUDE_API_KEY && CLAUDE_API_KEY !== 'demo') return 'claude';
    if (OPENAI_API_KEY && OPENAI_API_KEY !== 'demo') return 'openai';
  }

  return 'demo';
}

// === هل الذكاء الاصطناعي مفعّل؟ ===
const isAIEnabled = () => {
  return getActiveProvider() !== 'demo';
};

// === الحصول على اسم المزود للعرض ===
export function getProviderName() {
  const provider = getActiveProvider();
  if (provider === 'claude') return 'Claude AI (Anthropic)';
  if (provider === 'openai') return 'OpenAI GPT-4o';
  return 'Demo Mode (محاكاة)';
}

// === البرومبت المشترك لجميع المزودين ===
const SYSTEM_PROMPT = `You are an AI system for "Awla" (أولى), a smart municipal reporting system in Riyadh, Saudi Arabia.
Analyze this image of a street/infrastructure issue. Return ONLY valid JSON with no extra text:
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
  "description_ar": "وصف المشكلة بالعربي في جملتين",
  "description_en": "English description in 2 sentences"
}

Categories guide:
- excavation: حفريات (متأخرة، مهجورة، بعد السفلتة، بدون ترخيص)
- water_leak: تسرب مياه
- lighting: إنارة معطلة أو ضعيفة
- traffic: مشاكل مرورية (يوتيرن، إشارات، مطبات)
- sidewalk: أرصفة تالفة
- road_damage: تشققات أو حفر في الطريق
- debris: مخلفات بناء أو نفايات
- suggestion: اقتراحات تحسين

Entity routing:
- NWC = المياه الوطنية (water issues, water excavations)
- SEC = السعودية للكهرباء (electrical, power lines)
- STC/Mobily/Zain = اتصالات (telecom excavations, fiber)
- Municipality = الأمانة (roads, sidewalks, lighting, debris)
- Traffic_Dept = المرور (signals, u-turns, speed bumps)
- RIPC = مركز البنية التحتية (infrastructure coordination)
- Municipality_Planning = تخطيط الأمانة (suggestions, shading)
- Cleaning_Company = شركة النظافة (waste, debris)`;

// === تحويل الصورة إلى Base64 ===
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

// === تحديد نوع الصورة ===
function getMediaType(file) {
  const type = file.type;
  if (type === 'image/png') return 'image/png';
  if (type === 'image/gif') return 'image/gif';
  if (type === 'image/webp') return 'image/webp';
  return 'image/jpeg'; // default
}

// =============================================
// 1. Claude API (Anthropic) — المزود الأساسي
// =============================================
async function analyzeWithClaude(imageBase64, mediaType = 'image/jpeg') {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: 'حلل هذه الصورة وحدد نوع مشكلة البنية التحتية وشدتها والجهة المسؤولة. أجب بـ JSON فقط.',
            },
          ],
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errMsg = data.error?.message || JSON.stringify(data);
    throw new Error(`Claude API Error: ${errMsg}`);
  }

  // Claude returns content as array of blocks
  const textBlock = data.content.find((block) => block.type === 'text');
  if (!textBlock) {
    throw new Error('لم يتم العثور على رد نصي من Claude');
  }

  const text = textBlock.text;
  // Clean any markdown fences just in case
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(jsonStr);
  } catch (parseErr) {
    console.error('Claude raw response:', text);
    throw new Error('فشل تحليل رد الذكاء الاصطناعي — الرجاء المحاولة مرة أخرى');
  }
}

// =============================================
// 2. OpenAI API — المزود البديل
// =============================================
async function analyzeWithOpenAI(imageBase64) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'حلل هذه الصورة وحدد نوع مشكلة البنية التحتية وشدتها والجهة المسؤولة. أجب بـ JSON فقط.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 600,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'خطأ في OpenAI');
  }

  const text = data.choices[0].message.content;
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
  return JSON.parse(jsonStr);
}

// =============================================
// 3. Demo Mode — وضع العرض التجريبي
// =============================================
function analyzeDemo(imageFile) {
  const demoResults = [
    {
      category: 'excavation',
      subcategory: 'delayed_excavation',
      category_ar: 'حفرية متأخرة عن الترخيص',
      subcategory_ar: 'حفرية متأخرة',
      severity: 4,
      excavation_stage: 'abandoned',
      has_safety_barriers: false,
      has_visible_license: false,
      blocks_traffic: true,
      responsible_entity: 'NWC',
      confidence: 0.92,
      description_ar: 'حفرية مهجورة متأخرة عن موعد الترخيص بدون حواجز سلامة وتسبب إعاقة للمرور',
      description_en: 'Abandoned excavation past license deadline with no safety barriers causing traffic obstruction',
    },
    {
      category: 'excavation',
      subcategory: 'abandoned_excavation',
      category_ar: 'حفرية مهجورة',
      subcategory_ar: 'حفرية مهجورة بدون حواجز',
      severity: 5,
      excavation_stage: 'abandoned',
      has_safety_barriers: false,
      has_visible_license: false,
      blocks_traffic: true,
      responsible_entity: 'SEC',
      confidence: 0.88,
      description_ar: 'حفرية مهجورة بدون حواجز سلامة تشكل خطر مباشر على المارة والسيارات',
      description_en: 'Abandoned excavation without safety barriers posing direct danger to pedestrians and vehicles',
    },
    {
      category: 'excavation',
      subcategory: 'post_paving_dig',
      category_ar: 'حفر بعد السفلتة',
      subcategory_ar: 'شارع اتسفلت ورجعوا حفروه',
      severity: 4,
      excavation_stage: 'active',
      has_safety_barriers: true,
      has_visible_license: true,
      blocks_traffic: true,
      responsible_entity: 'STC',
      confidence: 0.85,
      description_ar: 'شارع تم سفلتته حديثاً ثم أعيد حفره لأعمال اتصالات مما يسبب هدر في الميزانية',
      description_en: 'Recently paved street re-excavated for telecom work causing budget waste',
    },
    {
      category: 'water_leak',
      subcategory: 'water_leak',
      category_ar: 'تسرب مياه',
      subcategory_ar: 'تسرب مياه مستمر',
      severity: 3,
      excavation_stage: 'not_applicable',
      has_safety_barriers: false,
      has_visible_license: false,
      blocks_traffic: false,
      responsible_entity: 'NWC',
      confidence: 0.9,
      description_ar: 'تسرب مياه مستمر يسبب تجمع المياه في الشارع وتلف الأسفلت المحيط',
      description_en: 'Continuous water leak causing water accumulation and surrounding asphalt damage',
    },
    {
      category: 'lighting',
      subcategory: 'broken_light',
      category_ar: 'إنارة معطلة',
      subcategory_ar: 'عمود إنارة معطل',
      severity: 2,
      excavation_stage: 'not_applicable',
      has_safety_barriers: false,
      has_visible_license: false,
      blocks_traffic: false,
      responsible_entity: 'Municipality',
      confidence: 0.85,
      description_ar: 'عمود إنارة معطل في منطقة سكنية يشكل خطر على سلامة المشاة ليلاً',
      description_en: 'Broken street light in residential area endangering pedestrian safety at night',
    },
    {
      category: 'traffic',
      subcategory: 'uturn_request',
      category_ar: 'طلب فتح يوتيرن',
      subcategory_ar: 'يوتيرن مغلق بدون بدائل',
      severity: 3,
      excavation_stage: 'not_applicable',
      has_safety_barriers: false,
      has_visible_license: false,
      blocks_traffic: false,
      responsible_entity: 'Traffic_Dept',
      confidence: 0.87,
      description_ar: 'يوتيرن مغلق يسبب تحويلة طويلة للسكان وازدحام في الشوارع الفرعية',
      description_en: 'Closed U-turn causing long detour for residents and congestion on side streets',
    },
    {
      category: 'road_damage',
      subcategory: 'road_cracks',
      category_ar: 'تشققات في الطريق',
      subcategory_ar: 'تشققات خطيرة في الأسفلت',
      severity: 3,
      excavation_stage: 'not_applicable',
      has_safety_barriers: false,
      has_visible_license: false,
      blocks_traffic: false,
      responsible_entity: 'Municipality',
      confidence: 0.86,
      description_ar: 'تشققات واضحة في الأسفلت بحاجة لصيانة عاجلة قبل تفاقم المشكلة',
      description_en: 'Visible asphalt cracks requiring urgent maintenance before further deterioration',
    },
    {
      category: 'debris',
      subcategory: 'construction_debris',
      category_ar: 'مخلفات بناء',
      subcategory_ar: 'أنقاض بناء في الشارع',
      severity: 3,
      excavation_stage: 'not_applicable',
      has_safety_barriers: false,
      has_visible_license: false,
      blocks_traffic: true,
      responsible_entity: 'Cleaning_Company',
      confidence: 0.89,
      description_ar: 'مخلفات بناء متراكمة على جانب الطريق تعيق حركة المشاة والسيارات',
      description_en: 'Construction debris accumulated on roadside obstructing pedestrians and vehicles',
    },
    {
      category: 'suggestion',
      subcategory: 'shading_suggestion',
      category_ar: 'اقتراح تشجير وتظليل',
      subcategory_ar: 'شارع يحتاج تظليل وتشجير',
      severity: 1,
      excavation_stage: 'not_applicable',
      has_safety_barriers: false,
      has_visible_license: false,
      blocks_traffic: false,
      responsible_entity: 'Municipality_Planning',
      confidence: 0.8,
      description_ar: 'شارع مكشوف يحتاج تشجير وتظليل لراحة المشاة خاصة في فصل الصيف',
      description_en: 'Exposed street needs trees and shading for pedestrian comfort especially in summer',
    },
    {
      category: 'traffic',
      subcategory: 'speed_bump_request',
      category_ar: 'طلب مطب صناعي',
      subcategory_ar: 'شارع سكني بدون مطبات',
      severity: 3,
      excavation_stage: 'not_applicable',
      has_safety_barriers: false,
      has_visible_license: false,
      blocks_traffic: false,
      responsible_entity: 'Municipality',
      confidence: 0.83,
      description_ar: 'شارع سكني بدون مطبات صناعية وسرعة السيارات تشكل خطر على الأطفال',
      description_en: 'Residential street without speed bumps where vehicle speeds endanger children',
    },
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      const random = demoResults[Math.floor(Math.random() * demoResults.length)];
      resolve(random);
    }, 2000);
  });
}

// =============================================
// خريطة الجهات المسؤولة بالعربي
// =============================================
export const ENTITY_NAMES_AR = {
  NWC: 'المياه الوطنية',
  SEC: 'السعودية للكهرباء',
  STC: 'STC',
  Mobily: 'موبايلي',
  Zain: 'زين',
  Municipality: 'الأمانة',
  Traffic_Dept: 'إدارة المرور',
  RIPC: 'مركز البنية التحتية',
  Municipality_Planning: 'تخطيط الأمانة',
  Cleaning_Company: 'شركة النظافة',
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

// =============================================
// الدالة الرئيسية — تحليل الصورة
// =============================================
export async function analyzeImage(imageFile) {
  const provider = getActiveProvider();
  console.log(`[Awla AI] Using provider: ${provider}`);

  if (provider === 'demo') {
    return await analyzeDemo(imageFile);
  }

  const base64 = await fileToBase64(imageFile);
  const mediaType = getMediaType(imageFile);

  // Try primary provider, fall back to secondary
  if (provider === 'claude') {
    try {
      return await analyzeWithClaude(base64, mediaType);
    } catch (err) {
      console.warn('[Awla AI] Claude failed, trying OpenAI fallback:', err.message);
      if (OPENAI_API_KEY && OPENAI_API_KEY !== 'demo') {
        try {
          return await analyzeWithOpenAI(base64);
        } catch (err2) {
          console.warn('[Awla AI] OpenAI fallback also failed:', err2.message);
        }
      }
      // Final fallback to demo
      console.warn('[Awla AI] All providers failed, using demo mode');
      return await analyzeDemo(imageFile);
    }
  }

  if (provider === 'openai') {
    try {
      return await analyzeWithOpenAI(base64);
    } catch (err) {
      console.warn('[Awla AI] OpenAI failed, trying Claude fallback:', err.message);
      if (CLAUDE_API_KEY && CLAUDE_API_KEY !== 'demo') {
        try {
          return await analyzeWithClaude(base64, mediaType);
        } catch (err2) {
          console.warn('[Awla AI] Claude fallback also failed:', err2.message);
        }
      }
      console.warn('[Awla AI] All providers failed, using demo mode');
      return await analyzeDemo(imageFile);
    }
  }

  return await analyzeDemo(imageFile);
}

export { isAIEnabled };