import React from 'react';
import { Link } from 'react-router-dom';

function Home({ role }) {
  const isGov = role === 'government';
  return (
    <div>
      {/* Hero */}
      <section style={{ ...s.hero, background: isGov ? 'linear-gradient(135deg, #0d1f33 0%, #1a3a5c 50%, #2d5a8e 100%)' : undefined }}>
        <div style={s.heroOverlay} />
        {!isGov && <img src="https://images.unsplash.com/photo-1722966885396-1f3dcebdf27f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920" alt="الرياض" style={s.heroImg} />}
        <div style={s.heroContent} className="fade-up">
          <span style={s.badge}>{isGov ? '🏛️ واجهة الجهات الحكومية' : '🏆 مشروع هاكاثون Vibe Coding 2026'}</span>
          <h1 style={s.heroTitle}>أولى <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>|</span> Awla</h1>
          <p style={s.heroSubtitle}>{isGov ? 'منصة إدارة البلاغات البلدية الذكية' : 'نظام البلاغات الذكي لمدينة الرياض'}</p>
          <p style={s.heroDesc}>
            {isGov
              ? 'تتبع البلاغات، راقب أداء الجهات، واستقبل تحليلات الذكاء الاصطناعي لتحسين الاستجابة'
              : 'بلّغ عن مشاكل البنية التحتية بصورة واحدة — الذكاء الاصطناعي يصنّف ويحدد الأولوية والجهة المسؤولة تلقائياً'
            }
          </p>
          <div style={s.heroBtns}>
            {isGov ? (
              <>
                <Link to="/dashboard" style={{ ...s.btnPrimary, background: '#fff', color: '#1a3a5c' }}>
                  <span>📊</span> لوحة التحكم
                </Link>
                <Link to="/map" style={s.btnGlass}>
                  🗺️ خريطة البلاغات
                </Link>
              </>
            ) : (
              <>
                <Link to="/submit" style={s.btnPrimary}>
                  <span>📸</span> رفع بلاغ جديد
                </Link>
                <Link to="/dashboard" style={s.btnGlass}>
                  📊 لوحة التحكم
                </Link>
                <Link to="/map" style={s.btnGlass}>
                  🗺️ الخريطة
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <h2 style={s.sectionTitle}>واقع البنية التحتية في الرياض</h2>
          <p style={s.sectionDesc}>أرقام حقيقية تعكس حجم التحدي والفرصة</p>
          <div style={s.statsGrid}>
            {[
              { icon: '📄', value: '+106K', label: 'رخص حفر سنوياً', color: '#03471f' },
              { icon: '⚠️', value: '+100K', label: 'بلاغ من المواطنين', color: '#DC2626' },
              { icon: '⏱️', value: '+30%', label: 'حفريات متأخرة', color: '#C5A656' },
              { icon: '📈', value: '85%', label: 'نسبة الإنجاز', color: '#22C55E' },
            ].map((stat, i) => (
              <div key={i} className={`glass fade-up stagger-${i + 1}`} style={{ ...s.statCard, borderTop: `3px solid ${stat.color}` }}>
                <span style={{ fontSize: 32 }}>{stat.icon}</span>
                <div style={{ fontSize: 36, fontWeight: 900, color: stat.color, margin: '10px 0 4px', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: '#6B6560' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: '#fff', padding: '64px 24px' }}>
        <div style={s.sectionInner}>
          <h2 style={s.sectionTitle}>كيف يعمل النظام؟</h2>
          <p style={s.sectionDesc}>3 خطوات بسيطة لتحسين مدينتك</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 40 }}>
            {[
              { step: '01', icon: '📸', title: 'التقط صورة', desc: 'صوّر المشكلة في الشارع — حفرية، تسرب مياه، إنارة معطلة', color: '#03471f' },
              { step: '02', icon: '🤖', title: 'تحليل ذكي', desc: 'الذكاء الاصطناعي يصنّف المشكلة، يحدد الشدة، ويختار الجهة المسؤولة', color: '#C5A656' },
              { step: '03', icon: '📊', title: 'متابعة وحل', desc: 'تتبع حالة البلاغ ومراقبة أداء الجهات عبر لوحة تحكم ذكية', color: '#2563EB' },
            ].map((item, i) => (
              <div key={i} className={`fade-up stagger-${i + 1}`} style={{ textAlign: 'center', padding: '32px 20px' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${item.color}10`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: item.color, marginBottom: 16 }}>
                  {item.step}
                </div>
                <div style={{ fontSize: 48, margin: '0 0 16px' }}>{item.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1613', margin: '0 0 8px' }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: '#6B6560', margin: 0, lineHeight: 1.8 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section style={{ background: 'var(--bg)', padding: '64px 24px' }}>
        <div style={s.sectionInner}>
          <h2 style={s.sectionTitle}>3 طبقات ذكاء اصطناعي</h2>
          <p style={s.sectionDesc}>نظام متكامل يتجاوز التصنيف البسيط</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 36 }}>
            {[
              {
                icon: '🎯', title: 'التحقق من الثقة',
                desc: 'بدل ما نثق بالذكاء الاصطناعي أعمى — نتحقق من مستوى الثقة ونطلب تأكيد المواطن إذا لزم',
                tag: 'Confidence Validation', color: '#22C55E', border: '#22C55E',
              },
              {
                icon: '📍', title: 'التجميع الجغرافي',
                desc: '50 بلاغ لنفس الحفرة؟ نكشف التكرار ونجمع البلاغات المتقاربة في مجموعة واحدة',
                tag: 'Geographic Clustering', color: '#2563EB', border: '#2563EB',
              },
              {
                icon: '⚡', title: 'التصعيد الذكي',
                desc: 'الأولوية ما تنحسب مرة — تزيد مع الوقت والتكرار وعدم الاستجابة',
                tag: 'Smart Escalation', color: '#F97316', border: '#F97316',
              },
            ].map((f, i) => (
              <div key={i} className="glass" style={{ padding: '28px 24px', borderRight: `4px solid ${f.border}`, transition: 'transform 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 28 }}>{f.icon}</span>
                  <span style={{ padding: '3px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700, background: `${f.color}12`, color: f.color, letterSpacing: 0.5 }}>{f.tag}</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1A1613', margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#6B6560', lineHeight: 1.8, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ background: '#fff', padding: '64px 24px' }}>
        <div style={s.sectionInner}>
          <h2 style={s.sectionTitle}>فئات البلاغات</h2>
          <p style={s.sectionDesc}>تغطية شاملة لجميع احتياجات المدينة</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 32 }}>
            {[
              { icon: '🚧', title: 'حفريات', desc: 'متأخرة، مهجورة، بدون ترخيص', bg: 'linear-gradient(135deg, #03471f, #1B7F5F)' },
              { icon: '💧', title: 'بنية تحتية', desc: 'مياه، كهرباء، إنارة', bg: 'linear-gradient(135deg, #C5A656, #D4B870)' },
              { icon: '🚦', title: 'مرورية', desc: 'إشارات، مطبات، يوتيرن', bg: 'linear-gradient(135deg, #2563EB, #3B82F6)' },
              { icon: '💡', title: 'اقتراحات', desc: 'تشجير، مظلات، تحسينات', bg: 'linear-gradient(135deg, #6B7280, #9CA3AF)' },
            ].map((c, i) => (
              <div key={i} style={{ ...s.catCard, background: c.bg }}>
                <span style={{ fontSize: 36, marginBottom: 12 }}>{c.icon}</span>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{c.title}</h3>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.6 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={s.cta}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: '0 0 12px' }}>ابدأ بتحسين مدينتك الآن</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', margin: '0 0 32px', lineHeight: 1.8 }}>
            صورة واحدة تكفي — الذكاء الاصطناعي يتكفل بالباقي
          </p>
          <Link to="/submit" style={s.ctaBtn}>
            📸 رفع بلاغ الآن
          </Link>
        </div>
      </section>
    </div>
  );
}

const s = {
  hero: { position: 'relative', height: '75vh', minHeight: 520, overflow: 'hidden', display: 'flex', alignItems: 'center' },
  heroImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(3,71,31,0.92) 0%, rgba(3,71,31,0.75) 50%, rgba(3,71,31,0.4) 100%)', zIndex: 1 },
  heroContent: { position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '0 40px', width: '100%' },
  badge: { display: 'inline-block', background: 'rgba(197,166,86,0.2)', color: '#C5A656', padding: '8px 18px', borderRadius: 10, fontSize: 13, marginBottom: 20, fontWeight: 600, border: '1px solid rgba(197,166,86,0.3)', fontFamily: "'Tajawal', sans-serif" },
  heroTitle: { fontSize: 'clamp(40px, 5vw, 60px)', fontWeight: 900, color: '#fff', margin: '0 0 10px', fontFamily: "'Tajawal', sans-serif", lineHeight: 1.1 },
  heroSubtitle: { fontSize: 'clamp(18px, 3vw, 26px)', color: 'rgba(255,255,255,0.9)', margin: '0 0 14px', fontWeight: 400 },
  heroDesc: { fontSize: 15, color: 'rgba(255,255,255,0.6)', margin: '0 0 32px', lineHeight: 1.8, maxWidth: 520 },
  heroBtns: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, background: '#C5A656', color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 16px rgba(197,166,86,0.3)', fontFamily: "'Tajawal', sans-serif", transition: 'transform 0.2s' },
  btnGlass: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', backdropFilter: 'blur(8px)', fontFamily: "'Tajawal', sans-serif" },
  section: { padding: '64px 24px' },
  sectionInner: { maxWidth: 1100, margin: '0 auto' },
  sectionTitle: { fontSize: 28, fontWeight: 900, color: '#1A1613', textAlign: 'center', margin: '0 0 6px', fontFamily: "'Tajawal', sans-serif" },
  sectionDesc: { fontSize: 14, color: '#6B6560', textAlign: 'center', margin: '0 0 0', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 36 },
  statCard: { padding: '28px 20px', textAlign: 'center' },
  catCard: { borderRadius: 16, padding: '32px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 160 },
  cta: { padding: '72px 24px', textAlign: 'center', background: 'linear-gradient(135deg, #03471f 0%, #1B7F5F 50%, #03471f 100%)' },
  ctaBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '16px 36px', borderRadius: 14, background: '#C5A656', color: '#fff', fontSize: 17, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.2)', fontFamily: "'Tajawal', sans-serif" },
};

export default Home;
