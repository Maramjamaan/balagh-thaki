import { findNearestArea } from '../data/riyadhAreas';

export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('المتصفح لا يدعم تحديد الموقع')); return; }
    
    const tryGetLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const area = findNearestArea(latitude, longitude);
          resolve({ latitude, longitude, neighborhood: area?.name || 'غير محدد', area });
        },
        (err) => {
          if (err.code === 1) {
            // المستخدم رفض — نسأله مرة ثانية
            const retry = window.confirm('نحتاج موقعك عشان نطابق الحفرية مع الترخيص الصحيح.\n\nاضغط OK وفعّل الموقع من المتصفح.');
            if (retry) {
              tryGetLocation();
            } else {
              // الفولباك — العليا
              const lat = 24.6905;
              const lng = 46.6845;
              const area = findNearestArea(lat, lng);
              resolve({ latitude: lat, longitude: lng, neighborhood: area?.name || 'العليا', area });
            }
          } else {
            // خطأ ثاني (timeout مثلاً) — الفولباك
            const lat = 24.6905;
            const lng = 46.6845;
            const area = findNearestArea(lat, lng);
            resolve({ latitude: lat, longitude: lng, neighborhood: area?.name || 'العليا', area });
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    };

    tryGetLocation();
  });
}

export function getNeighborhood(latitude, longitude) {
  const area = findNearestArea(latitude, longitude);
  return { latitude, longitude, neighborhood: area?.name || 'غير محدد', area };
}
