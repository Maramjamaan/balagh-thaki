import React, { useState } from 'react';
import { supabase } from '../supabase';
import { ENTITY_NAMES_AR } from '../services/aiService';

const MOCK_REPORTS = {
  'AW-2026-12345': { id: 'AW-2026-12345', status: 'in_progress', category_ar: 'حفرية متأخرة', created_at: '2026-02-15', neighborhood: 'طريق الملك فهد', priority_score: 87, responsible_entity: 'NWC', description: 'حفرية على طريق رئيسي تسبب ازدحام وتشكل خطر على السلامة' },
  'AW-2026-12346': { id: 'AW-2026-12346', status: 'in_progress', category_ar: 'إنارة معطلة', created_at: '2026-02-16', neighborhood: 'حي النرجس', priority_score: 76, responsible_entity: 'Municipality', description: 'عمود إنارة معطل يسبب خطر على المشاة ليلاً' },
  'AW-2026-12347': { id: 'AW-2026-12347', status: 'new', category_ar: 'تسرب مياه', created_at: '2026-02-17', neighborhood: 'طريق العليا', priority_score: 92, responsible_entity: 'NWC', description: 'تسرب مياه مستمر يسبب تجمع وتضرر الطريق' },
};

const STATUS_AR = { new: 'مستلم', pending: 'قيد المراجعة', in_progress: 'قيد المعالجة', resolved: 'تم الإنجاز' };

function TrackReport() {
  const [reportId, setReportId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const normalizeReport = (r) => ({
    id: r.id,
    status: STATUS_AR[r.status] || r.status || 'غير محدد',
    category: r.category_ar || r.category || 'غير مصنف',
    date: r.created_at ? new Date(r.created_at).toLocaleDateString('sv') : 'غير محدد',
    location: (r.neighborhood || 'غير محدد') + '، الرياض',
    priority: r.priority_score || 0,
    responsible: ENTITY_NAMES_AR[r.responsible_entity] || r.responsible_entity || 'غير محدد',
    description: r.description || r.description_ar || 'لا يوجد وصف',
    timeline: buildTimeline(r),
  });

  const buildTimeline = (r) => {
    const created = new Date(r.created_at || Date.now());
    const day = 86400000;
    const status = r.status || 'new';
    return [
      { date: created.toLocaleDateString('sv'), status: 'تم استلام البلاغ', completed: true },
      { date: new Date(created.getTime() + day).toLocaleDateString('sv'), status: 'قيد المراجعة', completed: status !== 'new' },
      { date: new Date(created.getTime() + 3 * day).toLocaleDateString('sv'), status: 'تم التوجيه للجهة', completed: status === 'in_progress' || status === 'resolved' },
      { date: new Date(created.getTime() + 5 * day).toLocaleDateString('sv'), status: 'قيد المعالجة', completed: status === 'in_progress' || status === 'resolved' },
      { date: 'متوقع ' + new Date(created.getTime() + 10 * day).toLocaleDateString('sv'), status: 'الإنجاز المتوقع', completed: status === 'resolved' },
    ];
  };

  const handleSearch = async () => {
    const id = reportId.trim();
    if (!id) return;
    setSearching(true); setError(''); setReportData(null);

    // 1. أول شيك البيانات الوهمية الثابتة
    if (MOCK_REPORTS[id]) {
      setTimeout(() => {
        setReportData(normalizeReport(MOCK_REPORTS[id]));
        setSearching(false);
      }, 600);
      return;
    }

    // 2. بحث في قاعدة البيانات (Supabase أو Demo Store)
    try {
      // بحث بالـ ID بالضبط
      let { data } = await supabase.from('reports').select('*').eq('id', id).single();

      // لو ما لقى، جرب بحث جزئي (أول 8 حروف من الـ ID)
      if (!data) {
        const { data: allReports } = await supabase.from('reports').select('*');
        if (allReports) {
          data = allReports.find(r =>
            r.id === id ||
            r.id?.startsWith(id) ||
            r.id?.slice(0, 8) === id
          );
        }
      }

      if (data) {
        setReportData(normalizeReport(data));
      } else {
        setError('لم يتم العثور على بلاغ بهذا الرقم');
      }
    } catch (err) {
      setError('لم يتم العثور على بلاغ بهذا الرقم');
    }
    setSearching(false);
  };

  const handleExample = (id) => {
    setReportId(id);
    setSearching(true); setError(''); setReportData(null);
    setTimeout(() => {
      if (MOCK_REPORTS[id]) setReportData(normalizeReport(MOCK_REPORTS[id]));
      setSearching(false);
    }, 600);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 140px)', padding: '48px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }} className="fade-up">
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: '0 0 8px' }}>تتبع البلاغات</h1>
          <p style={{ fontSize: 15, color: '#6B6560' }}>أدخل رقم البلاغ لمتابعة حالته</p>
        </div>

        <div className="glass" style={{ padding: 24, marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <input style={{ flex: 1, height: 52, padding: '0 20px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', fontSize: 15, outline: 'none', fontFamily: "'Tajawal', sans-serif", direction: 'ltr', textAlign: 'right' }} placeholder="أدخل رقم البلاغ أو أول 8 حروف منه" value={reportId} onChange={e => setReportId(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            <button onClick={handleSearch} disabled={searching} style={{ height: 52, padding: '0 28px', background: '#03471f', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: "'Tajawal', sans-serif", display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>🔍 بحث</button>
          </div>
          <p style={{ fontSize: 12, color: '#A0A0A0', marginTop: 8 }}>يمكنك نسخ رقم البلاغ من صفحة النتيجة بعد رفع البلاغ</p>
          {error && <p style={{ color: '#DC2626', fontSize: 14, marginTop: 12 }}>{error}</p>}
        </div>

        {searching && <div style={{ textAlign: 'center', padding: 48 }}><div style={{ width: 44, height: 44, border: '3px solid rgba(3,71,31,0.1)', borderTopColor: '#03471f', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }} /><p style={{ color: '#6B6560', marginTop: 14 }}>جاري البحث...</p></div>}

        {reportData && !searching && (
          <div className="fade-up">
            <div style={{ background: 'linear-gradient(135deg, #03471f, #1B7F5F)', borderRadius: 20, padding: 28, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
                <div><p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '0 0 4px' }}>رقم البلاغ</p><h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0, direction: 'ltr', textAlign: 'right' }}>{reportData.id}</h2></div>
                <div style={{ background: 'rgba(255,255,255,0.15)', padding: '8px 20px', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 600, backdropFilter: 'blur(8px)' }}>{reportData.status}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {[['التاريخ', reportData.date], ['النوع', reportData.category], ['الأولوية', `${reportData.priority}/100`]].map(([l, v], i) => (
                  <div key={i}><p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: '0 0 2px' }}>{l}</p><p style={{ fontSize: 14, color: '#fff', margin: 0, fontWeight: 600 }}>{v}</p></div>
                ))}
              </div>
            </div>

            <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 16px' }}>تفاصيل البلاغ</h3>
              {[['📍 الموقع', reportData.location], ['🏢 الجهة المسؤولة', reportData.responsible]].map(([l, v], i) => (
                <div key={i} style={{ padding: '14px 16px', background: 'rgba(0,0,0,0.02)', borderRadius: 12, marginBottom: 8 }}><p style={{ fontSize: 12, color: '#6B6560', margin: '0 0 2px' }}>{l}</p><p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{v}</p></div>
              ))}
              <p style={{ fontSize: 14, color: '#1A1613', lineHeight: 1.7, margin: '12px 0 0' }}>{reportData.description}</p>
            </div>

            <div className="glass" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 20px' }}>تتبع المعالجة</h3>
              {reportData.timeline.map((item, i, arr) => (
                <div key={i} style={{ display: 'flex', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: item.completed ? '#03471f' : 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.completed ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6560" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
                    </div>
                    {i < arr.length - 1 && <div style={{ width: 3, minHeight: 28, flex: 1, margin: '4px 0', borderRadius: 2, background: item.completed ? '#03471f' : '#E5E0DA' }} />}
                  </div>
                  <div style={{ paddingBottom: 20, paddingTop: 6 }}>
                    <p style={{ fontSize: 14, fontWeight: item.completed ? 600 : 400, color: item.completed ? '#1A1613' : '#6B6560', margin: '0 0 2px' }}>{item.status}</p>
                    <p style={{ fontSize: 12, color: '#A0A0A0', margin: 0 }}>{item.date}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(197,166,86,0.1), rgba(3,71,31,0.1))', borderRadius: 20, padding: 24, border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 24 }}>⚡</span>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>درجة الأولوية</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
                <div style={{ flex: 1, background: '#fff', borderRadius: 10, height: 12, overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)' }}>
                  <div style={{ height: '100%', borderRadius: 10, background: 'linear-gradient(90deg, #C5A656, #03471f)', width: `${reportData.priority}%`, transition: 'width 1s ease' }} />
                </div>
                <span style={{ fontSize: 22, fontWeight: 800 }}>{reportData.priority}/100</span>
              </div>
            </div>
          </div>
        )}

        {!reportData && !searching && !error && (
          <div style={{ background: 'rgba(0,0,0,0.02)', borderRadius: 20, padding: 28, border: '1px solid rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>للتجربة، استخدم أحد هذه الأرقام:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {['AW-2026-12345', 'AW-2026-12346', 'AW-2026-12347'].map(id => (
                <button key={id} onClick={() => handleExample(id)} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: 16, fontSize: 14, cursor: 'pointer', fontFamily: "'Tajawal', sans-serif", direction: 'ltr', transition: 'all 0.2s' }}>{id}</button>
              ))}
            </div>
            <p style={{ fontSize: 13, color: '#6B6560', marginTop: 16, textAlign: 'center' }}>أو ارفع بلاغ جديد وانسخ رقمه من صفحة النتيجة</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackReport;