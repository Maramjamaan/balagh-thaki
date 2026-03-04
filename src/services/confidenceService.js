export const CONFIDENCE_LEVELS = {
  HIGH: { min: 0.80, label: 'عالية', color: '#22C55E', action: 'auto_accept' },
  MEDIUM: { min: 0.60, label: 'متوسطة', color: '#EAB308', action: 'confirm' },
  LOW: { min: 0.0, label: 'منخفضة', color: '#DC2626', action: 'manual' },
};

export function getConfidenceLevel(c) {
  if (c >= CONFIDENCE_LEVELS.HIGH.min) return CONFIDENCE_LEVELS.HIGH;
  if (c >= CONFIDENCE_LEVELS.MEDIUM.min) return CONFIDENCE_LEVELS.MEDIUM;
  return CONFIDENCE_LEVELS.LOW;
}

export function validateClassification(aiResult) {
  const confidence = aiResult.confidence || 0;
  const warnings = [];
  let adj = confidence;

  const em = checkEntityMismatch(aiResult.category, aiResult.responsible_entity);
  if (em) { warnings.push(em); adj -= 0.10; }

  const sv = checkSeverityLogic(aiResult.category, aiResult.severity);
  if (sv) { warnings.push(sv); adj -= 0.05; }

  if (aiResult.category === 'suggestion' && aiResult.severity > 2) { warnings.push('الاقتراحات عادةً منخفضة الشدة'); adj -= 0.05; }
  if (aiResult.category === 'excavation' && !aiResult.has_safety_barriers && aiResult.severity < 4) { warnings.push('حفرية بدون حواجز سلامة'); }

  adj = Math.max(0, Math.min(1, adj));
  const level = getConfidenceLevel(adj);

  return {
    originalConfidence: confidence,
    adjustedConfidence: Math.round(adj * 100) / 100,
    level, action: level.action, warnings,
    needsUserConfirmation: level.action !== 'auto_accept',
    needsManualClassification: level.action === 'manual',
    summary: level.action === 'auto_accept'
      ? `✅ تصنيف تلقائي بثقة ${level.label} — ${aiResult.category_ar}`
      : level.action === 'confirm'
      ? `⚠️ يرجى تأكيد: ${aiResult.category_ar}`
      : `❓ يرجى اختيار الفئة يدوياً`,
  };
}

function checkEntityMismatch(cat, entity) {
  const map = { excavation: ['NWC','SEC','STC','Mobily','Zain','RIPC'], water_leak: ['NWC'], lighting: ['Municipality','SEC'], traffic: ['Traffic_Dept','Municipality'], sidewalk: ['Municipality'], road_damage: ['Municipality','RIPC'], debris: ['Cleaning_Company','Municipality'], suggestion: ['Municipality_Planning','Municipality','Traffic_Dept'] };
  const exp = map[cat];
  if (exp && !exp.includes(entity)) return `الجهة غير متوقعة للفئة`;
  return null;
}

function checkSeverityLogic(cat, sev) {
  if (cat === 'excavation' && sev < 3) return 'الحفريات تستحق شدة 3+';
  if (cat === 'water_leak' && sev < 2) return 'تسرب المياه يستحق شدة 2+';
  return null;
}

export const CATEGORIES_LIST = [
  { id: 'excavation', label: 'حفريات', icon: '🚧' },
  { id: 'water_leak', label: 'تسرب مياه', icon: '💧' },
  { id: 'lighting', label: 'إنارة معطلة', icon: '💡' },
  { id: 'traffic', label: 'مشكلة مرورية', icon: '🚦' },
  { id: 'sidewalk', label: 'أرصفة تالفة', icon: '🚶' },
  { id: 'road_damage', label: 'تلف في الطريق', icon: '🛣️' },
  { id: 'debris', label: 'مخلفات بناء', icon: '🏗️' },
  { id: 'suggestion', label: 'اقتراح تحسين', icon: '💡' },
  { id: 'other', label: 'أخرى', icon: '📋' },
];
