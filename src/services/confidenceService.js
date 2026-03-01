// =============================================
// خدمة التحقق من الثقة — Confidence Validation
// الطبقة الأولى: الفهم (Understanding)
// =============================================
// بدل ما نثق بالذكاء الاصطناعي بشكل أعمى،
// نتحقق من مستوى الثقة ونطلب تأكيد المستخدم إذا لزم الأمر

// === مستويات الثقة ===
export const CONFIDENCE_LEVELS = {
  HIGH: { min: 0.80, label: 'عالية', label_en: 'High', color: '#22C55E', action: 'auto_accept' },
  MEDIUM: { min: 0.60, label: 'متوسطة', label_en: 'Medium', color: '#EAB308', action: 'confirm' },
  LOW: { min: 0.0, label: 'منخفضة', label_en: 'Low', color: '#DC2626', action: 'manual' },
};

// === تحديد مستوى الثقة ===
export function getConfidenceLevel(confidence) {
  if (confidence >= CONFIDENCE_LEVELS.HIGH.min) return CONFIDENCE_LEVELS.HIGH;
  if (confidence >= CONFIDENCE_LEVELS.MEDIUM.min) return CONFIDENCE_LEVELS.MEDIUM;
  return CONFIDENCE_LEVELS.LOW;
}

// === التحقق من نتيجة التصنيف ===
export function validateClassification(aiResult) {
  const confidence = aiResult.confidence || 0;
  

  // قواعد تحقق إضافية
  const warnings = [];
  let adjustedConfidence = confidence;

  // 1. هل الفئة والجهة المسؤولة متوافقة؟
  const entityMismatch = checkEntityMismatch(aiResult.category, aiResult.responsible_entity);
  if (entityMismatch) {
    warnings.push(entityMismatch);
    adjustedConfidence -= 0.10; // خصم 10%
  }

  // 2. هل الشدة منطقية مع الفئة؟
  const severityIssue = checkSeverityLogic(aiResult.category, aiResult.severity);
  if (severityIssue) {
    warnings.push(severityIssue);
    adjustedConfidence -= 0.05;
  }

  // 3. هل الاقتراح يحتاج شدة منخفضة؟
  if (aiResult.category === 'suggestion' && aiResult.severity > 2) {
    warnings.push('الاقتراحات عادةً تكون منخفضة الشدة');
    adjustedConfidence -= 0.05;
  }

  // 4. حفرية بدون حواجز = خطر عالي
  if (aiResult.category === 'excavation' && !aiResult.has_safety_barriers && aiResult.severity < 4) {
    warnings.push('حفرية بدون حواجز سلامة — قد تحتاج شدة أعلى');
  }

  // إعادة تحديد المستوى بعد التعديل
  adjustedConfidence = Math.max(0, Math.min(1, adjustedConfidence));
  const adjustedLevel = getConfidenceLevel(adjustedConfidence);

  return {
    originalConfidence: confidence,
    adjustedConfidence: Math.round(adjustedConfidence * 100) / 100,
    level: adjustedLevel,
    action: adjustedLevel.action,
    warnings,
    needsUserConfirmation: adjustedLevel.action !== 'auto_accept',
    needsManualClassification: adjustedLevel.action === 'manual',
    summary: generateSummary(adjustedLevel, aiResult, warnings),
  };
}

// === التحقق من توافق الفئة مع الجهة المسؤولة ===
function checkEntityMismatch(category, entity) {
  const expectedEntities = {
    excavation: ['NWC', 'SEC', 'STC', 'Mobily', 'Zain', 'RIPC'],
    water_leak: ['NWC'],
    lighting: ['Municipality', 'SEC'],
    traffic: ['Traffic_Dept', 'Municipality'],
    sidewalk: ['Municipality'],
    road_damage: ['Municipality', 'RIPC'],
    debris: ['Cleaning_Company', 'Municipality'],
    suggestion: ['Municipality_Planning', 'Municipality', 'Traffic_Dept'],
  };

  const expected = expectedEntities[category];
  if (expected && !expected.includes(entity)) {
    return `الجهة "${entity}" غير متوقعة للفئة "${category}" — المتوقع: ${expected.join(' أو ')}`;
  }
  return null;
}

// === التحقق من منطقية الشدة ===
function checkSeverityLogic(category, severity) {
  // حفريات مهجورة يجب أن تكون شدة 4+
  if (category === 'excavation' && severity < 3) {
    return 'الحفريات عادةً تستحق شدة 3 أو أعلى';
  }
  // تسرب مياه عادةً شدة 3+
  if (category === 'water_leak' && severity < 2) {
    return 'تسرب المياه عادةً يستحق شدة 2 أو أعلى';
  }
  return null;
}

// === ملخص التحقق ===
function generateSummary(level, aiResult, warnings) {
  if (level.action === 'auto_accept') {
    return `✅ تم التصنيف تلقائياً بثقة ${level.label} — ${aiResult.category_ar}`;
  }
  if (level.action === 'confirm') {
    return `⚠️ الذكاء الاصطناعي يعتقد أن المشكلة: ${aiResult.category_ar} — يرجى التأكيد`;
  }
  return `❓ الذكاء الاصطناعي غير متأكد من التصنيف — يرجى اختيار الفئة يدوياً`;
}

// === قائمة الفئات للاختيار اليدوي ===
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