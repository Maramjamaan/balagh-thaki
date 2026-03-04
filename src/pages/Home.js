import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Home({ role }) {
  const isGov = role === 'government';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Apply dark theme for government

    setVisible(true);
  }, [isGov]);

  return (
    <div>
      {/* Hero */}
      <section style={{ ...s.hero, background: isGov ? 'linear-gradient(135deg, #03471f 0%, #065a2b 50%, #03471f 100%)' : undefined }}>
        {!isGov && <img src="https://images.unsplash.com/photo-1722966885396-1f3dcebdf27f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920" alt="الرياض" style={s.heroImg} />}
        <div style={{ background: isGov ? 'linear-gradient(135deg, rgba(13,27,42,0.95), rgba(27,40,56,0.9))' : undefined }} />

        {/* Decorative elements */}
        <div style={s.heroDeco1} />
        <div style={s.heroDeco2} />

        <div style={s.heroContent} className={visible ? 'fade-up' : ''}>
          <span style={s.badge}>
            {isGov ? '🏛️ واجهة الجهات الحكومية' : '🏆 مشروع هاكاثون Vibe Coding 2026'}
          </span>
          <h1 style={s.heroTitle} className="hero-title">
            أولى <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>|</span> <span style={{ color: '#C5A656' }}>Awla</span>
          </h1>
          <p style={s.heroSubtitle} className="hero-subtitle">
            {isGov ? 'منصة إدارة البلاغات البلدية الذكية' : 'نظام البلاغات الذكي لمدينة الرياض'}
          </p>
          <p style={s.heroDesc}>
            {isGov
              ? 'تتبع البلاغات، راقب أداء الجهات، واستقبل تحليلات الذكاء الاصطناعي لتحسين الاستجابة'
              : 'بلّغ عن مشاكل البنية التحتية بصورة واحدة — الذكاء الاصطناعي يصنّف ويحدد الأولوية والجهة المسؤولة تلقائياً'
            }
          </p>
          <div style={s.heroBtns}>
            {isGov ? (
              <>
                <Link to="/dashboard" style={s.btnPrimary}>📊 لوحة التحكم</Link>
                <Link to="/map" style={s.btnGlass}>🗺️ خريطة البلاغات</Link>
              </>
            ) : (
              <>
                <Link to="/submit" style={s.btnPrimary}>📸 رفع بلاغ جديد</Link>
                <Link to="/dashboard" style={s.btnGlass}>📊 لوحة التحكم</Link>
                <Link to="/map" style={s.btnGlass}>🗺️ الخريطة</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '72px 24px', background: 'var(--bg)' }}>
        <div style={s.sectionInner}>
          <h2 style={s.sectionTitle}>واقع البنية التحتية في الرياض</h2>
          <p style={s.sectionDesc}>أرقام حقيقية تعكس حجم التحدي والفرصة</p>
          <div className="stats-grid" style={s.statsGrid}>
            {[
              { icon: '📄', value: '+106K', label: 'رخص حفر سنوياً', color: '#03471f', gradient: 'linear-gradient(135deg, rgba(3,71,31,0.06), rgba(3,71,31,0.02))' },
              { icon: '⚠️', value: '+100K', label: 'بلاغ من المواطنين', color: '#DC2626', gradient: 'linear-gradient(135deg, rgba(220,38,38,0.06), rgba(220,38,38,0.02))' },
              { icon: '⏱️', value: '+30%', label: 'حفريات متأخرة', color: '#C5A656', gradient: 'linear-gradient(135deg, rgba(197,166,86,0.08), rgba(197,166,86,0.02))' },
              { icon: '📈', value: '85%', label: 'نسبة الإنجاز', color: '#22C55E', gradient: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(34,197,94,0.02))' },
            ].map((stat, i) => (
              <div key={i} className={`glass-interactive fade-up stagger-${i + 1}`} style={{ ...s.statCard, background: stat.gradient, borderTop: `3px solid ${stat.color}` }}>
                <span style={{ fontSize: 36, display: 'block', marginBottom: 4 }}>{stat.icon}</span>
                <div style={{ fontSize: 40, fontWeight: 900, color: stat.color, margin: '8px 0 6px', lineHeight: 1, letterSpacing: -1 }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: 'var(--card)', padding: '72px 24px' }}>
        <div style={s.sectionInner}>
          <h2 style={s.sectionTitle}>كيف يعمل النظام؟</h2>
          <p style={s.sectionDesc}>3 خطوات بسيطة لتحسين مدينتك</p>
          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 44 }}>
            {[
              { step: '01', icon: '📸', title: 'التقط صورة', desc: 'صوّر المشكلة في الشارع — حفرية، تسرب مياه، إنارة معطلة', color: '#03471f' },
              { step: '02', icon: '🤖', title: 'تحليل ذكي', desc: 'الذكاء الاصطناعي يصنّف المشكلة، يحدد الشدة، ويختار الجهة المسؤولة', color: '#C5A656' },
              { step: '03', icon: '📊', title: 'متابعة وحل', desc: 'تتبع حالة البلاغ ومراقبة أداء الجهات عبر لوحة تحكم ذكية', color: '#2563EB' },
            ].map((item, i) => (
              <div key={i} className={`glass-interactive fade-up stagger-${i + 1}`} style={{ textAlign: 'center', padding: '36px 24px', position: 'relative', overflow: 'hidden' }}>
                {/* Step number bg */}
                <div style={{ position: 'absolute', top: -10, left: -10, fontSize: 80, fontWeight: 900, color: `${item.color}08`, lineHeight: 1 }}>{item.step}</div>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: `${item.color}12`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: item.color, marginBottom: 16, border: `2px solid ${item.color}20` }}>
                  {item.step}
                </div>
                <div style={{ fontSize: 52, margin: '0 0 16px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}>{item.icon}</div>
                <h3 style={{ fontSize: 19, fontWeight: 800, color: 'var(--text)', margin: '0 0 10px' }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-dim)', margin: 0, lineHeight: 1.8 }}>{item.desc}</p>
                {/* Connector arrow */}
                {i < 2 && <div style={{ position: 'absolute', left: -14, top: '50%', fontSize: 20, color: 'var(--text-faint)', display: 'none' }}>←</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section style={{ background: 'var(--bg)', padding: '72px 24px' }}>
        <div style={s.sectionInner}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 10, background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 12, fontWeight: 700, border: '1px solid var(--primary-border)', marginBottom: 16 }}>AI-Powered</span>
          </div>
          <h2 style={s.sectionTitle}>3 طبقات ذكاء اصطناعي</h2>
          <p style={s.sectionDesc}>نظام متكامل يتجاوز التصنيف البسيط</p>
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginTop: 40 }}>
            {[
              {
                icon: '🎯', title: 'التحقق من الثقة',
                desc: 'بدل ما نثق بالذكاء الاصطناعي أعمى — نتحقق من مستوى الثقة ونطلب تأكيد المواطن إذا لزم',
                tag: 'Confidence Validation', color: '#22C55E',
              },
              {
                icon: '📍', title: 'التجميع الجغرافي',
                desc: '50 بلاغ لنفس الحفرة؟ نكشف التكرار ونجمع البلاغات المتقاربة في مجموعة واحدة',
                tag: 'Geographic Clustering', color: '#2563EB',
              },
              {
                icon: '⚡', title: 'التصعيد الذكي',
                desc: 'الأولوية ما تنحسب مرة — تزيد مع الوقت والتكرار وعدم الاستجابة',
                tag: 'Smart Escalation', color: '#F97316',
              },
            ].map((f, i) => (
              <div key={i} className={`glass-interactive fade-up stagger-${i + 1}`} style={{ padding: '28px 24px', borderRight: `4px solid ${f.color}`, position: 'relative', overflow: 'hidden' }}>
                {/* Glow bg */}
                <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `${f.color}08`, filter: 'blur(20px)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, position: 'relative' }}>
                  <span style={{ fontSize: 32 }}>{f.icon}</span>
                  <span style={{ padding: '4px 12px', borderRadius: 8, fontSize: 10, fontWeight: 700, background: `${f.color}12`, color: f.color, letterSpacing: 0.5 }}>{f.tag}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: '0 0 10px', position: 'relative' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.9, margin: 0, position: 'relative' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ background: 'var(--card)', padding: '72px 24px' }}>
        <div style={s.sectionInner}>
          <h2 style={s.sectionTitle}>فئات البلاغات</h2>
          <p style={s.sectionDesc}>تغطية شاملة لجميع احتياجات المدينة</p>
          <div className="categories-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 36 }}>
            {[
              { icon: '🚧', title: 'حفريات', desc: 'متأخرة، مهجورة، بدون ترخيص', bg: 'linear-gradient(135deg, #03471f, #065a2b)' },
              { icon: '💧', title: 'بنية تحتية', desc: 'مياه، كهرباء، إنارة', bg: 'linear-gradient(135deg, #C5A656, #D4B870)' },
              { icon: '🚦', title: 'مرورية', desc: 'إشارات، مطبات، يوتيرن', bg: 'linear-gradient(135deg, #2563EB, #3B82F6)' },
              { icon: '💡', title: 'اقتراحات', desc: 'تشجير، مظلات، تحسينات', bg: 'linear-gradient(135deg, #6B7280, #9CA3AF)' },
            ].map((c, i) => (
              <div key={i} className={`fade-up stagger-${i + 1}`} style={{
                ...s.catCard, background: c.bg,
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <span style={{ fontSize: 40, marginBottom: 14, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' }}>{c.icon}</span>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>{c.title}</h3>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.7 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={s.cta}>
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(197,166,86,0.08)', top: -60, right: -40, filter: 'blur(40px)' }} />
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, color: '#fff', margin: '0 0 14px', position: 'relative' }}>ابدأ بتحسين مدينتك الآن</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', margin: '0 0 36px', lineHeight: 1.8, position: 'relative' }}>
            صورة واحدة تكفي — الذكاء الاصطناعي يتكفل بالباقي
          </p>
          <Link to="/submit" style={{
            ...s.ctaBtn,
            transition: 'all 0.3s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(197,166,86,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)'; }}
          >
            📸 رفع بلاغ الآن
          </Link>
        </div>
      </section>
    </div>
  );
}

const s = {
  hero: { position: 'relative', height: '80vh', minHeight: 560, overflow: 'hidden', display: 'flex', alignItems: 'center' },
  heroImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', animation: 'fadeIn 1.5s ease' },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(3,71,31,0.93) 0%, rgba(3,71,31,0.78) 45%, rgba(3,71,31,0.35) 100%)', zIndex: 1 },
  heroDeco1: { position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(197,166,86,0.06)', top: '10%', left: '5%', zIndex: 1, filter: 'blur(60px)', animation: 'float 8s ease-in-out infinite' },
  heroDeco2: { position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', bottom: '15%', right: '10%', zIndex: 1, filter: 'blur(40px)', animation: 'float 6s ease-in-out infinite reverse' },
  heroContent: { position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '0 40px', width: '100%' },
  badge: { display: 'inline-block', background: 'rgba(197,166,86,0.15)', color: '#C5A656', padding: '8px 20px', borderRadius: 12, fontSize: 13, marginBottom: 22, fontWeight: 600, border: '1px solid rgba(197,166,86,0.25)', fontFamily: "'Tajawal', sans-serif", backdropFilter: 'blur(8px)' },
  heroTitle: { fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 900, color: '#fff', margin: '0 0 12px', fontFamily: "'Tajawal', sans-serif", lineHeight: 1.1, letterSpacing: -1 },
  heroSubtitle: { fontSize: 'clamp(18px, 3vw, 26px)', color: 'rgba(255,255,255,0.9)', margin: '0 0 14px', fontWeight: 400 },
  heroDesc: { fontSize: 15, color: 'rgba(255,255,255,0.55)', margin: '0 0 36px', lineHeight: 1.9, maxWidth: 520 },
  heroBtns: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 30px', borderRadius: 14, background: '#C5A656', color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(197,166,86,0.3)', fontFamily: "'Tajawal', sans-serif", transition: 'all 0.3s ease' },
  btnGlass: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 26px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', backdropFilter: 'blur(12px)', fontFamily: "'Tajawal', sans-serif", transition: 'all 0.3s ease' },
  sectionInner: { maxWidth: 1100, margin: '0 auto' },
  sectionTitle: { fontSize: 30, fontWeight: 900, color: 'var(--text)', textAlign: 'center', margin: '0 0 8px', fontFamily: "'Tajawal', sans-serif", letterSpacing: -0.5 },
  sectionDesc: { fontSize: 15, color: 'var(--text-dim)', textAlign: 'center', margin: '0 auto', maxWidth: 500 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 40 },
  statCard: { padding: '32px 20px', textAlign: 'center', borderRadius: 20 },
  catCard: { borderRadius: 20, padding: '36px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 170 },
  cta: { padding: '80px 24px', textAlign: 'center', background: 'linear-gradient(135deg, #03471f 0%, #065a2b 50%, #03471f 100%)', position: 'relative', overflow: 'hidden' },
  ctaBtn: { display: 'inline-flex', alignItems: 'center', gap: 10, padding: '17px 40px', borderRadius: 16, background: '#C5A656', color: '#fff', fontSize: 17, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.2)', fontFamily: "'Tajawal', sans-serif", position: 'relative' },
};

export default Home;
