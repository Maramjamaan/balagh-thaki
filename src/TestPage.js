import React, { useState } from 'react';
import { submitReport, getAllReports, getDashboardStats } from './services/reportService';
import { getCurrentLocation } from './services/locationService';
import { isAIEnabled, getProviderName } from './services/aiService';

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
      addLog(`✅ Supabase شغال — عدد البلاغات: ${reports.length}`, 'success');
    } catch (err) {
      addLog(`❌ خطأ Supabase: ${err.message}`, 'error');
    }
    setLoading('');
  };

  // اختبار 2: تحديد الموقع
  const testLocation = async () => {
    setLoading('location');
    try {
      const loc = await getCurrentLocation();
      addLog(`✅ الموقع: ${loc.neighborhood} (${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)})`, 'success');
    } catch (err) {
      addLog(`❌ خطأ الموقع: ${err.message}`, 'error');
    }
    setLoading('');
  };

  // اختبار 3: إرسال بلاغ كامل
  const testFullReport = async () => {
    if (!image) {
      addLog('⚠️ اختر صورة أولاً', 'error');
      return;
    }
    setLoading('report');
    try {
      addLog(`🤖 جاري تحليل الصورة عبر ${getProviderName()}...`, 'info');
      const result = await submitReport(image);
      addLog(`✅ تم إرسال البلاغ بنجاح!`, 'success');
      addLog(`📋 النوع: ${result.ai.category_ar}`, 'success');
      addLog(`📋 الفرعي: ${result.ai.subcategory_ar}`, 'success');
      addLog(`🔴 الشدة: ${result.ai.severity}/5`, 'success');
      addLog(`📍 الحي: ${result.location.neighborhood}`, 'success');
      addLog(`⚡ الأولوية: ${result.priority.score}/100 (${result.priority.level.label})`, 'success');
      addLog(`🏢 الجهة: ${result.ai.responsible_entity}`, 'success');
      addLog(`🎯 الدقة: ${Math.round(result.ai.confidence * 100)}%`, 'success');
      if (result.ai.description_ar) {
        addLog(`📝 ${result.ai.description_ar}`, 'info');
      }
    } catch (err) {
      addLog(`❌ خطأ: ${err.message}`, 'error');
    }
    setLoading('');
  };

  // اختبار 4: إحصائيات لوحة التحكم
  const testDashboard = async () => {
    setLoading('dashboard');
    try {
      const stats = await getDashboardStats();
      if (stats) {
        addLog(`✅ إجمالي البلاغات: ${stats.total}`, 'success');
        addLog(`⏱️ بانتظار: ${stats.pending} | قيد المعالجة: ${stats.inProgress} | تم: ${stats.resolved}`, 'success');
        addLog(`🔴 حرجة: ${stats.critical} | متوسط الأولوية: ${stats.avgScore}`, 'success');
      } else {
        addLog('📭 لا توجد بلاغات بعد', 'info');
      }
    } catch (err) {
      addLog(`❌ خطأ: ${err.message}`, 'error');
    }
    setLoading('');
  };

  const colors = { success: '#22C55E', error: '#DC2626', info: '#3B82F6' };

  return (
    <div dir="rtl" style={{ padding: 30, fontFamily: 'Tajawal, Arial', maxWidth: 700, margin: '0 auto', background: '#0f1a0f', minHeight: '100vh', color: '#fff' }}>
      <h1 style={{ color: '#C8A951', textAlign: 'center', marginBottom: 5 }}>Awla | أولى — صفحة الاختبار</h1>

      {/* AI Provider Badge */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <span style={{
          display: 'inline-block',
          padding: '8px 20px',
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          background: isAIEnabled() ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)',
          color: isAIEnabled() ? '#22C55E' : '#EAB308',
          border: `1px solid ${isAIEnabled() ? 'rgba(34,197,94,0.3)' : 'rgba(234,179,8,0.3)'}`,
        }}>
          {isAIEnabled() ? '🟢' : '🟡'} {getProviderName()}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <button onClick={testSupabase} disabled={!!loading}
          style={{ padding: '12px', background: '#1B4D3E', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontFamily: 'Tajawal, Arial' }}>
          {loading === 'supabase' ? '⏳ جاري...' : '1️⃣ اختبار Supabase'}
        </button>
        <button onClick={testLocation} disabled={!!loading}
          style={{ padding: '12px', background: '#1B4D3E', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontFamily: 'Tajawal, Arial' }}>
          {loading === 'location' ? '⏳ جاري...' : '2️⃣ اختبار الموقع GPS'}
        </button>
        <button onClick={testDashboard} disabled={!!loading}
          style={{ padding: '12px', background: '#1B4D3E', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontFamily: 'Tajawal, Arial' }}>
          {loading === 'dashboard' ? '⏳ جاري...' : '4️⃣ اختبار الإحصائيات'}
        </button>
      </div>

      <div style={{ background: '#1a2a1a', padding: 15, borderRadius: 8, marginBottom: 15 }}>
        <p style={{ margin: '0 0 10px', color: '#C8A951' }}>3️⃣ اختبار إرسال بلاغ كامل:</p>
        <input type="file" accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          style={{ marginBottom: 10, color: '#fff' }}
        />
        <button onClick={testFullReport} disabled={!!loading || !image}
          style={{ padding: '10px 20px', background: '#C8A951', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold', display: 'block', width: '100%', fontFamily: 'Tajawal, Arial' }}>
          {loading === 'report' ? '⏳ جاري التحليل والإرسال...' : '🚀 إرسال بلاغ تجريبي'}
        </button>
      </div>

      <div style={{ background: '#111', borderRadius: 8, padding: 15, maxHeight: 400, overflowY: 'auto' }}>
        <p style={{ color: '#666', margin: '0 0 10px' }}>📟 Console:</p>
        {log.length === 0 && <p style={{ color: '#444' }}>اضغط على أي زر للاختبار...</p>}
        {log.map((l, i) => (
          <div key={i} style={{ color: colors[l.type], fontSize: 13, marginBottom: 5, direction: 'rtl', textAlign: 'right' }}>
            <span style={{ color: '#555', direction: 'ltr', display: 'inline-block' }}>[{l.time}]</span> {l.msg}
          </div>
        ))}
      </div>
    </div>
  );
}