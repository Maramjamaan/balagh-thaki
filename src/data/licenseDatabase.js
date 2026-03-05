// ============================================
// licenseDatabase.js — قاعدة بيانات تراخيص حفر تجريبية
// في الإنتاج: تُستبدل بـ API منصة نسّق
// ============================================

const DEMO_LICENSES = [
  // العليا — منطقة تجارية مزدحمة
  { id: 'RPC-2026-04521', entity: 'NWC', lat: 24.6905, lng: 46.6845, neighborhood: 'العليا', duration_days: 30, issued: '2026-01-15', type: 'صيانة شبكة مياه', contractor: 'شركة المتحدة للمقاولات' },
  { id: 'RPC-2026-04522', entity: 'SEC', lat: 24.6890, lng: 46.6860, neighborhood: 'العليا', duration_days: 45, issued: '2026-01-20', type: 'تمديد كابلات كهربائية', contractor: 'مؤسسة الطاقة للتنفيذ' },
  { id: 'RPC-2026-04785', entity: 'STC', lat: 24.6915, lng: 46.6830, neighborhood: 'العليا', duration_days: 30, issued: '2025-12-01', type: 'تمديد ألياف ضوئية', contractor: 'شركة الاتصالات للإنشاءات' },

  // السليمانية
  { id: 'RPC-2026-03102', entity: 'NWC', lat: 24.6955, lng: 46.6740, neighborhood: 'السليمانية', duration_days: 60, issued: '2025-11-10', type: 'استبدال أنابيب صرف', contractor: 'مؤسسة البناء الحديث' },
  { id: 'RPC-2026-03455', entity: 'Mobily', lat: 24.6940, lng: 46.6760, neighborhood: 'السليمانية', duration_days: 30, issued: '2026-02-01', type: 'تمديد شبكة ألياف', contractor: 'شركة موبايلي للإنشاءات' },

  // الملز
  { id: 'RPC-2026-05001', entity: 'NWC', lat: 24.6660, lng: 46.7140, neighborhood: 'الملز', duration_days: 30, issued: '2026-01-05', type: 'إصلاح تسرب مياه رئيسي', contractor: 'شركة المياه للصيانة' },
  { id: 'RPC-2026-05002', entity: 'SEC', lat: 24.6640, lng: 46.7160, neighborhood: 'الملز', duration_days: 45, issued: '2025-12-15', type: 'تقوية شبكة كهرباء', contractor: 'مؤسسة الكهرباء المتقدمة' },
  { id: 'RPC-2026-05233', entity: 'Municipality', lat: 24.6670, lng: 46.7130, neighborhood: 'الملز', duration_days: 60, issued: '2025-10-20', type: 'صيانة شبكة صرف أمطار', contractor: 'شركة الإنشاءات العامة' },

  // النخيل
  { id: 'RPC-2026-06100', entity: 'NWC', lat: 24.7810, lng: 46.6240, neighborhood: 'النخيل', duration_days: 30, issued: '2026-02-10', type: 'توصيل شبكة مياه جديدة', contractor: 'مؤسسة الأنابيب السعودية' },
  { id: 'RPC-2026-06101', entity: 'STC', lat: 24.7790, lng: 46.6260, neighborhood: 'النخيل', duration_days: 30, issued: '2026-01-25', type: 'تمديد ألياف FTTH', contractor: 'شركة STC للإنشاءات' },

  // الياسمين
  { id: 'RPC-2026-07200', entity: 'NWC', lat: 24.8210, lng: 46.6340, neighborhood: 'الياسمين', duration_days: 45, issued: '2025-12-20', type: 'تمديد شبكة مياه', contractor: 'شركة المتحدة للمقاولات' },
  { id: 'RPC-2026-07201', entity: 'Zain', lat: 24.8190, lng: 46.6360, neighborhood: 'الياسمين', duration_days: 30, issued: '2026-01-10', type: 'تمديد ألياف ضوئية', contractor: 'مؤسسة زين للإنشاءات' },

  // الملقا
  { id: 'RPC-2026-08300', entity: 'SEC', lat: 24.8005, lng: 46.6140, neighborhood: 'الملقا', duration_days: 60, issued: '2025-11-01', type: 'محطة تحويل فرعية', contractor: 'مؤسسة الطاقة السعودية' },

  // حطين
  { id: 'RPC-2026-08401', entity: 'NWC', lat: 24.7610, lng: 46.6190, neighborhood: 'حطين', duration_days: 30, issued: '2026-01-28', type: 'إصلاح كسر أنبوب', contractor: 'شركة الصيانة السريعة' },

  // الصحافة
  { id: 'RPC-2026-09500', entity: 'NWC', lat: 24.7410, lng: 46.6590, neighborhood: 'الصحافة', duration_days: 30, issued: '2025-12-25', type: 'صيانة خط مياه رئيسي', contractor: 'مؤسسة البناء الحديث' },
  { id: 'RPC-2026-09501', entity: 'Mobily', lat: 24.7390, lng: 46.6610, neighborhood: 'الصحافة', duration_days: 30, issued: '2026-02-05', type: 'توسعة شبكة 5G', contractor: 'شركة موبايلي للإنشاءات' },

  // الروضة
  { id: 'RPC-2026-10600', entity: 'NWC', lat: 24.6710, lng: 46.7490, neighborhood: 'الروضة', duration_days: 45, issued: '2025-11-20', type: 'استبدال شبكة مياه قديمة', contractor: 'شركة المياه للصيانة' },
  { id: 'RPC-2026-10601', entity: 'SEC', lat: 24.6690, lng: 46.7510, neighborhood: 'الروضة', duration_days: 30, issued: '2026-01-15', type: 'صيانة كابلات أرضية', contractor: 'مؤسسة الكهرباء المتقدمة' },

  // النسيم
  { id: 'RPC-2026-11700', entity: 'NWC', lat: 24.6810, lng: 46.7790, neighborhood: 'النسيم', duration_days: 30, issued: '2026-01-01', type: 'إصلاح شبكة صرف', contractor: 'مؤسسة الأنابيب السعودية' },
  { id: 'RPC-2026-11701', entity: 'STC', lat: 24.6790, lng: 46.7810, neighborhood: 'النسيم', duration_days: 30, issued: '2025-12-10', type: 'تمديد ألياف ضوئية', contractor: 'شركة STC للإنشاءات' },

  // العزيزية
  { id: 'RPC-2026-12800', entity: 'NWC', lat: 24.6010, lng: 46.7290, neighborhood: 'العزيزية', duration_days: 60, issued: '2025-10-15', type: 'مشروع تجديد شبكة', contractor: 'شركة المتحدة للمقاولات' },
  { id: 'RPC-2026-12801', entity: 'Municipality', lat: 24.5990, lng: 46.7310, neighborhood: 'العزيزية', duration_days: 45, issued: '2025-11-25', type: 'صيانة شبكة صرف أمطار', contractor: 'شركة الإنشاءات العامة' },

  // الشفا
  { id: 'RPC-2026-13900', entity: 'SEC', lat: 24.5510, lng: 46.6790, neighborhood: 'الشفا', duration_days: 30, issued: '2026-02-01', type: 'تمديد خطوط كهرباء', contractor: 'مؤسسة الطاقة السعودية' },

  // السويدي
  { id: 'RPC-2026-14100', entity: 'NWC', lat: 24.6110, lng: 46.6390, neighborhood: 'السويدي', duration_days: 30, issued: '2025-12-05', type: 'إصلاح تسرب', contractor: 'شركة الصيانة السريعة' },
  { id: 'RPC-2026-14101', entity: 'STC', lat: 24.6090, lng: 46.6410, neighborhood: 'السويدي', duration_days: 30, issued: '2026-01-20', type: 'ألياف ضوئية', contractor: 'شركة STC للإنشاءات' },

  // المربع
  { id: 'RPC-2026-15200', entity: 'Municipality', lat: 24.6560, lng: 46.7090, neighborhood: 'المربع', duration_days: 60, issued: '2025-10-01', type: 'تطوير شبكة صرف', contractor: 'شركة الإنشاءات العامة' },

  // البطحاء
  { id: 'RPC-2026-16300', entity: 'NWC', lat: 24.6410, lng: 46.7190, neighborhood: 'البطحاء', duration_days: 30, issued: '2025-11-15', type: 'صيانة خط مياه', contractor: 'مؤسسة البناء الحديث' },

  // الربيع
  { id: 'RPC-2026-17400', entity: 'NWC', lat: 24.8110, lng: 46.6490, neighborhood: 'الربيع', duration_days: 30, issued: '2026-02-15', type: 'توصيل مياه حي جديد', contractor: 'شركة المتحدة للمقاولات' },

  // العقيق
  { id: 'RPC-2026-18500', entity: 'SEC', lat: 24.7710, lng: 46.6290, neighborhood: 'العقيق', duration_days: 45, issued: '2025-12-01', type: 'محطة تحويل', contractor: 'مؤسسة الطاقة السعودية' },

  // الغدير
  { id: 'RPC-2026-19600', entity: 'Mobily', lat: 24.7510, lng: 46.6390, neighborhood: 'الغدير', duration_days: 30, issued: '2026-01-05', type: 'ألياف ضوئية', contractor: 'شركة موبايلي للإنشاءات' },

  // ظهرة لبن
  { id: 'RPC-2026-20700', entity: 'NWC', lat: 24.6310, lng: 46.6190, neighborhood: 'ظهرة لبن', duration_days: 30, issued: '2025-11-01', type: 'إصلاح شبكة مياه', contractor: 'شركة الصيانة السريعة' },

  // الدار البيضاء
  { id: 'RPC-2026-21800', entity: 'NWC', lat: 24.5810, lng: 46.7390, neighborhood: 'الدار البيضاء', duration_days: 60, issued: '2025-09-15', type: 'مشروع شبكة صرف جديد', contractor: 'شركة المتحدة للمقاولات' },

  // الورود
  { id: 'RPC-2026-22900', entity: 'STC', lat: 24.7010, lng: 46.6990, neighborhood: 'الورود', duration_days: 30, issued: '2026-01-10', type: 'توسعة شبكة FTTH', contractor: 'شركة STC للإنشاءات' },

  // الديرة
  { id: 'RPC-2026-23010', entity: 'NWC', lat: 24.6510, lng: 46.7090, neighborhood: 'الديرة', duration_days: 30, issued: '2025-12-20', type: 'صيانة أنابيب قديمة', contractor: 'مؤسسة الأنابيب السعودية' },

  // الفوطة
  { id: 'RPC-2026-24110', entity: 'SEC', lat: 24.6360, lng: 46.7140, neighborhood: 'الفوطة', duration_days: 45, issued: '2025-11-10', type: 'تمديد كابلات', contractor: 'مؤسسة الكهرباء المتقدمة' },

  // بدر
  { id: 'RPC-2026-25210', entity: 'NWC', lat: 24.5710, lng: 46.7090, neighborhood: 'بدر', duration_days: 30, issued: '2026-01-25', type: 'توصيل مياه', contractor: 'شركة المياه للصيانة' },

  // طويق
  { id: 'RPC-2026-26310', entity: 'Municipality', lat: 24.5910, lng: 46.6090, neighborhood: 'طويق', duration_days: 60, issued: '2025-10-10', type: 'صيانة طرق وصرف', contractor: 'شركة الإنشاءات العامة' },
];

export function getAllLicenses() {
  return DEMO_LICENSES;
}

export function getLicenseById(id) {
  return DEMO_LICENSES.find(l => l.id === id) || null;
}

export default DEMO_LICENSES;
