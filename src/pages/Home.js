import React from 'react';
import { Link } from 'react-router-dom';

function Home({ role }) {
  const isGov = role === 'government';
  return (
    <div style={{ background: '#0a0a0a' }}>
      {/* === HERO — Dark, Modern, KAFD Night === */}
      <section style={s.hero}>
        <img
          src="https://opti.kafd.sa/globalassets/images/pages/area-1/hero-landing-prl-1.09.jpg"
          alt="KAFD الرياض"
          style={s.heroImg}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div style={s.heroOverlay} />

        {/* Subtle glow */}
        <div style={{ position: 'absolute', bottom: '-20%', left: '30%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(3,71,31,0.15)', filter: 'blur(120px)', zIndex: 1 }} />

        <div style={s.heroContent} className="fade-up">
          <div style={s.badge}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C5A656', animation: 'pulse 2s infinite' }} />
            <span>{isGov ? 'واجهة الجهات الحكومية' : 'مشروع هاكاثون Vibe Coding 2026'}</span>
          </div>

          <h1 style={s.heroTitle} className="hero-title">
            <span style={{ display: 'block', fontSize: 'clamp(14px, 2vw, 18px)', fontWeight: 400, color: 'rgba(255,255,255,0.4)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 12 }}>Smart Excavation Monitor</span>
            أولى <span style={{ color: '#C5A656' }}>Awla</span>
          </h1>

          <p style={s.heroSubtitle} className="hero-subtitle">
            {isGov
              ? 'مراقبة الحفريات المتأخرة وأداء شركات الخدمات بالذكاء الاصطناعي'
              : 'أول نظام ذكي يربط صورة الحفرية بترخيصها ويكشف التأخير تلقائياً'
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
                <Link to="/dashboard" style={s.btnGlass}>📊 لوحة المراقبة</Link>
                <Link to="/map" style={s.btnGlass}>🗺️ الخريطة</Link>
              </>
            )}
          </div>

          {/* Mini stats in hero */}
          <div style={s.heroStats} className="fade-up">
            {[
              { value: '+106K', label: 'رخصة حفر سنوياً' },
              { value: '+30%', label: 'حفريات متأخرة' },
              { value: '+100K', label: 'شكوى مواطنين' },
            ].map((stat, i) => (
              <div key={i} style={s.heroStat}>
                <span style={{ fontSize: 24, fontWeight: 900, color: '#C5A656' }}>{stat.value}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom wave transition */}
        <div style={{ position: 'absolute', bottom: -2, left: 0, right: 0, zIndex: 3 }}>
          <svg viewBox="0 0 1440 80" fill="none" style={{ display: 'block', width: '100%' }}>
            <path d="M0 40 C360 80 1080 0 1440 40 L1440 80 L0 80 Z" fill="#FAFAF8" />
          </svg>
        </div>
      </section>

      {/* === GAP — Side by Side === */}
      <section style={{ padding: '80px 24px', background: '#FAFAF8' }}>
        <div style={s.inner}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={s.sectionBadge}>الفجوة</span>
            <h2 style={s.sectionTitle} className="section-title">أنظمة موجودة — لكن الحلقة مفقودة</h2>
            <p style={s.sectionDesc}>كل جهة تشوف جزء من المشكلة — ما أحد يشوف الصورة الكاملة</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="info-grid">
            {/* Current Systems */}
            <div style={{ ...s.card, borderTop: '3px solid rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#A0A0A0', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: 1 }}>الأنظمة الحالية</h3>
              {[
                { text: 'نسّق — تراخيص حكومية G2G فقط', icon: '🔒' },
                { text: 'مدينتي — بلاغات عامة بدون تخصص', icon: '📱' },
                { text: 'بلدي — يعامل الحفريات كبلاغ عادي', icon: '📋' },
                { text: 'RIPC — رقابة ميدانية بدون مشاركة مواطن', icon: '🏛️' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <span style={{ fontSize: 18, opacity: 0.7 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: '#6B6560', lineHeight: 1.6 }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Awla */}
            <div style={{ ...s.card, borderTop: '3px solid #03471f', background: 'linear-gradient(180deg, rgba(3,71,31,0.03) 0%, #fff 100%)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#03471f', margin: '0 0 20px', textTransform: 'uppercase', letterSpacing: 1 }}>أولى يسد الفجوة</h3>
              {[
                { text: 'AI يحلل الصورة ويحدد النوع والمرحلة والعمر', icon: '🤖' },
                { text: 'GPS يطابق مع ترخيص الحفر ويحسب التأخير', icon: '📋' },
                { text: 'يجمع بلاغات نفس الحفرية ويرفع الأولوية', icon: '📍' },
                { text: 'ترتيب شفاف — أي شركة هي الأكثر تأخيراً', icon: '🏆' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: '#1A1613', fontWeight: 500, lineHeight: 1.6 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#A0A0A0', marginTop: 24, fontStyle: 'italic' }}>أولى يُكمّل عمل RIPC ومنصة نسّق — لا ينافسهم</p>
        </div>
      </section>

      {/* === HOW IT WORKS — 3 Steps === */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={s.inner}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ ...s.sectionBadge, background: 'rgba(3,71,31,0.06)', color: '#03471f', borderColor: 'rgba(3,71,31,0.12)' }}>كيف يعمل</span>
            <h2 style={s.sectionTitle} className="section-title">3 خطوات لكشف التأخير</h2>
          </div>

          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { num: '01', icon: '📸', title: 'صوّر الحفرية', desc: 'التقط صورة لأي حفرية — GPS يتحدد تلقائياً', color: '#03471f' },
              { num: '02', icon: '🤖', title: 'AI يحلل + يطابق', desc: 'يحدد النوع والمرحلة والعمر — ويبحث عن ترخيص مطابق في قاعدة البيانات', color: '#C5A656' },
              { num: '03', icon: '📊', title: 'رصد وتصعيد', desc: 'الأولوية تتصاعد مع الوقت — والـ Leaderboard يكشف أي جهة تتأخر', color: '#DC2626' },
            ].map((item, i) => (
              <div key={i} className={`glass-interactive fade-up stagger-${i + 1}`}
                style={{ padding: '36px 28px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 16, right: 20, fontSize: 48, fontWeight: 900, color: `${item.color}08`, lineHeight: 1 }}>{item.num}</div>
                <div style={{ fontSize: 44, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1613', margin: '0 0 8px' }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: '#6B6560', margin: 0, lineHeight: 1.8 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === AI LAYERS === */}
      <section style={{ padding: '80px 24px', background: '#FAFAF8' }}>
        <div style={s.inner}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ ...s.sectionBadge, background: 'rgba(37,99,235,0.06)', color: '#2563EB', borderColor: 'rgba(37,99,235,0.12)' }}>AI-Powered</span>
            <h2 style={s.sectionTitle} className="section-title">3 طبقات ذكاء اصطناعي</h2>
            <p style={s.sectionDesc}>ليس مجرد تصنيف — نظام رقابة ذكي متكامل</p>
          </div>

          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { icon: '🎯', title: 'التحقق من الثقة', desc: 'AI يراجع نفسه — لو الثقة منخفضة يطلب تأكيد المواطن', tag: 'Confidence', color: '#22C55E' },
              { icon: '📍', title: 'التجميع الجغرافي', desc: 'يكشف بلاغات نفس الحفرية ويجمعها — العدد يرفع الأولوية', tag: 'Clustering', color: '#2563EB' },
              { icon: '⚡', title: 'التصعيد الذكي', desc: 'كل يوم تأخير = ضغط أكبر. بدون حواجز + مرور = حالة حرجة', tag: 'Escalation', color: '#F97316' },
            ].map((f, i) => (
              <div key={i} className={`glass-interactive fade-up stagger-${i + 1}`}
                style={{ padding: '28px 24px', borderRight: `3px solid ${f.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 28 }}>{f.icon}</span>
                  <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: `${f.color}10`, color: f.color, letterSpacing: 0.5 }}>{f.tag}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1A1613', margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#6B6560', lineHeight: 1.8, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === EXCAVATION TYPES — Dark Section === */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(180deg, #0a1a0f 0%, #03471f 100%)' }}>
        <div style={s.inner}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ ...s.sectionTitle, color: '#fff' }} className="section-title">6 أنواع حفريات نرصدها</h2>
            <p style={{ ...s.sectionDesc, color: 'rgba(255,255,255,0.5)' }}>AI متخصص يميّز بينها تلقائياً</p>
          </div>

          <div className="categories-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { icon: '⏱️', title: 'متأخرة عن الترخيص', desc: 'تجاوزت المدة (30-60 يوم)' },
              { icon: '🚫', title: 'مهجورة', desc: 'لا عمال ولا معدات — منسية' },
              { icon: '🔄', title: 'حفر بعد السفلتة', desc: 'شارع جديد يُشق مرة ثانية' },
              { icon: '⚠️', title: 'بدون حواجز سلامة', desc: 'مكشوفة — خطر مباشر' },
              { icon: '📋', title: 'بدون ترخيص ظاهر', desc: 'لا توجد لوحة مرئية' },
              { icon: '🚧', title: 'نشطة', desc: 'نراقب الالتزام بالمدة' },
            ].map((c, i) => (
              <div key={i} className={`fade-up stagger-${i + 1}`}
                style={{ padding: '24px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, textAlign: 'center', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'none'; }}>
                <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>{c.icon}</span>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>{c.title}</h3>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === KEY PLAYERS === */}
      <section style={{ padding: '80px 24px', background: '#FAFAF8' }}>
        <div style={s.inner}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={s.sectionTitle} className="section-title">الجهات المسؤولة عن الحفريات</h2>
            <p style={s.sectionDesc}>أولى يراقب ويقارن أداء كل جهة بشفافية</p>
          </div>

          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { name: 'المياه الوطنية NWC', share: '33,829 رخصة', desc: 'الأكبر — أكثر من ثلث رخص الحفر', color: '#2563EB' },
              { name: 'السعودية للكهرباء SEC', share: '26,390 رخصة', desc: 'ثاني أكبر — كابلات كهربائية', color: '#F97316' },
              { name: 'STC + موبايلي + زين', share: 'آلاف الرخص', desc: 'ألياف ضوئية — كل جهة تحفر مستقلة', color: '#22C55E' },
            ].map((entity, i) => (
              <div key={i} className={`glass-interactive fade-up stagger-${i + 1}`} style={{ padding: 24, borderTop: `3px solid ${entity.color}` }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1A1613', margin: '0 0 4px' }}>{entity.name}</h3>
                <p style={{ fontSize: 24, fontWeight: 900, color: entity.color, margin: '0 0 8px' }}>{entity.share}</p>
                <p style={{ fontSize: 13, color: '#6B6560', margin: 0, lineHeight: 1.7 }}>{entity.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA === */}
      <section style={{ padding: '80px 24px', background: '#FAFAF8', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: 'rgba(3,71,31,0.04)', filter: 'blur(100px)'}} />
        <div style={{ position: 'relative', maxWidth: 500, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 900, color: '#1A1613', margin: '0 0 12px' }}>
            ساعد في كشف الحفريات المتأخرة
          </h2>
          <p style={{ fontSize: 15, color: '#6B6560', margin: '0 0 32px', lineHeight: 1.8 }}>
            صورة واحدة — والذكاء الاصطناعي يتكفل بالباقي
          </p>
          <Link to="/submit" style={s.ctaBtn}>📸 بلّغ عن حفرية الآن</Link>
        </div>
      </section>
    </div>
  );
}

const s = {
  // Hero
  hero: { position: 'relative', height: '70vh', minHeight: 480, overflow: 'hidden', display: 'flex', alignItems: 'center', background: '#0a0a0a' },
  heroImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5, animation: 'fadeIn 2s ease' },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.5) 100%)', zIndex: 1 },
  heroContent: { position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto', padding: '0 40px', width: '100%' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', padding: '8px 18px', borderRadius: 100, fontSize: 12, marginBottom: 24, fontWeight: 500, border: '1px solid rgba(255,255,255,0.08)', fontFamily: "'Tajawal', sans-serif", backdropFilter: 'blur(8px)' },
  heroTitle: { fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 900, color: '#fff', margin: '0 0 16px', fontFamily: "'Tajawal', sans-serif", lineHeight: 1.1, letterSpacing: -1 },
  heroSubtitle: { fontSize: 'clamp(15px, 2.5vw, 20px)', color: 'rgba(255,255,255,0.55)', margin: '0 0 32px', fontWeight: 400, maxWidth: 520, lineHeight: 1.8 },
  heroBtns: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 48 },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, background: '#C5A656', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', fontFamily: "'Tajawal', sans-serif", transition: 'all 0.3s ease', boxShadow: '0 4px 20px rgba(197,166,86,0.3)' },
  btnGlass: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 24px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 500, textDecoration: 'none', fontFamily: "'Tajawal', sans-serif", backdropFilter: 'blur(12px)', transition: 'all 0.3s ease' },
  heroStats: { display: 'flex', gap: 32 },
  heroStat: { display: 'flex', flexDirection: 'column', gap: 2 },

  // Sections
  inner: { maxWidth: 1000, margin: '0 auto' },
  sectionBadge: { display: 'inline-block', padding: '5px 14px', borderRadius: 8, background: 'rgba(220,38,38,0.06)', color: '#DC2626', fontSize: 11, fontWeight: 700, border: '1px solid rgba(220,38,38,0.1)', marginBottom: 16, letterSpacing: 0.5 },
  sectionTitle: { fontSize: 28, fontWeight: 900, color: '#1A1613', margin: '0 0 8px', fontFamily: "'Tajawal', sans-serif", letterSpacing: -0.5 },
  sectionDesc: { fontSize: 14, color: '#6B6560', margin: '0 auto', maxWidth: 440 },
  card: { background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 20, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' },

  // CTA
  ctaBtn: { display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 36px', borderRadius: 14, background: '#C5A656', color: '#fff', fontSize: 16, fontWeight: 700, textDecoration: 'none', fontFamily: "'Tajawal', sans-serif", boxShadow: '0 4px 24px rgba(197,166,86,0.3)', transition: 'all 0.3s ease' },
};

export default Home;