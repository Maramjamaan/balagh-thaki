import React, { useState, useEffect } from 'react';
import { submitReport, getAllReports, getDashboardStats } from './services/reportService';
import { isAIEnabled } from './services/aiService';

const C = {
  bg: '#050d05', card: 'rgba(27,77,62,0.15)', primary: '#1B4D3E', gold: '#C8A951',
  goldLight: '#e8d5a0', green: '#22C55E', red: '#DC2626', orange: '#F97316',
  yellow: '#EAB308', blue: '#3B82F6', text: '#f0f0f0', muted: '#888', dim: '#555'
};

const severityAr = { critical: 'حرج', high: 'مرتفع', medium: 'متوسط', low: 'منخفض' };
const sevColor = { critical: C.red, high: C.orange, medium: C.yellow, low: C.green };
const statusAr = { pending: 'بانتظار المعالجة', in_progress: 'قيد المعالجة', resolved: 'تم الحل' };

// === Navbar ===
function Navbar({ page, setPage, resetForm }) {
  return (
    <nav style={{
      background: 'rgba(5,13,5,0.95)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(200,169,81,0.15)', padding: '0 20px',
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 60,
      maxWidth: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={resetForm}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #C8A951, #1B4D3E)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 'bold', color: '#fff'
        }}>A</div>
        <span style={{ color: C.gold, fontSize: 20, fontWeight: 'bold', letterSpacing: 1 }}>Awla</span>
      </div>
      <div style={{ display: 'flex', gap: 5 }}>
        {[
          { id: 'home', label: 'الرئيسية' },
          { id: 'report', label: 'بلاغ جديد' },
          { id: 'dashboard', label: 'لوحة التحكم' }
        ].map(item => (
          <button key={item.id} onClick={() => setPage(item.id)}
            style={{
              padding: '8px 16px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13,
              background: page === item.id ? 'rgba(200,169,81,0.15)' : 'transparent',
              color: page === item.id ? C.gold : C.muted,
              transition: 'all 0.3s'
            }}>
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

// === Footer ===
function Footer() {
  return (
    <footer style={{
      background: 'rgba(5,13,5,0.95)', borderTop: '1px solid rgba(200,169,81,0.1)',
      padding: '25px 20px', textAlign: 'center', marginTop: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6,
          background: 'linear-gradient(135deg, #C8A951, #1B4D3E)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 'bold', color: '#fff'
        }}>A</div>
        <span style={{ color: C.gold, fontSize: 14, fontWeight: 'bold' }}>Awla</span>
        <span style={{ color: C.dim, fontSize: 13 }}>| بلاغ ذكي</span>
      </div>
      <p style={{ color: C.dim, fontSize: 11, margin: 0 }}>Vibe Coding Hackathon 2026</p>
      <p style={{ color: '#333', fontSize: 10, margin: '5px 0 0' }}>Powered by AI</p>
    </footer>
  );
}

// === Glow Card ===
function GlowCard({ children, glow = C.primary, style = {} }) {
  return (
    <div style={{
      background: C.card, borderRadius: 16, padding: 22,
      border: '1px solid rgba(200,169,81,0.08)',
      boxShadow: `0 0 30px ${glow}15, inset 0 1px 0 rgba(255,255,255,0.03)`,
      transition: 'transform 0.3s, box-shadow 0.3s',
      ...style
    }}>
      {children}
    </div>
  );
}

// === Stat Card ===
function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: 'rgba(27,77,62,0.1)', borderRadius: 14, padding: '18px 12px',
      textAlign: 'center', border: '1px solid rgba(200,169,81,0.06)',
      position: 'relative', overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 60, height: 60,
        borderRadius: '50%', background: `${color}10`
      }} />
      <div style={{ fontSize: 28, fontWeight: 'bold', color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: C.muted }}>{label}</div>
    </div>
  );
}

// === Priority Ring ===
function PriorityRing({ score, color, label }) {
  const r = 54, circ = 2 * Math.PI * r, offset = circ - (score / 100) * circ;
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
        <text x="65" y="60" textAnchor="middle" fill={color} fontSize="28" fontWeight="bold">{score}</text>
        <text x="65" y="80" textAnchor="middle" fill={C.muted} fontSize="11">{label}</text>
      </svg>
    </div>
  );
}

// === Main App ===
export default function App() {
  const [page, setPage] = useState('home');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (page === 'dashboard') loadDashboard();
  }, [page]);

  const loadDashboard = async () => {
    try {
      const [r, s] = await Promise.all([getAllReports(), getDashboardStats()]);
      setReports(r || []);
      setStats(s);
    } catch (err) { console.error(err); }
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); setError(''); }
  };

  const handleSubmit = async () => {
    if (!image) { setError('اختر صورة اولا'); return; }
    setLoading(true); setError('');
    try {
      const res = await submitReport(image);
      setResult(res); setPage('result');
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const resetForm = () => {
    setImage(null); setPreview(null); setResult(null); setError(''); setPage('home');
  };

  return (
    <div dir="rtl" style={{ background: C.bg, minHeight: '100vh', fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <Navbar page={page} setPage={setPage} resetForm={resetForm} />

      <main style={{ flex: 1, maxWidth: 560, margin: '0 auto', padding: 20, width: '100%' }}>

        {/* ============ HOME ============ */}
        {page === 'home' && (
          <div>
            {/* Hero */}
            <div style={{
              textAlign: 'center', padding: '50px 20px 40px',
              background: 'radial-gradient(ellipse at center, rgba(27,77,62,0.2) 0%, transparent 70%)',
              borderRadius: 20, marginBottom: 30
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: 20, margin: '0 auto 20px',
                background: 'linear-gradient(135deg, #C8A951, #1B4D3E)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 40px rgba(200,169,81,0.2)',
                fontSize: 32, fontWeight: 'bold', color: '#fff'
              }}>A</div>
              <h1 style={{ color: '#fff', fontSize: 30, margin: '0 0 8px', fontWeight: 'bold' }}>بلاغ ذكي</h1>
              <p style={{ color: C.gold, fontSize: 16, margin: '0 0 6px' }}>Balagh Thaki</p>
              <p style={{ color: C.muted, fontSize: 13, maxWidth: 300, margin: '0 auto' }}>
                صور المشكلة والذكاء الاصطناعي يتكفل بالباقي
              </p>
              <div style={{
                display: 'inline-block', marginTop: 12, padding: '4px 12px',
                borderRadius: 20, background: 'rgba(200,169,81,0.1)',
                border: '1px solid rgba(200,169,81,0.2)', fontSize: 11, color: C.gold
              }}>
                {isAIEnabled() ? 'AI Live' : 'Demo Mode'}
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 35 }}>
              <button onClick={() => setPage('report')}
                style={{
                  padding: '18px', border: 'none', borderRadius: 14, fontSize: 16, cursor: 'pointer',
                  background: 'linear-gradient(135deg, #1B4D3E, #2a6b52)', color: '#fff',
                  boxShadow: '0 4px 20px rgba(27,77,62,0.4)', fontWeight: 'bold',
                  transition: 'transform 0.2s'
                }}>
                ارسال بلاغ جديد
              </button>
              <button onClick={() => setPage('dashboard')}
                style={{
                  padding: '18px', borderRadius: 14, fontSize: 16, cursor: 'pointer',
                  background: 'rgba(200,169,81,0.08)', color: C.gold,
                  border: '1px solid rgba(200,169,81,0.2)', fontWeight: 'bold',
                  transition: 'transform 0.2s'
                }}>
                لوحة التحكم
              </button>
            </div>

            {/* How it works */}
            <GlowCard>
              <h3 style={{ color: C.gold, fontSize: 16, margin: '0 0 20px' }}>كيف يعمل النظام؟</h3>
              {[
                { step: '1', title: 'التقط صورة', desc: 'صور المشكلة من جوالك' },
                { step: '2', title: 'تحليل ذكي', desc: 'AI يحدد النوع والشدة تلقائيا' },
                { step: '3', title: 'حساب الاولوية', desc: 'سكور 1-100 حسب 4 عوامل' },
                { step: '4', title: 'ترتيب البلاغات', desc: 'البلدية تستلم البلاغات بالاهمية' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: i < 3 ? 18 : 0 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: `linear-gradient(135deg, ${C.primary}, ${C.gold}20)`,
                    border: '1px solid rgba(200,169,81,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: C.gold, fontSize: 14, fontWeight: 'bold'
                  }}>{s.step}</div>
                  <div>
                    <p style={{ color: '#fff', fontSize: 14, margin: '0 0 3px', fontWeight: 'bold' }}>{s.title}</p>
                    <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </GlowCard>

            {/* Priority Factors */}
            <div style={{ marginTop: 20 }}>
              <h3 style={{ color: C.gold, fontSize: 15, marginBottom: 12 }}>عوامل حساب الاولوية</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'شدة المشكلة', pct: '35%', color: C.red },
                  { label: 'كثافة السكان', pct: '25%', color: C.blue },
                  { label: 'حركة المرور', pct: '20%', color: C.orange },
                  { label: 'تكرار البلاغات', pct: '20%', color: C.yellow },
                ].map((f, i) => (
                  <div key={i} style={{
                    background: C.card, borderRadius: 12, padding: '14px',
                    borderRight: `3px solid ${f.color}`
                  }}>
                    <div style={{ color: '#fff', fontSize: 13, marginBottom: 4 }}>{f.label}</div>
                    <div style={{ color: f.color, fontSize: 18, fontWeight: 'bold' }}>{f.pct}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============ REPORT ============ */}
        {page === 'report' && (
          <div>
            <h2 style={{ color: '#fff', fontSize: 22, marginBottom: 25 }}>ارسال بلاغ جديد</h2>

            {/* Upload Area */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImage(e); }}
              style={{
                background: dragOver ? 'rgba(200,169,81,0.1)' : C.card,
                borderRadius: 16, padding: preview ? 10 : 40, marginBottom: 16,
                border: `2px dashed ${dragOver ? C.gold : 'rgba(200,169,81,0.15)'}`,
                textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s',
                position: 'relative', overflow: 'hidden'
              }}
              onClick={() => document.getElementById('fileInput').click()}
            >
              {preview ? (
                <img src={preview} alt="preview" style={{ maxWidth: '100%', maxHeight: 280, borderRadius: 12 }} />
              ) : (
                <>
                  <div style={{ fontSize: 40, marginBottom: 12, color: C.gold }}>&#8682;</div>
                  <p style={{ color: C.text, fontSize: 15, margin: '0 0 6px' }}>اسحب الصورة هنا او اضغط للاختيار</p>
                  <p style={{ color: C.dim, fontSize: 12, margin: 0 }}>JPG, PNG - صورة المشكلة</p>
                </>
              )}
              <input id="fileInput" type="file" accept="image/*" capture="environment"
                onChange={handleImage} style={{ display: 'none' }} />
            </div>

            {preview && (
              <button onClick={() => { setImage(null); setPreview(null); }}
                style={{ background: 'rgba(220,38,38,0.1)', color: C.red, border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontSize: 12, marginBottom: 16 }}>
                حذف الصورة
              </button>
            )}

            {error && (
              <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: 12, marginBottom: 16 }}>
                <p style={{ color: C.red, fontSize: 13, margin: 0 }}>{error}</p>
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading || !image}
              style={{
                width: '100%', padding: '16px', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 'bold',
                cursor: loading ? 'default' : 'pointer', transition: 'all 0.3s',
                background: loading ? '#222' : !image ? '#1a1a1a' : 'linear-gradient(135deg, #C8A951, #a68a3a)',
                color: loading || !image ? '#555' : '#000',
                boxShadow: image && !loading ? '0 4px 20px rgba(200,169,81,0.3)' : 'none'
              }}>
              {loading ? 'جاري التحليل...' : 'تحليل وارسال البلاغ'}
            </button>

            {loading && (
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <div style={{
                  width: 40, height: 40, border: `3px solid ${C.card}`, borderTopColor: C.gold,
                  borderRadius: '50%', margin: '0 auto 12px',
                  animation: 'spin 1s linear infinite'
                }} />
                <p style={{ color: C.muted, fontSize: 13 }}>الذكاء الاصطناعي يحلل الصورة...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}
          </div>
        )}

        {/* ============ RESULT ============ */}
        {page === 'result' && result && (
          <div>
            <div style={{ textAlign: 'center', padding: '30px 0 25px' }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%', margin: '0 auto 15px',
                background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, color: C.green
              }}>&#10003;</div>
              <h2 style={{ color: '#fff', fontSize: 22, margin: '0 0 5px' }}>تم ارسال البلاغ</h2>
              <p style={{ color: C.muted, fontSize: 13 }}>رقم البلاغ: {result.report.id.slice(0, 8)}</p>
            </div>

            {/* Priority Ring */}
            <GlowCard glow={result.priority.level.color} style={{ textAlign: 'center', marginBottom: 14 }}>
              <PriorityRing score={result.priority.score} color={result.priority.level.color} label={result.priority.level.label} />
              <p style={{ color: C.muted, fontSize: 12, margin: '10px 0 0' }}>درجة الاولوية من 100</p>
            </GlowCard>

            {/* AI Analysis */}
            <GlowCard style={{ marginBottom: 14 }}>
              <h3 style={{ color: C.gold, fontSize: 14, margin: '0 0 16px' }}>تحليل الذكاء الاصطناعي</h3>
              {[
                { label: 'نوع المشكلة', value: result.ai.category_ar, color: '#fff' },
                { label: 'الشدة', value: severityAr[result.ai.severity], color: sevColor[result.ai.severity] },
                { label: 'الدقة', value: Math.round(result.ai.confidence * 100) + '%', color: '#fff' },
                { label: 'الحي', value: result.location.neighborhood, color: '#fff' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <span style={{ color: C.muted, fontSize: 13 }}>{item.label}</span>
                  <span style={{ color: item.color, fontSize: 13, fontWeight: 'bold' }}>{item.value}</span>
                </div>
              ))}
              <p style={{ color: '#999', fontSize: 12, margin: '12px 0 0', lineHeight: 1.7, background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8 }}>{result.ai.description_ar}</p>
            </GlowCard>

            {/* Breakdown */}
            <GlowCard style={{ marginBottom: 20 }}>
              <h3 style={{ color: C.gold, fontSize: 14, margin: '0 0 16px' }}>تفاصيل حساب الاولوية</h3>
              {Object.entries(result.priority.breakdown).map(([k, v], i) => {
                const labels = { severity: 'الشدة', population: 'الكثافة السكانية', traffic: 'حركة المرور', frequency: 'تكرار البلاغات' };
                const colors = { severity: C.red, population: C.blue, traffic: C.orange, frequency: C.yellow };
                return (
                  <div key={k} style={{ marginBottom: i < 3 ? 12 : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: C.muted, fontSize: 12 }}>{labels[k]} ({v.weight})</span>
                      <span style={{ color: colors[k], fontSize: 12, fontWeight: 'bold' }}>{v.score}/100</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
                      <div style={{ width: `${v.score}%`, height: '100%', background: colors[k], borderRadius: 6, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                );
              })}
            </GlowCard>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={resetForm}
                style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #1B4D3E, #2a6b52)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, cursor: 'pointer', fontWeight: 'bold' }}>
                بلاغ جديد
              </button>
              <button onClick={() => setPage('dashboard')}
                style={{ flex: 1, padding: '14px', background: 'rgba(200,169,81,0.08)', color: C.gold, border: '1px solid rgba(200,169,81,0.2)', borderRadius: 12, fontSize: 14, cursor: 'pointer' }}>
                لوحة التحكم
              </button>
            </div>
          </div>
        )}

        {/* ============ DASHBOARD ============ */}
        {page === 'dashboard' && (
          <div>
            <h2 style={{ color: '#fff', fontSize: 22, marginBottom: 20 }}>لوحة التحكم</h2>

            {stats && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
                <StatCard label="اجمالي البلاغات" value={stats.total} color={C.gold} />
                <StatCard label="بانتظار المعالجة" value={stats.pending} color={C.orange} />
                <StatCard label="تم الحل" value={stats.resolved} color={C.green} />
                <StatCard label="بلاغات حرجة" value={stats.critical} color={C.red} />
                <StatCard label="قيد المعالجة" value={stats.inProgress} color={C.blue} />
                <StatCard label="متوسط الاولوية" value={stats.avgScore} color={C.gold} />
              </div>
            )}

            <h3 style={{ color: C.gold, fontSize: 15, marginBottom: 12 }}>البلاغات مرتبة بالاولوية</h3>
            {reports.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: C.dim }}>
                <p style={{ fontSize: 30, marginBottom: 10 }}>&#8709;</p>
                <p>لا توجد بلاغات بعد</p>
              </div>
            )}
            {reports.map((r) => {
              const pColor = r.priority_score >= 80 ? C.red : r.priority_score >= 60 ? C.orange : r.priority_score >= 40 ? C.yellow : C.green;
              return (
                <div key={r.id} style={{
                  background: C.card, borderRadius: 14, padding: 16, marginBottom: 10,
                  borderRight: `4px solid ${pColor}`,
                  border: `1px solid rgba(200,169,81,0.06)`,
                  transition: 'transform 0.2s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{r.category_name || 'غير مصنف'}</span>
                    <div style={{
                      background: `${pColor}15`, padding: '4px 10px', borderRadius: 8,
                      color: pColor, fontSize: 13, fontWeight: 'bold'
                    }}>{r.priority_score}/100</div>
                  </div>
                  <p style={{ color: '#999', fontSize: 12, margin: '0 0 10px', lineHeight: 1.5 }}>{r.description || ''}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.dim }}>
                    <span>{r.neighborhood || 'غير محدد'}</span>
                    <span style={{
                      color: r.status === 'resolved' ? C.green : r.status === 'in_progress' ? C.blue : C.orange,
                      background: r.status === 'resolved' ? 'rgba(34,197,94,0.1)' : r.status === 'in_progress' ? 'rgba(59,130,246,0.1)' : 'rgba(249,115,22,0.1)',
                      padding: '2px 8px', borderRadius: 6
                    }}>{statusAr[r.status]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}