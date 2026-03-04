// ============================================
// voiceService.js — خدمة التسجيل الصوتي + تحليل AI
// ============================================

const CLAUDE_API_KEY = process.env.REACT_APP_CLAUDE_API_KEY;

// ============================================
// 1. إدارة التسجيل الصوتي
// ============================================

let recognition = null;
let mediaRecorder = null;
let audioChunks = [];
let isRecordingActive = false;

const MAX_RECORDING_SECONDS = 120;

export function isVoiceSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function initSpeechRecognition({ onTranscript, onError }) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  recognition = new SpeechRecognition();
  recognition.lang = 'ar-SA';
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    let finalText = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        finalText += event.results[i][0].transcript + ' ';
      }
    }
    if (finalText && onTranscript) onTranscript(finalText);
  };

  recognition.onerror = (event) => {
    const errorMessages = {
      'not-allowed': '⛔ الميكروفون مرفوض — فعّل الإذن من إعدادات المتصفح',
      'permission-denied': '⛔ الميكروفون مرفوض — فعّل الإذن من إعدادات المتصفح',
      'no-speech': '🔇 ما سمعنا صوت — تأكد إن الميكروفون شغال وقرّب منه',
      'audio-capture': '🎤 ما قدرنا نوصل للميكروفون — تأكد إنه موصول',
      'network': '🌐 مشكلة في الاتصال — تحقق من الإنترنت',
    };
    if (onError) onError(errorMessages[event.error] || `خطأ: ${event.error}`);
    if (event.error !== 'no-speech') stopRecording();
  };

  recognition.onend = () => {
    if (isRecordingActive) {
      try { recognition.start(); } catch(e) {}
    }
  };

  return recognition;
}

export async function startRecording({ onTranscript, onError, onTimeUpdate, onMaxReached }) {
  isRecordingActive = true;
  audioChunks = [];

  // بدأ تحويل الكلام لنص
  if (recognition) {
    try { recognition.start(); } catch(e) {}
  }

  // بدأ تسجيل الصوت
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    isRecordingActive = false;
    if (onError) onError('⛔ ما قدرنا نوصل للميكروفون — اضغط السماح لما يطلب الإذن');
    return null;
  }

  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) audioChunks.push(e.data);
  };

  const audioBlobPromise = new Promise((resolve) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      stream.getTracks().forEach(t => t.stop());
      resolve(blob);
    };
  });

  mediaRecorder.start();

  // عداد + حد أقصى
  let seconds = 0;
  const timer = setInterval(() => {
    seconds++;
    if (onTimeUpdate) onTimeUpdate(seconds);
    if (seconds >= MAX_RECORDING_SECONDS) {
      clearInterval(timer);
      stopRecording();
      if (onMaxReached) onMaxReached();
    }
  }, 1000);

  return { timer, audioBlobPromise };
}

export function stopRecording() {
  isRecordingActive = false;
  if (recognition) try { recognition.stop(); } catch(e) {}
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    try { mediaRecorder.stop(); } catch(e) {}
  }
}

export function cleanup(timer) {
  isRecordingActive = false;
  if (timer) clearInterval(timer);
  if (recognition) try { recognition.stop(); } catch(e) {}
}

// ============================================
// 2. تحليل النص الصوتي بالذكاء الاصطناعي
// ============================================

const VOICE_ANALYSIS_PROMPT = `أنت نظام ذكاء اصطناعي لمنصة "أولى" للبلاغات البلدية في الرياض.
المواطن وصف مشكلة بالصوت. حلل كلامه واستخرج المعلومات.
أجب بـ JSON فقط:
{
  "understood": true/false,
  "category": "excavation|water_leak|lighting|traffic|sidewalk|road_damage|debris|suggestion|other",
  "category_ar": "اسم الفئة بالعربي",
  "severity_hint": 1-5,
  "keywords": ["كلمات مفتاحية"],
  "clean_description": "وصف مرتب ومختصر للمشكلة",
  "needs_clarification": false,
  "clarification_message": ""
}

إذا الكلام غير واضح أو ما يخص بلاغ بلدي:
{"understood": false, "needs_clarification": true, "clarification_message": "رسالة توضيحية"}`;

export async function analyzeVoiceText(voiceText) {
  // لو ما فيه مفتاح — رجّع تحليل بسيط بدون AI
  if (!CLAUDE_API_KEY || CLAUDE_API_KEY === 'demo') {
    return analyzeFallback(voiceText);
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-3-5-20241022',
        max_tokens: 400,
        system: VOICE_ANALYSIS_PROMPT,
        messages: [{ role: 'user', content: `النص الصوتي من المواطن:\n"${voiceText}"` }],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'API Error');

    const text = data.content.find(b => b.type === 'text')?.text;
    if (!text) throw new Error('لا يوجد رد');

    return JSON.parse(text.replace(/```json\n?/g, '').replace(/```/g, '').trim());
  } catch (err) {
    console.warn('[VoiceService] AI analysis failed:', err.message);
    return analyzeFallback(voiceText);
  }
}

// ============================================
// 3. تحليل بسيط (بدون AI)
// ============================================

function analyzeFallback(text) {
  const lower = text.toLowerCase();
  const keywords = {
    excavation: ['حفرية', 'حفر', 'حفريات', 'حفرة', 'مهجورة'],
    water_leak: ['مياه', 'تسرب', 'ماء', 'مجاري', 'بالوعة'],
    lighting: ['إنارة', 'انارة', 'عمود', 'نور', 'ظلام', 'مظلم'],
    traffic: ['مرور', 'إشارة', 'اشارة', 'يوتيرن', 'مطب', 'سرعة'],
    road_damage: ['شارع', 'طريق', 'تشقق', 'أسفلت', 'حفرة في الشارع'],
    sidewalk: ['رصيف', 'ممشى', 'مشاة'],
  };

  const categoryNames = {
    excavation: 'حفرية', water_leak: 'تسرب مياه', lighting: 'إنارة معطلة',
    traffic: 'مشكلة مرورية', road_damage: 'تلف في الطريق', sidewalk: 'مشكلة في الرصيف',
  };

  let bestCategory = 'other';
  let maxScore = 0;

  for (const [cat, words] of Object.entries(keywords)) {
    const score = words.filter(w => lower.includes(w)).length;
    if (score > maxScore) { maxScore = score; bestCategory = cat; }
  }

  if (maxScore === 0) {
    return {
      understood: false,
      needs_clarification: true,
      clarification_message: 'ما قدرنا نحدد نوع المشكلة — حاول وصفها بشكل أوضح',
    };
  }

  return {
    understood: true,
    category: bestCategory,
    category_ar: categoryNames[bestCategory] || 'أخرى',
    severity_hint: Math.min(maxScore + 2, 5),
    keywords: text.split(' ').filter(w => w.length > 2).slice(0, 5),
    clean_description: text.trim(),
    needs_clarification: false,
  };
}

// ============================================
// 4. دمج تحليل الصوت مع تحليل الصورة
// ============================================

export function mergeVoiceWithImageAnalysis(imageResult, voiceResult) {
  if (!voiceResult || !voiceResult.understood) return imageResult;

  return {
    ...imageResult,
    // لو تحليل الصورة ما كان واثق، استخدم الصوت
    category: imageResult.confidence < 0.6 ? voiceResult.category : imageResult.category,
    category_ar: imageResult.confidence < 0.6 ? voiceResult.category_ar : imageResult.category_ar,
    // ادمج الوصف
    description_ar: imageResult.description_ar
      ? `${imageResult.description_ar} | وصف المواطن: ${voiceResult.clean_description}`
      : voiceResult.clean_description,
    // رفّع الشدة لو الصوت يقترح أعلى
    severity: Math.max(imageResult.severity, voiceResult.severity_hint || 0),
    // أضف علامة إن فيه صوت
    has_voice_description: true,
    voice_keywords: voiceResult.keywords,
  };
}

export { MAX_RECORDING_SECONDS };