import React, { useState } from 'react';

// بيانات وهمية مطابقة للفيقما
const MOCK_REPORTS = {
  'AW-2026-12345': {
    id: 'AW-2026-12345', status: 'قيد المعالجة', category: 'حفرية متأخرة',
    date: '2026-02-15', location: 'طريق الملك فهد، الرياض', priority: 87,
    responsible: 'المياه الوطنية (NWC)',
    description: 'حفرية على طريق رئيسي تسبب ازدحام مروري وتشكل خطر على السلامة',
    timeline: [
      { date: '2026-02-15', status: 'تم استلام البلاغ', completed: true },
      { date: '2026-02-16', status: 'قيد المراجعة', completed: true },
      { date: '2026-02-18', status: 'تم التوجيه للجهة المسؤولة', completed: true },
      { date: '2026-02-20', status: 'قيد المعالجة', completed: true },
      { date: 'متوقع 2026-02-25', status: 'الإنجاز المتوقع', completed: false },
    ],
  },
  'AW-2026-12346': {
    id: 'AW-2026-12346', status: 'قيد المعالجة', category: 'إنارة معطلة',
    date: '2026-02-16', location: 'حي النرجس، الرياض', priority: 76,
    responsible: 'الأمانة',
    description: 'عمود إنارة معطل في منطقة سكنية يسبب خطر على المشاة ليلاً',
    timeline: [
      { date: '2026-02-16', status: 'تم استلام البلاغ', completed: true },
      { date: '2026-02-17', status: 'قيد المراجعة', completed: true },
      { date: '2026-02-19', status: 'تم التوجيه للجهة المسؤولة', completed: true },
      { date: '2026-02-21', status: 'قيد المعالجة', completed: false },
      { date: 'متوقع 2026-02-26', status: 'الإنجاز المتوقع', completed: false },
    ],
  },
  'AW-2026-12347': {
    id: 'AW-2026-12347', status: 'عاجل', category: 'تسرب مياه',
    date: '2026-02-17', location: 'طريق العليا، الرياض', priority: 92,
    responsible: 'المياه الوطنية (NWC)',
    description: 'تسرب مياه مستمر يسبب تجمع المياه وتضرر الطريق',
    timeline: [
      { date: '2026-02-17', status: 'تم استلام البلاغ', completed: true },
      { date: '2026-02-18', status: 'قيد المراجعة', completed: true },
      { date: '2026-02-19', status: 'تم التوجيه للجهة المسؤولة', completed: false },
      { date: 'متوقع 2026-02-22', status: 'قيد المعالجة', completed: false },
      { date: 'متوقع 2026-02-27', status: 'الإنجاز المتوقع', completed: false },
    ],
  },
};

function TrackReport() {
  const [reportId, setReportId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = () => {
    const id = reportId.trim();
    if (!id) return;
    setIsSearching(true);
    setError('');
    setReportData(null);

    setTimeout(() => {
      if (MOCK_REPORTS[id]) {
        setReportData(MOCK_REPORTS[id]);
      } else {
        setError('لم يتم العثور على بلاغ بهذا الرقم');
      }
      setIsSearching(false);
    }, 800);
  };

  const handleExampleClick = (id) => {
    setReportId(id);
    setIsSearching(true);
    setError('');
    setReportData(null);
    setTimeout(() => {
      setReportData(MOCK_REPORTS[id]);
      setIsSearching(false);
    }, 800);
  };

  return (
    <div style={s.page}>
      <div style={s.center}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={s.title}>تتبع البلاغات</h1>
          <p style={s.subtitle}>أدخل رقم البلاغ لمتابعة حالته وآخر التحديثات</p>
        </div>

        {/* Search */}
        <div style={s.searchCard}>
          <div style={s.searchRow}>
            <input
              style={s.input}
              placeholder="أدخل رقم البلاغ (مثال: AW-2026-12345)"
              value={reportId}
              onChange={e => setReportId(e.target.value)}
              dir="ltr"
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} disabled={isSearching} style={s.searchBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              بحث
            </button>
          </div>
          {error && <p style={s.error}>{error}</p>}
        </div>

        {/* Loading */}
        {isSearching && (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={s.spinner} />
            <p style={{ color: '#6B6560', marginTop: 14 }}>جاري البحث...</p>
          </div>
        )}

        {/* Results */}
        {reportData && !isSearching && (
          <div>
            {/* Header Gradient Card */}
            <div style={s.headerCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                <div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 6px' }}>رقم البلاغ</p>
                  <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>{reportData.id}</h2>
                </div>
                <div style={s.statusBadge}>{reportData.status}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div><p style={s.headerLabel}>التاريخ</p><p style={s.headerValue}>{reportData.date}</p></div>
                <div><p style={s.headerLabel}>النوع</p><p style={s.headerValue}>{reportData.category}</p></div>
                <div><p style={s.headerLabel}>الأولوية</p><p style={s.headerValue}>{reportData.priority}/100</p></div>
              </div>
            </div>

            {/* Details */}
            <div style={s.card}>
              <h3 style={s.cardTitle}>تفاصيل البلاغ</h3>
              <div style={s.detailRow}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B7F5F" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <div><p style={s.detailLabel}>الموقع</p><p style={s.detailValue}>{reportData.location}</p></div>
              </div>
              <div style={s.detailRow}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4A574" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <div><p style={s.detailLabel}>الجهة المسؤولة</p><p style={s.detailValue}>{reportData.responsible}</p></div>
              </div>
              <div style={{ ...s.detailRow, flexDirection: 'column', gap: 6 }}>
                <p style={s.detailLabel}>الوصف</p>
                <p style={{ ...s.detailValue, lineHeight: 1.7 }}>{reportData.description}</p>
              </div>
            </div>

            {/* Timeline */}
            <div style={s.card}>
              <h3 style={s.cardTitle}>تتبع المعالجة</h3>
              {reportData.timeline.map((item, i, arr) => (
                <div key={i} style={{ display: 'flex', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                      background: item.completed ? '#1B7F5F' : '#F5F1ED',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {item.completed
                        ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B6560" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      }
                    </div>
                    {i < arr.length - 1 && (
                      <div style={{ width: 3, minHeight: 32, flex: 1, margin: '6px 0', borderRadius: 2, background: item.completed ? '#1B7F5F' : '#E5E0DA' }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: 24, paddingTop: 8 }}>
                    <p style={{ fontSize: 15, fontWeight: item.completed ? 500 : 400, color: item.completed ? '#1A1613' : '#6B6560', margin: '0 0 2px' }}>{item.status}</p>
                    <p style={{ fontSize: 13, color: '#A0A0A0', margin: 0 }}>{item.date}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Priority */}
            <div style={s.priorityCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 28 }}>⚡</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>درجة الأولوية</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                <div style={{ flex: 1, background: '#fff', borderRadius: 10, height: 14, overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)' }}>
                  <div style={{ height: '100%', borderRadius: 10, background: 'linear-gradient(90deg, #9D7C5F, #D4A574, #1B7F5F)', width: `${reportData.priority}%`, transition: 'width 1s ease' }} />
                </div>
                <span style={{ fontSize: 22, fontWeight: 700 }}>{reportData.priority}/100</span>
              </div>
              <p style={{ fontSize: 13, color: '#6B6560', margin: 0 }}>يتم حساب الأولوية بناءً على الشدة، الكثافة السكانية، حركة المرور وعوامل أخرى</p>
            </div>
          </div>
        )}

        {/* Example IDs */}
        {!reportData && !isSearching && !error && (
          <div style={s.exampleCard}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px' }}>للتجربة، استخدم أحد هذه الأرقام:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {['AW-2026-12345', 'AW-2026-12346', 'AW-2026-12347'].map(id => (
                <button key={id} onClick={() => handleExampleClick(id)} style={s.exampleBtn}>{id}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: 'calc(100vh - 140px)', padding: '48px 16px' },
  center: { maxWidth: 800, margin: '0 auto' },
  title: { fontSize: 36, fontWeight: 700, color: '#1A1613', margin: '0 0 8px', fontFamily: "'Tajawal', sans-serif" },
  subtitle: { fontSize: 16, color: '#6B6560', margin: 0 },
  searchCard: {
    background: '#fff', borderRadius: 20, padding: 24,
    border: '2px solid rgba(157,124,95,0.15)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    marginBottom: 40,
  },
  searchRow: { display: 'flex', gap: 12 },
  input: {
    flex: 1, height: 56, padding: '0 20px', borderRadius: 14,
    border: '2px solid rgba(157,124,95,0.15)', background: '#fff',
    fontSize: 15, outline: 'none', fontFamily: "'Tajawal', sans-serif",
    color: '#1A1613', direction: 'ltr', textAlign: 'right',
  },
  searchBtn: {
    height: 56, padding: '0 28px', background: '#1B7F5F', color: '#fff',
    border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Tajawal', sans-serif",
    display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
  },
  error: { color: '#D94545', fontSize: 14, marginTop: 12, textAlign: 'right' },
  spinner: {
    width: 44, height: 44, border: '4px solid rgba(27,127,95,0.15)',
    borderTopColor: '#1B7F5F', borderRadius: '50%',
    margin: '0 auto', animation: 'spin 0.8s linear infinite',
  },
  headerCard: {
    background: 'linear-gradient(135deg, #1B7F5F 0%, #D4A574 100%)',
    borderRadius: 20, padding: 32, marginBottom: 20,
  },
  statusBadge: {
    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
    padding: '10px 24px', borderRadius: 14, color: '#fff',
    fontSize: 15, fontWeight: 500, fontFamily: "'Tajawal', sans-serif",
  },
  headerLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 4px' },
  headerValue: { fontSize: 15, color: '#fff', margin: 0, fontWeight: 500 },
  card: {
    background: '#fff', borderRadius: 20, padding: 28,
    border: '2px solid rgba(157,124,95,0.15)', marginBottom: 20,
    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
  },
  cardTitle: { fontSize: 18, fontWeight: 700, margin: '0 0 24px', fontFamily: "'Tajawal', sans-serif" },
  detailRow: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    padding: '16px 20px', background: 'rgba(245,241,237,0.4)',
    borderRadius: 14, marginBottom: 12,
  },
  detailLabel: { fontSize: 13, color: '#6B6560', margin: '0 0 2px' },
  detailValue: { fontSize: 15, color: '#1A1613', margin: 0, fontWeight: 500 },
  priorityCard: {
    background: 'linear-gradient(135deg, rgba(157,124,95,0.15), rgba(212,165,116,0.15))',
    borderRadius: 20, padding: 28, border: '2px solid rgba(157,124,95,0.2)',
  },
  exampleCard: {
    background: 'rgba(245,241,237,0.5)', borderRadius: 20, padding: 28,
    border: '2px solid rgba(157,124,95,0.15)',
  },
  exampleBtn: {
    background: '#fff', border: '2px solid rgba(157,124,95,0.15)',
    borderRadius: 14, padding: 16, fontSize: 14,
    cursor: 'pointer', fontFamily: "'Tajawal', sans-serif",
    color: '#1A1613', textAlign: 'center', direction: 'ltr',
    transition: 'border-color 0.2s',
  },
};

export default TrackReport;