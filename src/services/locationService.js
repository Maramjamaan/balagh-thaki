import { findNearestArea } from '../data/riyadhAreas';

export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('المتصفح لا يدعم تحديد الموقع')); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const area = findNearestArea(latitude, longitude);
        resolve({ latitude, longitude, neighborhood: area?.name || 'غير محدد', area });
      },
      () => {
        // Fallback to random Riyadh location for demo
        const lat = 24.7136 + (Math.random() - 0.5) * 0.1;
        const lng = 46.6753 + (Math.random() - 0.5) * 0.1;
        const area = findNearestArea(lat, lng);
        resolve({ latitude: lat, longitude: lng, neighborhood: area?.name || 'العليا', area });
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 300000 }
    );
  });
}

export function getNeighborhood(latitude, longitude) {
  const area = findNearestArea(latitude, longitude);
  return { latitude, longitude, neighborhood: area?.name || 'غير محدد', area };
}
