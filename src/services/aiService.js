const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

// === هل OpenAI مفعّل؟ ===
const isAIEnabled = () => {
  return OPENAI_API_KEY && OPENAI_API_KEY !== 'demo';
};

// === تحليل الصورة بـ OpenAI GPT-4V (الوضع الحقيقي) ===
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
          content: `You are a municipal infrastructure analyst. Analyze the image and respond ONLY with valid JSON:
{
  "category": "one of: pothole, water_leak, broken_light, waste, damaged_sidewalk, broken_signal, road_cracks, construction_debris",
  "category_ar": "الاسم بالعربي",
  "severity": "one of: low, medium, high, critical",
  "description_ar": "وصف المشكلة بالعربي في جملة واحدة",
  "confidence": 0.0 to 1.0
}`
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'حلل هذه الصورة وحدد نوع مشكلة البنية التحتية وشدتها' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }
      ],
      max_tokens: 300
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'خطأ في OpenAI');
  }

  const text = data.choices[0].message.content;
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
  return JSON.parse(jsonStr);
}

// === التحليل التجريبي (بدون OpenAI) ===
function analyzeDemo(imageFile) {
  const demoResults = [
    { category: 'pothole', category_ar: 'حفرة في الطريق', severity: 'high', description_ar: 'حفرة كبيرة في وسط الطريق تشكل خطرا على السيارات', confidence: 0.92 },
    { category: 'water_leak', category_ar: 'تسرب مياه', severity: 'critical', description_ar: 'تسرب مياه واضح يسبب تجمع المياه في الشارع', confidence: 0.88 },
    { category: 'broken_light', category_ar: 'إنارة معطلة', severity: 'medium', description_ar: 'عمود إنارة معطل في منطقة سكنية', confidence: 0.85 },
    { category: 'waste', category_ar: 'نفايات متراكمة', severity: 'high', description_ar: 'تراكم نفايات بالقرب من منطقة سكنية', confidence: 0.90 },
    { category: 'road_cracks', category_ar: 'تشققات في الطريق', severity: 'medium', description_ar: 'تشققات واضحة في الاسفلت تحتاج صيانة', confidence: 0.87 },
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      const random = demoResults[Math.floor(Math.random() * demoResults.length)];
      resolve(random);
    }, 2000);
  });
}

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