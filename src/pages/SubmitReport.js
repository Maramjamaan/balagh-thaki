import React, { useState } from 'react';

function SubmitReport() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const handleImage = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  };

  const handleSubmit = () => {
    if (!image || !location || !category) {
      alert('يرجى رفع صورة واختيار النوع وتحديد الموقع');
      return;
    }
    alert('✅ تم إرسال البلاغ بنجاح!');
  };

  const categories = [
    { id: 'hole', label: '🕳️ حفرة', color: '#e74c3c' },
    { id: 'water', label: '💧 تسرب مياه', color: '#2980b9' },
    { id: 'light', label: '💡 إنارة معطلة', color: '#f39c12' },
    { id: 'waste', label: '🗑️ مخلفات', color: '#27ae60' },
    { id: 'dig', label: '⚠️ حفريات', color: '#8e44ad' },
    { id: 'crack', label: '🔧 تشققات', color: '#e67e22' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>رفع بلاغ جديد</h2>
        <p style={styles.subtitle}>ساعد في تحسين مدينتك بتقرير واحد</p>
      </div>

      {/* نوع المشكلة */}
      <div style={styles.card}>
        <label style={styles.label}>🚧 نوع المشكلة</label>
        <div style={styles.categories}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              style={{
                ...styles.catItem,
                background: category === cat.id ? cat.color : '#f0f4f8',
                color: category === cat.id ? 'white' : '#333',
                border: `2px solid ${category === cat.id ? cat.color : '#ddd'}`,
              }}
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </div>
          ))}
        </div>
      </div>

      {/* الصورة */}
      <div style={styles.card}>
        <label style={styles.label}>📷 صورة المشكلة</label>
        <label style={styles.uploadBox}>
          {preview ? (
            <img src={preview} alt="preview" style={styles.preview} />
          ) : (
            <div style={styles.uploadPlaceholder}>
              <span style={{ fontSize: '40px' }}>📸</span>
              <p>اضغط لرفع صورة</p>
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
        </label>
      </div>

      {/* الموقع */}
      <div style={styles.card}>
        <label style={styles.label}>📍 الموقع</label>
        <button style={styles.locationBtn} onClick={getLocation}>
          {location ? `✅ ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : '📍 تحديد موقعي تلقائياً'}
        </button>
      </div>

      {/* الوصف */}
      <div style={styles.card}>
        <label style={styles.label}>📝 وصف اختياري</label>
        <textarea
          style={styles.textarea}
          placeholder="اوصف المشكلة بشكل مختصر..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <button style={styles.submitBtn} onClick={handleSubmit}>
        🚀 إرسال البلاغ
      </button>
    </div>
  );
}

const styles = {
  container: { padding: '32px', direction: 'rtl', maxWidth: '640px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '28px', color: '#1a5276', fontWeight: 'bold' },
  subtitle: { color: '#7f8c8d', marginTop: '8px' },
  card: { background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  label: { display: 'block', fontWeight: 'bold', marginBottom: '14px', fontSize: '15px' },
  categories: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' },
  catItem: { padding: '12px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'all 0.2s' },
  uploadBox: { display: 'block', border: '2px dashed #bdc3c7', borderRadius: '12px', cursor: 'pointer', overflow: 'hidden', minHeight: '160px' },
  uploadPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '160px', color: '#95a5a6' },
  preview: { width: '100%', maxHeight: '220px', objectFit: 'cover' },
  locationBtn: { width: '100%', padding: '12px', background: '#eaf4fb', border: '2px solid #2e86c1', borderRadius: '12px', cursor: 'pointer', color: '#1a5276', fontWeight: 'bold', fontSize: '14px' },
  textarea: { width: '100%', height: '90px', borderRadius: '10px', border: '1px solid #ddd', padding: '10px', fontSize: '14px', resize: 'none' },
  submitBtn: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #27ae60, #1e8449)', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontSize: '17px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(39,174,96,0.3)' },
};

export default SubmitReport;
