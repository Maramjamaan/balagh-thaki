const riyadhAreas = [
  // === وسط الرياض ===
  { name: "العليا", lat: 24.6900, lng: 46.6850, population: 85000, traffic: 95, type: "commercial" },
  { name: "السليمانية", lat: 24.6950, lng: 46.6750, population: 45000, traffic: 80, type: "mixed" },
  { name: "الملز", lat: 24.6650, lng: 46.7150, population: 92000, traffic: 85, type: "mixed" },
  { name: "الورود", lat: 24.7000, lng: 46.7000, population: 38000, traffic: 75, type: "residential" },
  { name: "المربع", lat: 24.6550, lng: 46.7100, population: 30000, traffic: 90, type: "government" },
  { name: "الفوطة", lat: 24.6350, lng: 46.7150, population: 52000, traffic: 70, type: "residential" },
  { name: "البطحاء", lat: 24.6400, lng: 46.7200, population: 78000, traffic: 88, type: "commercial" },
  { name: "الديرة", lat: 24.6500, lng: 46.7100, population: 65000, traffic: 82, type: "mixed" },

  // === شمال الرياض ===
  { name: "النخيل", lat: 24.7800, lng: 46.6250, population: 55000, traffic: 70, type: "residential" },
  { name: "الياسمين", lat: 24.8200, lng: 46.6350, population: 62000, traffic: 65, type: "residential" },
  { name: "الملقا", lat: 24.8000, lng: 46.6150, population: 48000, traffic: 72, type: "residential" },
  { name: "حطين", lat: 24.7600, lng: 46.6200, population: 42000, traffic: 68, type: "residential" },
  { name: "الصحافة", lat: 24.7400, lng: 46.6600, population: 58000, traffic: 78, type: "mixed" },
  { name: "الربيع", lat: 24.8100, lng: 46.6500, population: 40000, traffic: 60, type: "residential" },
  { name: "العقيق", lat: 24.7700, lng: 46.6300, population: 35000, traffic: 65, type: "residential" },
  { name: "الغدير", lat: 24.7500, lng: 46.6400, population: 44000, traffic: 62, type: "residential" },

  // === شرق الرياض ===
  { name: "الروضة", lat: 24.6700, lng: 46.7500, population: 72000, traffic: 75, type: "residential" },
  { name: "الريان", lat: 24.6550, lng: 46.7600, population: 68000, traffic: 70, type: "residential" },
  { name: "النسيم", lat: 24.6800, lng: 46.7800, population: 95000, traffic: 80, type: "residential" },
  { name: "الروابي", lat: 24.6600, lng: 46.7700, population: 55000, traffic: 65, type: "residential" },
  { name: "السلام", lat: 24.6900, lng: 46.7900, population: 60000, traffic: 68, type: "residential" },
  { name: "المنار", lat: 24.6750, lng: 46.7650, population: 47000, traffic: 63, type: "residential" },

  // === جنوب الرياض ===
  { name: "العزيزية", lat: 24.6000, lng: 46.7300, population: 88000, traffic: 82, type: "mixed" },
  { name: "الدار البيضاء", lat: 24.5800, lng: 46.7400, population: 75000, traffic: 72, type: "residential" },
  { name: "الشفا", lat: 24.5500, lng: 46.6800, population: 82000, traffic: 70, type: "residential" },
  { name: "بدر", lat: 24.5700, lng: 46.7100, population: 60000, traffic: 65, type: "residential" },
  { name: "المروج", lat: 24.5900, lng: 46.7200, population: 50000, traffic: 60, type: "residential" },

  // === غرب الرياض ===
  { name: "ظهرة لبن", lat: 24.6300, lng: 46.6200, population: 70000, traffic: 68, type: "residential" },
  { name: "السويدي", lat: 24.6100, lng: 46.6400, population: 85000, traffic: 75, type: "mixed" },
  { name: "العريجاء", lat: 24.6200, lng: 46.6000, population: 78000, traffic: 72, type: "residential" },
  { name: "نمار", lat: 24.5600, lng: 46.5800, population: 45000, traffic: 55, type: "residential" },
  { name: "طويق", lat: 24.5900, lng: 46.6100, population: 65000, traffic: 64, type: "residential" },
];

// البحث عن أقرب حي بناء على الإحداثيات
export function findNearestArea(lat, lng) {
  let nearest = null;
  let minDistance = Infinity;

  riyadhAreas.forEach(area => {
    const distance = Math.sqrt(
      Math.pow(lat - area.lat, 2) + Math.pow(lng - area.lng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = area;
    }
  });

  return nearest;
}

// جلب بيانات حي معين بالاسم
export function getAreaByName(name) {
  return riyadhAreas.find(area => area.name === name) || null;
}

// جلب كل الأحياء
export function getAllAreas() {
  return riyadhAreas;
}

export default riyadhAreas;