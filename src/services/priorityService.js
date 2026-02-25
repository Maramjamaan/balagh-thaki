import { findNearestArea } from '../data/riyadhAreas';

// === أوزان عوامل الأولوية ===
const WEIGHTS = {
  severity: 0.35,      // شدة المشكلة (35%)
  population: 0.25,    // الكثافة السكانية (25%)
  traffic: 0.20,       // حركة المرور (20%)
  frequency: 0.20      // تكرار البلاغات (20%)
};

// === تحويل مستوى الشدة إلى رقم ===
function severityToScore(severity) {
  const scores = {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25
  };
  return scores[severity] || 50;
}

// === تحويل عدد السكان إلى سكور (0-100) ===
function populationToScore(population) {
  // أعلى حي ~95,000 نسمة
  const maxPop = 100000;
  return Math.min(Math.round((population / maxPop) * 100), 100);
}

// === حساب سكور التكرار ===
// كل ما زادت البلاغات في نفس الحي ونفس النوع، زادت الأولوية
function frequencyToScore(reportCount) {
  if (reportCount >= 10) return 100;
  if (reportCount >= 7) return 85;
  if (reportCount >= 5) return 70;
  if (reportCount >= 3) return 50;
  if (reportCount >= 2) return 30;
  return 10;
}

// === حساب الأولوية النهائية ===
export function calculatePriority({ severity, latitude, longitude, reportCount = 1 }) {
  // 1. سكور الشدة
  const severityScore = severityToScore(severity);

  // 2. البحث عن الحي الأقرب
  const area = findNearestArea(latitude, longitude);

  // 3. سكور السكان
  const populationScore = area ? populationToScore(area.population) : 50;

  // 4. سكور المرور
  const trafficScore = area ? area.traffic : 50;

  // 5. سكور التكرار
  const frequencyScore = frequencyToScore(reportCount);

  // 6. حساب السكور النهائي
  const finalScore = Math.round(
    (severityScore * WEIGHTS.severity) +
    (populationScore * WEIGHTS.population) +
    (trafficScore * WEIGHTS.traffic) +
    (frequencyScore * WEIGHTS.frequency)
  );

  return {
    score: Math.min(finalScore, 100),
    level: getLevel(finalScore),
    breakdown: {
      severity: { value: severity, score: severityScore, weight: '35%' },
      population: { area: area?.name || 'غير محدد', score: populationScore, weight: '25%' },
      traffic: { score: trafficScore, weight: '20%' },
      frequency: { count: reportCount, score: frequencyScore, weight: '20%' }
    }
  };
}

// === تحديد مستوى الأولوية ===
function getLevel(score) {
  if (score >= 80) return { label: 'حرج', color: '#DC2626' };
  if (score >= 60) return { label: 'مرتفع', color: '#F97316' };
  if (score >= 40) return { label: 'متوسط', color: '#EAB308' };
  return { label: 'منخفض', color: '#22C55E' };
}