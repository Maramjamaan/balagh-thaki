// ============================================
// licenseService.js — مطابقة البلاغ مع ترخيص الحفر
// في الإنتاج: يستبدل بـ API منصة نسّق
// ============================================

import DEMO_LICENSES from '../data/licenseDatabase';

const MATCH_RADIUS_METERS = 200;

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * يبحث عن أقرب ترخيص حفر ضمن 200 متر من موقع البلاغ
 * يحسب أيام التأخير ويرجّع كل البيانات
 */
export function matchNearbyLicense(latitude, longitude, entityHint = null) {
  const now = new Date();
  let bestMatch = null;
  let bestDistance = Infinity;

  for (const license of DEMO_LICENSES) {
    const distance = haversineMeters(latitude, longitude, license.lat, license.lng);

    if (distance > MATCH_RADIUS_METERS) continue;

    // لو فيه hint من AI عن الجهة، فضّل الترخيص المطابق
    const entityMatch = entityHint && license.entity === entityHint;
    const effectiveDistance = entityMatch ? distance * 0.5 : distance;

    if (effectiveDistance < bestDistance) {
      bestDistance = effectiveDistance;
      bestMatch = license;
    }
  }

  if (!bestMatch) {
    return {
      found: false,
      message: '⚠️ لم يُعثر على ترخيص مطابق في هذا الموقع',
      message_detail: 'قد تكون حفرية بدون ترخيص — أو الترخيص خارج نطاق البحث (200 متر)',
    };
  }

  // حساب التواريخ
  const issuedDate = new Date(bestMatch.issued);
  const expiryDate = new Date(issuedDate);
  expiryDate.setDate(expiryDate.getDate() + bestMatch.duration_days);

  const daysSinceIssued = Math.floor((now - issuedDate) / 86400000);
  const daysUntilExpiry = Math.floor((expiryDate - now) / 86400000);
  const isExpired = daysUntilExpiry < 0;
  const delayDays = isExpired ? Math.abs(daysUntilExpiry) : 0;

  // حالة الترخيص
  let status, statusColor, statusIcon;
  if (isExpired) {
    if (delayDays > 30) {
      status = `متأخرة ${delayDays} يوم — تجاوز كبير`;
      statusColor = '#991B1B';
      statusIcon = '🔴';
    } else {
      status = `متأخرة ${delayDays} يوم عن الموعد`;
      statusColor = '#DC2626';
      statusIcon = '🟠';
    }
  } else if (daysUntilExpiry <= 7) {
    status = `متبقي ${daysUntilExpiry} يوم — قرب الانتهاء`;
    statusColor = '#F97316';
    statusIcon = '🟡';
  } else {
    status = `ضمن المدة — متبقي ${daysUntilExpiry} يوم`;
    statusColor = '#22C55E';
    statusIcon = '🟢';
  }

  return {
    found: true,
    license: {
      id: bestMatch.id,
      entity: bestMatch.entity,
      neighborhood: bestMatch.neighborhood,
      type: bestMatch.type,
      contractor: bestMatch.contractor,
      duration_days: bestMatch.duration_days,
      issued_date: bestMatch.issued,
      expiry_date: expiryDate.toISOString().split('T')[0],
    },
    timing: {
      days_since_issued: daysSinceIssued,
      days_until_expiry: daysUntilExpiry,
      is_expired: isExpired,
      delay_days: delayDays,
    },
    status,
    statusColor,
    statusIcon,
    distance_meters: Math.round(bestDistance),
    message: isExpired
      ? `🔴 ترخيص ${bestMatch.id} — متأخرة ${delayDays} يوم عن الموعد`
      : `🟢 ترخيص ${bestMatch.id} — ضمن المدة (متبقي ${daysUntilExpiry} يوم)`,
  };
}
