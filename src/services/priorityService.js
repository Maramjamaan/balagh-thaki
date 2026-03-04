import { findNearestArea } from '../data/riyadhAreas';

function calcSeverity(s) { return s * 5; }
function calcPopulation(p) { return Math.min((p / 100000) * 20, 20); }
function calcTraffic(t) { return Math.min((t / 100) * 20, 20); }
function calcFrequency(c) { return Math.min(c * 3, 15); }
function calcAge(d) { return Math.min(d * 0.5, 10); }
function calcProximity(n) { return Math.min(n * 2.5, 10); }

export function calculatePriority({ severity, latitude, longitude, reportCount = 1, daysOpen = 0, nearbySchoolsHospitals = 1, licenseExpired = false, delayDays = 0 }) {
  const area = findNearestArea(latitude, longitude);
  const sev = calcSeverity(severity);
  const pop = calcPopulation(area ? area.population : 50000);
  const traf = calcTraffic(area ? area.traffic : 50);
  const freq = calcFrequency(reportCount);
  const age = calcAge(daysOpen);
  const prox = calcProximity(nearbySchoolsHospitals);
  let total = sev + pop + traf + freq + age + prox;
  let licenseBonus = 0;
  if (licenseExpired && delayDays > 0) { licenseBonus = Math.min(delayDays * 0.5, 10); total += licenseBonus; }
  const score = Math.min(Math.round(total), 100);
  return {
    score,
    level: score >= 80 ? { label: 'حرج', color: '#DC2626' } : score >= 60 ? { label: 'مرتفع', color: '#F97316' } : score >= 40 ? { label: 'متوسط', color: '#EAB308' } : { label: 'منخفض', color: '#22C55E' },
    breakdown: { severity: { value: severity, points: Math.round(sev * 10) / 10, max: 25 }, population: { area: area?.name || 'غير محدد', points: Math.round(pop * 10) / 10, max: 20 }, traffic: { points: Math.round(traf * 10) / 10, max: 20 }, frequency: { count: reportCount, points: Math.round(freq * 10) / 10, max: 15 }, age: { days: daysOpen, points: Math.round(age * 10) / 10, max: 10 }, proximity: { nearby: nearbySchoolsHospitals, points: Math.round(prox * 10) / 10, max: 10 }, licenseBonus: Math.round(licenseBonus * 10) / 10 },
  };
}
