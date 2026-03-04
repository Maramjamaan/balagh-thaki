import React from 'react';
import { Link } from 'react-router-dom';

function Home({ role }) {
  const isGov = role === 'government';
  return (
    <div>
      {/* Hero */}
      <section style={s.hero}>
        <img src="https://images.unsplash.com/photo-1722966885396-1f3dcebdf27f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920" alt="الرياض" style={s.heroImg} onError={(e) => { e.target.style.display = 'none'; }} />
        <div style={s.heroOverlay} />
        <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'rgba(197,166,86,0.06)', top: '10%', left: '5%', zIndex: 1, filter: 'blur(60px)', animation: 'float 8s ease-in-out infinite' }} />

        <div style={s.heroContent} className="fade-up">
          <span style={s.badge}>
            {isGov ? '🏛️ واجهة الجهات الحكومية' : '🏆 مشروع هاكاثون Vibe Coding 2026'}
          </span>
          <h1 style={s.heroTitle} className="hero-title">
            أولى <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>|</span>{' '}
            <span style={{ color: '#C5A656' }}>Awla</span>
          </h1>
          <p style={s.heroSubtitle} className="hero-subtitle">
            {isGov
              ? 'نظام ذكي لمراقبة الحفريات المتأخرة وأداء الجهات'
              : 'أول نظام ذكي لرصد الحفريات المتأخرة في شوارع الرياض'
            }
          </p>
          <p style={s.heroDesc} className="hero-desc">
            {isGov
              ? 'راقب حالة الحفريات، تتبع التأخيرات، وقارن أداء شركات الخدمات — بالذكاء الاصطناعي'
              : 'صوّر الحفرية والذكاء الاصطناعي يحدد نوعها ومرحلتها وعمرها والجهة المسؤولة — ويكشف التأخير تلقائياً'
            }
          </p>
          <div style={s.heroBtns} className="hero-btns">
            {isGov ? (
              <>
                <Link to="/dashboard" style={s.btnPrimary}>📊 لوحة المراقبة</Link>
                <Link to="/map" style={s.btnGlass}>🗺️ خريطة الحفريات</Link>
              </>
            ) : (
              <>
                <Link to="/submit" style={s.btnPrimary}>📸 بلّغ عن حفرية</Link>
                <Link to="/dashboard" style={s.btnGlass}>📊 لوحة التحكم</Link>
                <Link to="/map" style={s.btnGlass}>🗺️ خريطة الحفريات</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Problem - Stats from Research */}
      <section style={{ padding: '72px 24px', background: 'var(--bg)' }}>
        <div style={s.sectionInner}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 10, background: 'rgba(220,38,38,0.06)', color: '#DC2626', fontSize: 12, fontWeight: 700, border: '1px solid rgba(220,38,38,0.12)', marginBottom: 16 }}>المشكلة</span>
          </div>
          <h2 style={s.sectionTitle} className="section-title">الرياض: مدينة الحفريات التي لا تنتهي</h2>
          <p style={s.sectionDesc}>أرقام حقيقية من أمانة الرياض ومركز البنية التحتية RIPC</p>
          <div className="stats-grid" style={s.statsGrid}>
            {[
              { icon: '📄', value: '+106K', label: 'رخصة حفر سنوياً', sub: 'بمعدل 500+ يومياً', color: '#03471f' },
              { icon: '⚠️', value: '+100K', label: 'شكوى من المواطنين', sub: 'بسبب الحفريات سنوياً', color: '#DC2626' },
              { icon: '⏱️', value: '+30%', label: 'حفريات متأخرة', sub: 'تجاوزت مدة الترخيص', color: '#F97316' },
              { icon: '🚗', value: '15%', label: 'من ازدحام الرياض', sub: 'بسبب أعمال الحفر', color: '#C5A656' },
            ].map((stat, i) => (
              <div key={i} className={`glass-interactive fade-up stagger-${i + 1}`}
                style={{ padding: '32px 20px', textAlign: 'center', borderRadius: 20, borderTop: `3px solid ${stat.color}` }}>
                <span style={{ fontSize: 36, display: 'block', marginBottom: 4 }}>{stat.icon}</span>
                <div style={{ fontSize: 40, fontWeight: 900, color: stat.color, margin: '8px 0 4px', lineHeight: 1, letterSpacing: -1 }}>{stat.value}</div>
                <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{stat.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gap - What's Missing */}
      <section style={{ background: '#fff', padding: '72px 24px' }}>
        <div style={s.sectionInner}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 10, background: 'rgba(234,179,8,0.08)', color: '#B45309', fontSize: 12, fontWeight: 700, border: '1px solid rgba(234,179,8,0.15)', marginBottom: 16 }}>الفجوة</span>
          </div>
          <h2 style={s.sectionTitle} className="section-title">أنظمة موجودة — لكن الحلقة مفقودة</h2>
          <p style={s.sectionDesc}>نسّق وبلدي ومدينتي يخدمون التراخيص — لكن لا أحد يكشف التأخير</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 36 }} className="info-grid">
            <div className="glass" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-dim)', margin: '0 0 16px' }}>الأنظمة الحالية</h3>
              {[
                { text: 'منصة نسّق: تراخيص حكومية G2G فقط', icon: '🔒' },
                { text: 'تطبيق مدينتي: بلاغات عامة بدون تخصص', icon: '📱' },
                { text: 'بلدي: يعامل الحفريات كبلاغ بلدي عادي', icon: '📋' },
                { text: 'RIPC: رقابة جولات ميدانية — بدون مشاركة مواطن', icon: '🏛️' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{item.text}</span>
                </div>
              ))}
            </div>
            <div className="glass" style={{ padding: 24, borderRight: '4px solid #03471f' }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#03471f', margin: '0 0 16px' }}>أولى يسد الفجوة</h3>
              {[
                { text: 'AI يحلل صور الحفريات ويحدد مرحلتها وعمرها', icon: '🤖' },
                { text: 'يكشف تجاوز مدة الترخيص تلقائياً', icon: '⏱️' },
                { text: 'يجمع بلاغات نفس الحفرية ذكياً', icon: '📍' },
                { text: 'ترتيب شفاف: أي شركة هي الأكثر تأخيراً؟', icon: '🏆' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-dim)', marginTop: 20, fontStyle: 'italic' }}>أولى يُكمّل عمل RIPC ومنصة نسّق — لا ينافسهم</p>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: 'var(--bg)', padding: '72px 24px' }}>
        <div style={s.sectionInner}>
          <h2 style={s.sectionTitle} className="section-title">كيف يعمل أولى؟</h2>
          <p style={s.sectionDesc}>3 خطوات لكشف الحفريات المتأخرة</p>
          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 44 }}>
            {[
              { step: '01', icon: '📸', title: 'صوّر الحفرية', desc: 'التقط صورة لأي حفرية في الشارع — الذكاء الاصطناعي يبدأ التحليل فوراً', color: '#03471f' },
              { step: '02', icon: '🤖', title: 'تحليل متخصص', desc: 'AI يحدد: نوعها، مرحلتها (نشطة/مهجورة)، عمرها التقديري، حالة الترخيص، والجهة المسؤولة', color: '#C5A656' },
              { step: '03', icon: '📊', title: 'رصد وضغط', desc: 'البلاغات تتجمع، الأولوية تتصاعد مع الوقت، والـ Leaderboard يكشف الجهة الأكثر تأخيراً', color: '#DC2626' },
            ].map((item, i) => (
              <div key={i} className={`glass-interactive fade-up stagger-${i + 1}`}
                style={{ textAlign: 'center', padding: '36px 24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -10, left: -10, fontSize: 80, fontWeight: 900, color: `${item.color}08`, lineHeight: 1 }}>{item.step}</div>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: `${item.color}12`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, color: item.color, marginBottom: 16, border: `2px solid ${item.color}20` }}>{item.step}</div>
                <div style={{ fontSize: 52, margin: '0 0 16px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.08))' }}>{item.icon}</div>
                <h3 style={{ fontSize: 19, fontWeight: 800, color: 'var(--text)', margin: '0 0 10px' }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-dim)', margin: 0, lineHeight: 1.8 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section style={{ background: '#fff', padding: '72px 24px' }}>
        <div style={s.sectionInner}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <span style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 10, background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 12, fontWeight: 700, border: '1px solid var(--primary-border)', marginBottom: 16 }}>AI-Powered</span>
          </div>
          <h2 style={s.sectionTitle} className="section-title">3 طبقات ذكاء اصطناعي</h2>
          <p style={s.sectionDesc}>ليس مجرد تصنيف — نظام رقابة ذكي متكامل</p>
          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginTop: 40 }}>
            {[
              { icon: '🎯', title: 'التحقق من الثقة', desc: 'AI يحلل الصورة ويتحقق من نفسه — إذا الثقة منخفضة يطلب تأكيد المواطن بدل ما يصنّف غلط', tag: 'Confidence Validation', color: '#22C55E' },
              { icon: '📍', title: 'التجميع الجغرافي', desc: '50 بلاغ لنفس الحفرية؟ نكشفهم ونجمعهم — البلاغات المتكررة ترفع الأولوية بدل ما تكون عبء', tag: 'Geographic Clustering', color: '#2563EB' },
              { icon: '⚡', title: 'التصعيد الذكي', desc: 'الأولوية تتصاعد تلقائياً: كل يوم تأخير = ضغط أكبر. حفرية بدون حواجز + تعيق المرور = حالة حرجة', tag: 'Smart Escalation', color: '#F97316' },
            ].map((f, i) => (
              <div key={i} className={`glass-interactive fade-up stagger-${i + 1}`}
                style={{ padding: '28px 24px', borderRight: `4px solid ${f.color}`, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `${f.color}08`, filter: 'blur(20px)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, position: 'relative' }}>
                  <span style={{ fontSize: 32 }}>{f.icon}</span>
                  <span style={{ padding: '4px 12px', borderRadius: 8, fontSize: 10, fontWeight: 700, background: `${f.color}12`, color: f.color }}>{f.tag}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: '0 0 10px', position: 'relative' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.9, margin: 0, position: 'relative' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Excavation Types */}
      <section style={{ background: 'var(--bg)', padding: '72px 24px' }}>
        <div style={s.sectionInner}>
          <h2 style={s.sectionTitle} className="section-title">أنواع الحفريات التي نرصدها</h2>
          <p style={s.sectionDesc}>AI متخصص يميّز بين 6 أنواع مختلفة</p>
          <div className="categories-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 36 }}>
            {[
              { icon: '⏱️', title: 'متأخرة عن الترخيص', desc: 'تجاوزت المدة المحددة (30-60 يوم)', bg: 'linear-gradient(135deg, #F97316, #EA580C)' },
              { icon: '🚫', title: 'مهجورة', desc: 'لا عمال ولا معدات — منسية تماماً', bg: 'linear-gradient(135deg, #DC2626, #B91C1C)' },
              { icon: '🔄', title: 'حفر بعد السفلتة', desc: 'شارع جديد يُشق مرة ثانية — غياب تنسيق', bg: 'linear-gradient(135deg, #C5A656, #B8943F)' },
              { icon: '⚠️', title: 'بدون حواجز سلامة', desc: 'مكشوفة بدون تحذير — خطر مباشر', bg: 'linear-gradient(135deg, #7C3AED, #6D28D9)' },
              { icon: '📋', title: 'بدون ترخيص ظاهر', desc: 'لا توجد لوحة ترخيص مرئية', bg: 'linear-gradient(135deg, #2563EB, #1D4ED8)' },
              { icon: '🚧', title: 'نشطة', desc: 'أعمال جارية — نراقب الالتزام بالمدة', bg: 'linear-gradient(135deg, #03471f, #065a2b)' },
            ].map((c, i) => (
              <div key={i} className={`fade-up stagger-${i + 1}`}
                style={{ borderRadius: 20, padding: '28px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 150, background: c.bg, transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <span style={{ fontSize: 36, marginBottom: 10 }}>{c.icon}</span>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{c.title}</h3>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.6 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Players */}
      <section style={{ background: '#fff', padding: '72px 24px' }}>
        <div style={s.sectionInner}>
          <h2 style={s.sectionTitle} className="section-title">الجهات المسؤولة عن الحفريات</h2>
          <p style={s.sectionDesc}>أولى يراقب ويقارن أداء كل جهة بشفافية</p>
          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 36 }}>
            {[
              { name: 'المياه الوطنية NWC', share: '33,829 رخصة', desc: 'المتصدر الأكبر — أكثر من نصف رخص الحفر', color: '#2563EB' },
              { name: 'السعودية للكهرباء SEC', share: '26,390 رخصة', desc: 'ثاني أكبر حفّار — كابلات كهربائية', color: '#F97316' },
              { name: 'STC + موبايلي + زين', share: 'آلاف الرخص', desc: 'ألياف ضوئية واتصالات — "كل جهة تحفر وكأنها دولة"', color: '#22C55E' },
            ].map((entity, i) => (
              <div key={i} className={`glass-interactive fade-up stagger-${i + 1}`} style={{ padding: 24, borderTop: `3px solid ${entity.color}` }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: '0 0 4px' }}>{entity.name}</h3>
                <p style={{ fontSize: 13, fontWeight: 700, color: entity.color, margin: '0 0 10px' }}>{entity.share}</p>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: 0, lineHeight: 1.7 }}>{entity.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={s.cta}>
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 900, color: '#fff', margin: '0 0 14px', position: 'relative' }}>
            ساعد في كشف الحفريات المتأخرة
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', margin: '0 0 36px', lineHeight: 1.8, position: 'relative' }}>
            صورة واحدة لحفرية في شارعك — والذكاء الاصطناعي يتكفل بالباقي
          </p>
          <Link to="/submit" style={{ ...s.ctaBtn, transition: 'all 0.3s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(197,166,86,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.2)'; }}>
            📸 بلّغ عن حفرية الآن
          </Link>
        </div>
      </section>
    </div>
  );
}

const s = {
  hero: { position: 'relative', height: '80vh', minHeight: 560, overflow: 'hidden', display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #03471f 0%, #065a2b 50%, #03471f 100%)' },
  heroImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', animation: 'fadeIn 1.5s ease' },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(3,71,31,0.93) 0%, rgba(3,71,31,0.78) 45%, rgba(3,71,31,0.35) 100%)', zIndex: 1 },
  heroContent: { position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '0 40px', width: '100%' },
  badge: { display: 'inline-block', background: 'rgba(197,166,86,0.15)', color: '#C5A656', padding: '8px 20px', borderRadius: 12, fontSize: 13, marginBottom: 22, fontWeight: 600, border: '1px solid rgba(197,166,86,0.25)', fontFamily: "'Tajawal', sans-serif", backdropFilter: 'blur(8px)' },
  heroTitle: { fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, color: '#fff', margin: '0 0 12px', fontFamily: "'Tajawal', sans-serif", lineHeight: 1.1, letterSpacing: -1 },
  heroSubtitle: { fontSize: 'clamp(16px, 3vw, 26px)', color: 'rgba(255,255,255,0.9)', margin: '0 0 14px', fontWeight: 400 },
  heroDesc: { fontSize: 15, color: 'rgba(255,255,255,0.55)', margin: '0 0 36px', lineHeight: 1.9, maxWidth: 520 },
  heroBtns: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 30px', borderRadius: 14, background: '#C5A656', color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(197,166,86,0.3)', fontFamily: "'Tajawal', sans-serif", transition: 'all 0.3s ease' },
  btnGlass: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 26px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', backdropFilter: 'blur(12px)', fontFamily: "'Tajawal', sans-serif", transition: 'all 0.3s ease' },
  sectionInner: { maxWidth: 1100, margin: '0 auto' },
  sectionTitle: { fontSize: 30, fontWeight: 900, color: 'var(--text)', textAlign: 'center', margin: '0 0 8px', fontFamily: "'Tajawal', sans-serif", letterSpacing: -0.5 },
  sectionDesc: { fontSize: 15, color: 'var(--text-dim)', textAlign: 'center', margin: '0 auto', maxWidth: 500 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 40 },
  cta: { padding: '80px 24px', textAlign: 'center', background: 'linear-gradient(135deg, #03471f 0%, #065a2b 50%, #03471f 100%)', position: 'relative', overflow: 'hidden' },
  ctaBtn: { display: 'inline-flex', alignItems: 'center', gap: 10, padding: '17px 40px', borderRadius: 16, background: '#C5A656', color: '#fff', fontSize: 17, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.2)', fontFamily: "'Tajawal', sans-serif", position: 'relative' },
};

export default Home;
