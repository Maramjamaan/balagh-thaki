import React, { useState } from 'react';
import { submitReport, getAllReports, getDashboardStats } from './services/reportService';
import { getCurrentLocation } from './services/locationService';
import { isAIEnabled } from './services/aiService';

export default function TestPage() {
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState('');
  const [image, setImage] = useState(null);

  const addLog = (msg, type = 'info') => {
    setLog(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString('ar-SA') }]);
  };

  // اختبار 1: الاتصال بـ Supabase
  const testSupabase = async () => {
    setLoading('supabase');
    try {
      const reports = await getAllReports();
      addLog(`Supabase شغال - عدد البلاغات: ${reports.length}`, 'success');
    } catch (err) {
      addLog(`خطأ Supabase: ${err.message}`, 'error');
    }
    setLoading('');
  };

  // اختبار 2: تحديد الموقع
  const testLocation = async () => {
    setLoading('location');
    try {
      const loc = await getCurrentLocation();
      addLog(`الموقع: ${loc.neighborhood} (${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)})`, 'success');
    } catch (err) {
      addLog(`خطأ الموقع: ${err.message}`, 'error');
    }
    setLoading('');
  };

  // اختبار 3: إرسال بلاغ كامل
  const testFullReport = async () => {
    if (!image) {
      addLog('اختاري صورة أولا', 'error');
      return;
    }
    setLoading('report');
    try {
      addLog('جاري تحليل الصورة...', 'info');
      const result = await submitReport(image);
      addLog(`تم ارسال البلاغ بنجاح`, 'success');
      addLog(`النوع: ${result.ai.category_ar}`, 'success');
      addLog(`الشدة: ${result.ai.severity}`, 'success');
      addLog(`الحي: ${result.location.neighborhood}`, 'success');
      addLog(`الاولوية: ${result.priority.score}/100 (${result.priority.level.label})`, 'success');
    } catch (err) {
      addLog(`خطأ: ${err.message}`, 'error');
    }
    setLoading('');
  };

  // اختبار 4: إحصائيات لوحة التحكم
  const testDashboard = async () => {
    setLoading('dashboard');
    try {
      const stats = await getDashboardStats();
      if (stats) {
        addLog(`اجمالي البلاغات: ${stats.total}`, 'success');
        addLog(`بانتظار المعالجة: ${stats.pending} | قيد المعالجة: ${stats.inProgress} | تم الحل: ${stats.resolved}`, 'success');
        addLog(`بلاغات حرجة: ${stats.critical} | متوسط الاولوية: ${stats.avgScore}`, 'success');
      } else {
        addLog('لا توجد بلاغات بعد', 'info');
      }
    } catch (err) {
      addLog(`خطأ: ${err.message}`, 'error');
    }
    setLoading('');
  };

  const colors = { success: '#22C55E', error: '#DC2626', info: '#3B82F6' };

  return (
    <div dir="rtl" style={{ padding: 30, fontFamily: 'Arial', maxWidth: 700, margin: '0 auto', background: '#0f1a0f', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ color: '#C8A951', textAlign: 'center', marginBottom: 5 }}>Balagh Thaki - Test Page</h1>
      <p style={{ textAlign: 'center', color: '#888', marginBottom: 30 }}>
        AI Mode: {isAIEnabled() ? 'OpenAI (Live)' : 'Demo (Simulated)'}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <button onClick={testSupabase} disabled={!!loading}
          style={{ padding: '12px', background: '#1B4D3E', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
          {loading === 'supabase' ? 'جاري...' : '1. اختبار Supabase'}
        </button>
        <button onClick={testLocation} disabled={!!loading}
          style={{ padding: '12px', background: '#1B4D3E', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
          {loading === 'location' ? 'جاري...' : '2. اختبار الموقع GPS'}
        </button>
        <button onClick={testDashboard} disabled={!!loading}
          style={{ padding: '12px', background: '#1B4D3E', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
          {loading === 'dashboard' ? 'جاري...' : '4. اختبار الاحصائيات'}
        </button>
      </div>

      <div style={{ background: '#1a2a1a', padding: 15, borderRadius: 8, marginBottom: 15 }}>
        <p style={{ margin: '0 0 10px', color: '#C8A951' }}>3. اختبار ارسال بلاغ كامل:</p>
        <input type="file" accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          style={{ marginBottom: 10, color: '#fff' }}
        />
        <button onClick={testFullReport} disabled={!!loading || !image}
          style={{ padding: '10px 20px', background: '#C8A951', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold', display: 'block', width: '100%' }}>
          {loading === 'report' ? 'جاري التحليل والارسال...' : 'ارسال بلاغ تجريبي'}
        </button>
      </div>

      <div style={{ background: '#111', borderRadius: 8, padding: 15, maxHeight: 350, overflowY: 'auto' }}>
        <p style={{ color: '#666', margin: '0 0 10px' }}>Console:</p>
        {log.length === 0 && <p style={{ color: '#444' }}>اضغطي على اي زر للاختبار...</p>}
        {log.map((l, i) => (
          <div key={i} style={{ color: colors[l.type], fontSize: 13, marginBottom: 5, direction: 'ltr', textAlign: 'left' }}>
            <span style={{ color: '#555' }}>[{l.time}]</span> {l.msg}
          </div>
        ))}
      </div>
    </div>
  );
}