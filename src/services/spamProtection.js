// ============================================
// spamProtection.js — منع التكرار والسبام
// ============================================

const STORAGE_KEY = 'awla_submissions';
const COOLDOWN_MINUTES = 5;        // ما يقدر يرسل بلاغين بأقل من 5 دقائق
const MAX_PER_HOUR = 5;            // أقصى 5 بلاغات بالساعة
const SIMILAR_RADIUS_METERS = 100; // لو نفس الموقع بنطاق 100 متر ونفس الفئة = مكرر
const RETENTION_DAYS = 7;          // نحتفظ بالسجل أسبوع

// ============================================
// 1. حفظ وقراءة السجل
// ============================================

function getSubmissions() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const submissions = JSON.parse(data);
    // نظّف اللي أقدم من أسبوع
    const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
    const cleaned = submissions.filter(s => s.timestamp > cutoff);
    // لو فيه قديم انحذف، حدّث التخزين
    if (cleaned.length !== submissions.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

function saveSubmission(submission) {
  try {
    const submissions = getSubmissions();
    submissions.push({
      timestamp: Date.now(),
      latitude: submission.latitude,
      longitude: submission.longitude,
      category: submission.category,
      reportId: submission.reportId,
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
  } catch (err) {
    console.warn('Failed to save submission record:', err);
  }
}

// ============================================
// 2. حساب المسافة بين نقطتين (بالمتر)
// ============================================

function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ============================================
// 3. فحص قبل الإرسال
// ============================================

export function checkCanSubmit(latitude, longitude, category) {
  const submissions = getSubmissions();

  if (submissions.length === 0) {
    return { allowed: true };
  }

  // فحص 1: الكولداون (5 دقائق بين كل بلاغ)
  const lastSubmission = submissions[submissions.length - 1];
  const minutesSinceLast = (Date.now() - lastSubmission.timestamp) / 60000;

  if (minutesSinceLast < COOLDOWN_MINUTES) {
    const remainingSeconds = Math.ceil((COOLDOWN_MINUTES - minutesSinceLast) * 60);
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    return {
      allowed: false,
      reason: 'cooldown',
      message: `⏳ انتظر ${mins > 0 ? mins + ' دقيقة و' : ''}${secs} ثانية قبل رفع بلاغ جديد`,
    };
  }

  // فحص 2: الحد بالساعة (5 بلاغات)
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const recentCount = submissions.filter(s => s.timestamp > oneHourAgo).length;

  if (recentCount >= MAX_PER_HOUR) {
    return {
      allowed: false,
      reason: 'rate_limit',
      message: `🚫 وصلت الحد الأقصى (${MAX_PER_HOUR} بلاغات بالساعة) — جرب بعد شوي`,
    };
  }

  // فحص 3: بلاغ مشابه (نفس الموقع + نفس الفئة خلال أسبوع)
  if (latitude && longitude && category) {
    const duplicateSubmission = submissions.find(s => {
      if (!s.latitude || !s.longitude) return false;
      const distance = distanceMeters(latitude, longitude, s.latitude, s.longitude);
      return distance < SIMILAR_RADIUS_METERS && s.category === category;
    });

    if (duplicateSubmission) {
      return {
        allowed: false,
        reason: 'duplicate',
        message: '📍 سبق ورفعت بلاغ مشابه لنفس الموقع — البلاغ مسجل ويتم متابعته',
      };
    }
  }

  return { allowed: true };
}

// ============================================
// 4. تسجيل البلاغ بعد النجاح
// ============================================

export function recordSubmission({ latitude, longitude, category, reportId }) {
  saveSubmission({ latitude, longitude, category, reportId });
}