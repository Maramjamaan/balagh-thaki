import { findNearestArea } from '../data/riyadhAreas';

// === تحديد موقع المستخدم من GPS ===
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('المتصفح لا يدعم تحديد الموقع'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const area = findNearestArea(latitude, longitude);

        resolve({
          latitude,
          longitude,
          neighborhood: area?.name || 'غير محدد',
          area
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('المستخدم رفض تحديد الموقع'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('الموقع غير متاح'));
            break;
          case error.TIMEOUT:
            reject(new Error('انتهت مهلة تحديد الموقع'));
            break;
          default:
            reject(new Error('خطأ في تحديد الموقع'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  });
}

// === تحديد الحي من إحداثيات معينة (بدون GPS) ===
export function getNeighborhood(latitude, longitude) {
  const area = findNearestArea(latitude, longitude);
  return {
    latitude,
    longitude,
    neighborhood: area?.name || 'غير محدد',
    area
  };
}