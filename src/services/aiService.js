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

const SYSTEM_PROMPT = `You are an AI system for "Awla", a smart municipal reporting system in Riyadh, Saudi Arabia.
Analyze this image of a street/infrastructure issue. Return ONLY valid JSON:
{
  "category": "excavation|water_leak|lighting|traffic|sidewalk|road_damage|debris|suggestion|other",
  "subcategory": "specific issue",
  "category_ar": "Arabic name",
  "subcategory_ar": "Arabic subcategory",
  "severity": 1-5,
  "excavation_stage": "new|active|abandoned|partially_filled|complete|not_applicable",
  "has_safety_barriers": true/false,
  "has_visible_license": true/false,
  "blocks_traffic": true/false,
  "responsible_entity": "NWC|SEC|STC|Mobily|Zain|Municipality|Traffic_Dept|RIPC|Municipality_Planning|Cleaning_Company",
  "confidence": 0.0-1.0,
  "description_ar": "Arabic description",
  "description_en": "English description"
}`;

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
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
        { type: 'text', text: 'حلل هذه الصورة وحدد نوع المشكلة. أجب بـ JSON فقط.' },
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
          { type: 'text', text: 'حلل هذه الصورة. أجب بـ JSON فقط.' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
        ]},
      ],
      max_tokens: 600,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'OpenAI Error');
  const text = data.choices[0].message.content;
  return JSON.parse(text.replace(/```json\n?/g, '').replace(/```/g, '').trim());
}

function analyzeDemo() {
  const demoResults = [
    { category: 'excavation', subcategory: 'delayed_excavation', category_ar: 'حفرية متأخرة', subcategory_ar: 'حفرية متأخرة عن الترخيص', severity: 4, excavation_stage: 'abandoned', has_safety_barriers: false, has_visible_license: false, blocks_traffic: true, responsible_entity: 'NWC', confidence: 0.92, description_ar: 'حفرية مهجورة بدون حواجز سلامة تسبب إعاقة للمرور', description_en: 'Abandoned excavation without safety barriers causing traffic obstruction' },
    { category: 'water_leak', subcategory: 'water_leak', category_ar: 'تسرب مياه', subcategory_ar: 'تسرب مياه مستمر', severity: 3, excavation_stage: 'not_applicable', has_safety_barriers: false, has_visible_license: false, blocks_traffic: false, responsible_entity: 'NWC', confidence: 0.9, description_ar: 'تسرب مياه مستمر يسبب تجمع المياه وتلف الأسفلت', description_en: 'Continuous water leak causing water accumulation' },
    { category: 'lighting', subcategory: 'broken_light', category_ar: 'إنارة معطلة', subcategory_ar: 'عمود إنارة معطل', severity: 2, excavation_stage: 'not_applicable', has_safety_barriers: false, has_visible_license: false, blocks_traffic: false, responsible_entity: 'Municipality', confidence: 0.85, description_ar: 'عمود إنارة معطل يشكل خطر على المشاة ليلاً', description_en: 'Broken street light endangering pedestrians at night' },
    { category: 'road_damage', subcategory: 'road_cracks', category_ar: 'تشققات في الطريق', subcategory_ar: 'تشققات خطيرة', severity: 3, excavation_stage: 'not_applicable', has_safety_barriers: false, has_visible_license: false, blocks_traffic: false, responsible_entity: 'Municipality', confidence: 0.86, description_ar: 'تشققات واضحة بحاجة لصيانة عاجلة', description_en: 'Visible cracks requiring urgent maintenance' },
    { category: 'excavation', subcategory: 'abandoned_excavation', category_ar: 'حفرية مهجورة', subcategory_ar: 'حفرية مهجورة بدون حواجز', severity: 5, excavation_stage: 'abandoned', has_safety_barriers: false, has_visible_license: false, blocks_traffic: true, responsible_entity: 'SEC', confidence: 0.88, description_ar: 'حفرية مهجورة تشكل خطر مباشر', description_en: 'Abandoned excavation posing direct danger' },
  ];
  return new Promise((resolve) => {
    setTimeout(() => resolve(demoResults[Math.floor(Math.random() * demoResults.length)]), 2000);
  });
}

export const ENTITY_NAMES_AR = {
  NWC: 'المياه الوطنية', SEC: 'السعودية للكهرباء', STC: 'STC', Mobily: 'موبايلي', Zain: 'زين',
  Municipality: 'الأمانة', Traffic_Dept: 'إدارة المرور', RIPC: 'مركز البنية التحتية',
  Municipality_Planning: 'تخطيط الأمانة', Cleaning_Company: 'شركة النظافة',
};

export function severityToArabic(s) {
  if (s >= 5) return 'حرج'; if (s >= 4) return 'مرتفع'; if (s >= 3) return 'متوسط'; if (s >= 2) return 'منخفض'; return 'بسيط';
}

export function severityColor(s) {
  if (s >= 5) return '#DC2626'; if (s >= 4) return '#F97316'; if (s >= 3) return '#EAB308'; if (s >= 2) return '#3B82F6'; return '#22C55E';
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
