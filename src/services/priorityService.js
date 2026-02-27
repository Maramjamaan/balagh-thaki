import { findNearestArea } from '../data/riyadhAreas';

// =============================================
// نظام الأولوية الذكية — مطابق للمستند التقني
// المجموع من 100 نقطة + بونص 10 للحفريات المتأخرة
// =============================================

// === 1. شدة المشكلة (حد أقصى 25 نقطة) ===
// الشدة من 1 إلى 5 × 5 = من 5 إلى 25
function calcSeverity(severity) {
  return severity * 5;
}

// === 2. الكثافة السكانية (حد أقصى 20 نقطة) ===
function calcPopulation(population) {
  const maxDensity = 100000;
  return Math.min((population / maxDensity) * 20, 20);
}

// === 3. حركة المرور (حد أقصى 20 نقطة) ===
function calcTraffic(trafficScore) {
  // بيانات المرور في riyadhAreas من 0 إلى 100
  // نحولها لحد أقصى 20
  return Math.min((trafficScore / 100) * 20, 20);
}

// === 4. تكرار البلاغات (حد أقصى 15 نقطة) ===
// كل بلاغ = 3 نقاط
function calcFrequency(reportCount) {
  return Math.min(reportCount * 3, 15);
}

// === 5. مدة المشكلة بدون حل (حد أقصى 10 نقاط) ===
// كل يومين = نقطة
function calcAge(daysOpen) {
  return Math.min(daysOpen * 0.5, 10);
}

// === 6. قرب من مدارس/مستشفيات (حد أقصى 10 نقاط) ===
// كل موقع حساس = 2.5 نقطة
function calcProximity(nearbyCount) {
  return Math.min(nearbyCount * 2.5, 10);
}

// === حساب الأولوية النهائية ===
export function calculatePriority({
  severity,
  latitude,
  longitude,
  reportCount = 1,
  daysOpen = 0,
  nearbySchoolsHospitals = 1,
  licenseExpired = false,
  delayDays = 0
}) {
  // البحث عن الحي الأقرب
  const area = findNearestArea(latitude, longitude);

  // حساب كل عامل
  const severityPoints = calcSeverity(severity);
  const populationPoints = calcPopulation(area ? area.population : 50000);
  const trafficPoints = calcTraffic(area ? area.traffic : 50);
  const frequencyPoints = calcFrequency(reportCount);
  const agePoints = calcAge(daysOpen);
  const proximityPoints = calcProximity(nearbySchoolsHospitals);

  // المجموع الأساسي من 100
  let totalScore =
    severityPoints +
    populationPoints +
    trafficPoints +
    frequencyPoints +
    agePoints +
    proximityPoints;

  // بونص: حفرية متأخرة عن الترخيص (حد أقصى 10 إضافية)
  let licenseBonus = 0;
  if (licenseExpired && delayDays > 0) {
    licenseBonus = Math.min(delayDays * 0.5, 10);
    totalScore += licenseBonus;
  }

  const finalScore = Math.min(Math.round(totalScore), 100);

  return {
    score: finalScore,
    level: getLevel(finalScore),
    breakdown: {
      severity: {
        value: severity,
        points: Math.round(severityPoints * 10) / 10,
        max: 25,
        weight: '25%'
      },
      population: {
        area: area?.name || 'غير محدد',
        points: Math.round(populationPoints * 10) / 10,
        max: 20,
        weight: '20%'
      },
      traffic: {
        points: Math.round(trafficPoints * 10) / 10,
        max: 20,
        weight: '20%'
      },
      frequency: {
        count: reportCount,
        points: Math.round(frequencyPoints * 10) / 10,
        max: 15,
        weight: '15%'
      },
      age: {
        days: daysOpen,
        points: Math.round(agePoints * 10) / 10,
        max: 10,
        weight: '10%'
      },
      proximity: {
        nearby: nearbySchoolsHospitals,
        points: Math.round(proximityPoints * 10) / 10,
        max: 10,
        weight: '10%'
      },
      licenseBonus: Math.round(licenseBonus * 10) / 10
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
