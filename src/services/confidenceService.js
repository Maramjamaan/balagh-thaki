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

  const sv = checkSeverityLogic(aiResult);
  if (sv) { warnings.push(sv); adj -= 0.05; }

  // Excavation-specific validations
  if (aiResult.excavation_stage === 'abandoned' && aiResult.severity < 4) {
    warnings.push('حفرية مهجورة تستحق شدة 4+');
    adj -= 0.05;
  }
  if (!aiResult.has_safety_barriers && aiResult.severity < 3) {
    warnings.push('حفرية بدون حواجز سلامة — خطر مباشر');
    adj -= 0.05;
  }
  if (aiResult.estimated_age_days > 60 && aiResult.license_status_estimate === 'likely_within_permit') {
    warnings.push('عمر الحفرية لا يتوافق مع حالة الترخيص');
    adj -= 0.08;
  }
  if (aiResult.blocks_traffic && aiResult.severity < 3) {
    warnings.push('حفرية تعيق المرور تستحق شدة أعلى');
  }

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
      : `❓ يرجى اختيار نوع الحفرية يدوياً`,
  };
}

function checkEntityMismatch(cat, entity) {
  // All categories are excavation-related, all entities are valid excavators
  const validEntities = ['NWC', 'SEC', 'STC', 'Mobily', 'Zain', 'Municipality', 'Unknown'];
  if (!validEntities.includes(entity)) return 'جهة غير معروفة';
  return null;
}

function checkSeverityLogic(aiResult) {
  if (aiResult.excavation_stage === 'abandoned' && aiResult.has_safety_barriers === false && aiResult.severity < 5) {
    return 'حفرية مهجورة بدون حواجز — يُفترض شدة قصوى';
  }
  if (aiResult.category === 'post_paving_dig' && aiResult.severity < 3) {
    return 'حفر بعد السفلتة يعكس غياب التنسيق — شدة 3+';
  }
  return null;
}

export const CATEGORIES_LIST = [
  { id: 'delayed_excavation', label: 'حفرية متأخرة', icon: '⏱️' },
  { id: 'abandoned_excavation', label: 'حفرية مهجورة', icon: '🚫' },
  { id: 'post_paving_dig', label: 'حفر بعد السفلتة', icon: '🔄' },
  { id: 'no_safety_barriers', label: 'بدون حواجز سلامة', icon: '⚠️' },
  { id: 'no_license_visible', label: 'بدون ترخيص ظاهر', icon: '📋' },
  { id: 'active_excavation', label: 'حفرية نشطة', icon: '🚧' },
];
