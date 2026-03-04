const CLAUDE_API_KEY = process.env.REACT_APP_CLAUDE_API_KEY;
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const AI_PROVIDER = process.env.REACT_APP_AI_PROVIDER || 'auto';

function getActiveProvider() {
  if (AI_PROVIDER === 'claude' && CLAUDE_API_KEY) return 'claude';
  if (AI_PROVIDER === 'openai' && OPENAI_API_KEY) return 'openai';
  if (AI_PROVIDER === 'demo') return 'demo';
  if (AI_PROVIDER === 'auto') {
    if (CLAUDE_API_KEY && CLAUDE_API_KEY !== 'demo') return 'claude';
    if (OPENAI_API_KEY && OPENAI_API_KEY !== 'demo') return 'openai';
  }
  return 'demo';
}

const isAIEnabled = () => getActiveProvider() !== 'demo';

export function getProviderName() {
  const p = getActiveProvider();
  if (p === 'claude') return 'Claude AI (Anthropic)';
  if (p === 'openai') return 'OpenAI GPT-4o';
  return 'Demo Mode (محاكاة)';
}

const SYSTEM_PROMPT = `You are an AI system for "Awla" (أولى), a smart excavation monitoring system in Riyadh, Saudi Arabia.
Your ONLY job is analyzing street excavation images. Riyadh issues 106,000+ excavation permits yearly, and 30%+ are delayed.

Analyze this excavation image and return ONLY valid JSON:
{
  "category": "delayed_excavation|abandoned_excavation|post_paving_dig|no_license_visible|no_safety_barriers|active_excavation",
  "category_ar": "Arabic category name",
  "subcategory": "specific issue type",
  "subcategory_ar": "Arabic subcategory",
  "severity": 1-5,
  "excavation_stage": "new|active|abandoned|partially_filled|complete",
  "estimated_age_days": estimated days since excavation started (integer),
  "has_safety_barriers": true/false,
  "has_visible_license": true/false,
  "blocks_traffic": true/false,
  "road_condition": "intact|cracked|broken|destroyed",
  "responsible_entity": "NWC|SEC|STC|Mobily|Zain|Municipality|Unknown",
  "confidence": 0.0-1.0,
  "description_ar": "Arabic description focusing on excavation status, safety risks, and estimated delay",
  "description_en": "English description",
  "license_status_estimate": "likely_within_permit|likely_expired|clearly_expired|unknown",
  "safety_risk_level": "low|medium|high|critical"
}

Category guidelines:
- delayed_excavation: حفرية متأخرة — excavation that appears older than expected, partially filled, stagnant
- abandoned_excavation: حفرية مهجورة — no workers, no equipment, no safety barriers, looks neglected
- post_paving_dig: حفر بعد السفلتة — fresh dig on recently paved road (you can see new asphalt cut)
- no_license_visible: بدون ترخيص ظاهر — no permit sign visible near excavation
- no_safety_barriers: بدون حواجز سلامة — excavation without proper barriers/cones/tape
- active_excavation: حفرية نشطة — workers present, equipment visible, active work

Severity guide for excavations:
5 = Abandoned + no barriers + blocks traffic + near school/hospital
4 = Abandoned or very delayed + partial barriers + affects traffic
3 = Delayed + has some barriers + minor traffic impact
2 = Active but missing license sign or partial barriers
1 = Active with proper barriers and signage

Responsible entity clues:
- Blue pipes/water = NWC (المياه الوطنية)
- Electrical cables/boxes = SEC (السعودية للكهرباء)
- Fiber optic/orange tubes = STC or Mobily or Zain
- Road/sidewalk work = Municipality (الأمانة)
- If unclear = Unknown`;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getMediaType(file) {
  if (file.type === 'image/png') return 'image/png';
  if (file.type === 'image/gif') return 'image/gif';
  if (file.type === 'image/webp') return 'image/webp';
  return 'image/jpeg';
}

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
      max_tokens: 700,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
        { type: 'text', text: 'حلل هذه الصورة. حدد نوع الحفرية ومرحلتها وعمرها التقديري والجهة المسؤولة. أجب بـ JSON فقط.' },
      ]}],
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || JSON.stringify(data));
  const textBlock = data.content.find(b => b.type === 'text');
  if (!textBlock) throw new Error('لم يتم العثور على رد');
  const jsonStr = textBlock.text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
  return JSON.parse(jsonStr);
}

async function analyzeWithOpenAI(imageBase64) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: [
          { type: 'text', text: 'حلل هذه الصورة. حدد نوع الحفرية ومرحلتها وعمرها التقديري. أجب بـ JSON فقط.' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
        ]},
      ],
      max_tokens: 700,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'OpenAI Error');
  const text = data.choices[0].message.content;
  return JSON.parse(text.replace(/```json\n?/g, '').replace(/```/g, '').trim());
}

function analyzeDemo() {
  const demoResults = [
    {
      category: 'delayed_excavation', subcategory: 'delayed_permit', category_ar: 'حفرية متأخرة عن الترخيص', subcategory_ar: 'تجاوزت مدة الترخيص المحددة',
      severity: 4, excavation_stage: 'partially_filled', estimated_age_days: 45, has_safety_barriers: false, has_visible_license: false,
      blocks_traffic: true, road_condition: 'broken', responsible_entity: 'NWC', confidence: 0.91,
      description_ar: 'حفرية متأخرة عن مدة الترخيص بأكثر من 15 يوم — مردومة جزئياً بدون حواجز سلامة وتعيق حركة المرور. يُقدّر عمرها بـ 45 يوم مقابل ترخيص 30 يوم.',
      description_en: 'Excavation exceeded permit duration by 15+ days — partially filled without safety barriers, blocking traffic.',
      license_status_estimate: 'likely_expired', safety_risk_level: 'high',
    },
    {
      category: 'abandoned_excavation', subcategory: 'abandoned_no_barriers', category_ar: 'حفرية مهجورة بدون حواجز', subcategory_ar: 'حفرية مهجورة تشكل خطر مباشر',
      severity: 5, excavation_stage: 'abandoned', estimated_age_days: 90, has_safety_barriers: false, has_visible_license: false,
      blocks_traffic: true, road_condition: 'destroyed', responsible_entity: 'SEC', confidence: 0.88,
      description_ar: 'حفرية مهجورة تماماً — لا عمال ولا معدات ولا حواجز. تشكل خطر مباشر على السيارات والمشاة. يُقدّر عمرها بأكثر من 90 يوم.',
      description_en: 'Completely abandoned excavation — no workers, equipment, or barriers. Direct safety hazard.',
      license_status_estimate: 'clearly_expired', safety_risk_level: 'critical',
    },
    {
      category: 'post_paving_dig', subcategory: 'dig_after_pave', category_ar: 'حفر بعد السفلتة', subcategory_ar: 'إعادة حفر شارع مُسفلت حديثاً',
      severity: 4, excavation_stage: 'active', estimated_age_days: 5, has_safety_barriers: true, has_visible_license: true,
      blocks_traffic: true, road_condition: 'broken', responsible_entity: 'STC', confidence: 0.93,
      description_ar: 'حفر جديد في شارع مُسفلت حديثاً — واضح من لون الأسفلت الجديد المقطوع. تكرار الحفر يدل على غياب التنسيق بين الجهات.',
      description_en: 'Fresh excavation on recently paved road — indicates lack of coordination between utility companies.',
      license_status_estimate: 'likely_within_permit', safety_risk_level: 'medium',
    },
    {
      category: 'no_safety_barriers', subcategory: 'missing_barriers', category_ar: 'حفرية بدون حواجز سلامة', subcategory_ar: 'حفرية مكشوفة بدون أي تحذير',
      severity: 5, excavation_stage: 'active', estimated_age_days: 10, has_safety_barriers: false, has_visible_license: false,
      blocks_traffic: false, road_condition: 'broken', responsible_entity: 'NWC', confidence: 0.86,
      description_ar: 'حفرية مكشوفة على الرصيف بدون أي حواجز أو شريط تحذيري — خطر مباشر على المشاة خصوصاً ليلاً.',
      description_en: 'Open excavation on sidewalk without any barriers or warning tape — direct pedestrian hazard.',
      license_status_estimate: 'unknown', safety_risk_level: 'critical',
    },
    {
      category: 'delayed_excavation', subcategory: 'stagnant_work', category_ar: 'حفرية متوقفة العمل', subcategory_ar: 'أعمال متوقفة منذ فترة',
      severity: 3, excavation_stage: 'abandoned', estimated_age_days: 30, has_safety_barriers: true, has_visible_license: true,
      blocks_traffic: false, road_condition: 'cracked', responsible_entity: 'Mobily', confidence: 0.84,
      description_ar: 'حفرية فيها حواجز لكن العمل متوقف — لا يوجد عمال أو معدات منذ فترة. الحواجز بدأت تتهالك.',
      description_en: 'Excavation has barriers but work appears stagnant — no workers or equipment visible for extended period.',
      license_status_estimate: 'likely_expired', safety_risk_level: 'medium',
    },
  ];
  return new Promise((resolve) => {
    setTimeout(() => resolve(demoResults[Math.floor(Math.random() * demoResults.length)]), 2000);
  });
}

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
  Unknown: 'غير محددة',
};

export const LICENSE_STATUS_AR = {
  likely_within_permit: 'ضمن مدة الترخيص',
  likely_expired: 'يُحتمل تجاوز المدة',
  clearly_expired: 'منتهية الصلاحية',
  unknown: 'غير محدد',
};

export const SAFETY_RISK_AR = {
  low: 'منخفض',
  medium: 'متوسط',
  high: 'مرتفع',
  critical: 'حرج',
};

export const SAFETY_RISK_COLOR = {
  low: '#22C55E',
  medium: '#EAB308',
  high: '#F97316',
  critical: '#DC2626',
};

export function severityToArabic(s) {
  if (s >= 5) return 'حرج'; if (s >= 4) return 'مرتفع'; if (s >= 3) return 'متوسط'; if (s >= 2) return 'منخفض'; return 'بسيط';
}

export function severityColor(s) {
  if (s >= 5) return '#DC2626'; if (s >= 4) return '#F97316'; if (s >= 3) return '#EAB308'; if (s >= 2) return '#3B82F6'; return '#22C55E';
}

export function stageToArabic(stage) {
  const map = { new: 'جديدة', active: 'نشطة', abandoned: 'مهجورة', partially_filled: 'مردومة جزئياً', complete: 'مكتملة' };
  return map[stage] || stage;
}

export async function analyzeImage(imageFile) {
  const provider = getActiveProvider();
  console.log(`[Awla AI] Using: ${provider}`);
  if (provider === 'demo') return await analyzeDemo();
  const base64 = await fileToBase64(imageFile);
  const mediaType = getMediaType(imageFile);
  if (provider === 'claude') {
    try { return await analyzeWithClaude(base64, mediaType); }
    catch (err) {
      console.warn('[Awla AI] Claude failed:', err.message);
      if (OPENAI_API_KEY) { try { return await analyzeWithOpenAI(base64); } catch(e) {} }
      return await analyzeDemo();
    }
  }
  if (provider === 'openai') {
    try { return await analyzeWithOpenAI(base64); }
    catch (err) {
      console.warn('[Awla AI] OpenAI failed:', err.message);
      if (CLAUDE_API_KEY) { try { return await analyzeWithClaude(base64, mediaType); } catch(e) {} }
      return await analyzeDemo();
    }
  }
  return await analyzeDemo();
}

export { isAIEnabled };
