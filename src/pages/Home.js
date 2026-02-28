import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section style={s.hero}>
        <div style={s.heroOverlay} />
        <img
          src="https://images.unsplash.com/photo-1722966885396-1f3dcebdf27f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
          alt="الرياض"
          style={s.heroImg}
        />
        <div style={s.heroContent}>
          <span style={s.badge}>مستوحى من تطبيق مدينتي</span>
          <h1 style={s.heroTitle}>أولى | Awla</h1>
          <p style={s.heroSubtitle}>نظام البلاغات الذكي للرياض</p>
          <p style={s.heroDesc}>
            راقب الحفريات، أبلغ عن المشاكل، وساهم في تحسين البنية التحتية لمدينتك
          </p>
          <div style={s.heroBtns}>
            <Link to="/submit" style={s.btnGold}>
              رفع بلاغ جديد
              <span style={{ marginRight: 8 }}>←</span>
            </Link>
            <Link to="/map" style={s.btnOutline}>
              🗺️ خريطة الحفريات
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>الإحصائيات</h2>
        <div style={s.statsGrid}>
          {[
            { icon: '📄', value: '+106,000', label: 'رخص حفر سنوياً', color: '#1B7F5F' },
            { icon: '⚠️', value: '+100,000', label: 'بلاغات مواطنين', color: '#D94545' },
            { icon: '⏱️', value: '+30', label: 'حفريات متأخرة', color: '#9D7C5F' },
            { icon: '📈', value: '85%', label: 'نسبة الإنجاز', color: '#1B7F5F' },
          ].map((s2, i) => (
            <div key={i} style={s.statCard}>
              <span style={{ fontSize: 28 }}>{s2.icon}</span>
              <div style={{ fontSize: 32, fontWeight: 800, color: s2.color, marginTop: 8 }}>{s2.value}</div>
              <div style={{ fontSize: 13, color: '#6B6560', marginTop: 4 }}>{s2.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ ...s.section, background: '#F5F1ED' }}>
        <h2 style={s.sectionTitle}>الميزات الرئيسية</h2>
        <p style={s.sectionDesc}>
          نظام هجين يركز على مراقبة الحفريات المتأخرة مع تغطية شاملة لجميع البلاغات البلدية
        </p>
        <div style={s.featGrid}>
          {[
            { icon: '🤖', title: 'تصنيف ذكي بالذكاء الاصطناعي', desc: 'تحليل تلقائي للصور وتحديد نوع البلاغ والجهة المسؤولة', border: '#1B7F5F' },
            { icon: '⏱️', title: 'عداد تنازلي للحفريات', desc: 'تتبع مدة التراخيص ومعرفة الحفريات المتأخرة عن موعدها', border: '#9D7C5F' },
            { icon: '⚡', title: 'نظام أولوية ذكي', desc: 'حساب درجة الأولوية تلقائياً حسب الشدة والموقع والكثافة السكانية', border: '#D94545' },
            { icon: '📍', title: 'تجميع البلاغات المتكررة', desc: 'دمج البلاغات المتقاربة جغرافياً لتسريع المعالجة', border: '#D94545' },
          ].map((f, i) => (
            <div key={i} style={{ ...s.featCard, borderBottom: `3px solid ${f.border}` }}>
              <span style={{ fontSize: 40 }}>{f.icon}</span>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1A1613', margin: '12px 0 8px' }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: '#6B6560', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>فئات البلاغات</h2>
        <p style={s.sectionDesc}>4 فئات رئيسية لتغطية جميع احتياجات المدينة</p>
        <div style={s.catGrid}>
          {[
            { icon: '🚧', title: 'بلاغات الحفريات', desc: 'حفريات متأخرة، مهجورة، أو بدون ترخيص', bg: 'linear-gradient(135deg, #1B7F5F, #2C9F6E)' },
            { icon: '💡', title: 'بنية تحتية', desc: 'مياه، كهرباء، إنارة، وأرصفة', bg: 'linear-gradient(135deg, #9D7C5F, #B8956F)' },
            { icon: '🚦', title: 'بلاغات مرورية', desc: 'يوتيرن، إشارات، مطبات، وطرق', bg: 'linear-gradient(135deg, #D4A574, #C89660)' },
            { icon: '☁️', title: 'اقتراحات تحسين', desc: 'أفكار لتطوير البنية التحتية', bg: 'linear-gradient(135deg, #7B8B6F, #96A688)' },
          ].map((c, i) => (
            <div key={i} style={{ ...s.catCard, background: c.bg }}>
              <span style={{ fontSize: 32, marginBottom: 12 }}>{c.icon}</span>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>{c.title}</h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.6 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={s.cta}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', margin: '0 0 14px' }}>ابدأ الآن في تحسين مدينتك</h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', margin: '0 0 36px', lineHeight: 1.7 }}>
          شارك في بناء الرياض الذكية من خلال رفع البلاغات ومتابعتها حتى الإنجاز
        </p>
        <Link to="/submit" style={s.ctaBtn}>
          رفع بلاغ الآن
          <span style={{ marginRight: 8 }}>←</span>
        </Link>
      </section>
    </div>
  );
}

const s = {
  hero: {
    position: 'relative',
    height: '70vh',
    minHeight: 480,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
  },
  heroImg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to left, rgba(27,127,95,0.92) 0%, rgba(27,127,95,0.7) 50%, transparent 100%)',
    zIndex: 1,
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 40px',
    width: '100%',
  },
  badge: {
    display: 'inline-block',
    background: '#9D7C5F',
    color: '#fff',
    padding: '8px 20px',
    borderRadius: 24,
    fontSize: 13,
    marginBottom: 20,
    fontFamily: "'Tajawal', sans-serif",
  },
  heroTitle: {
    fontSize: 'clamp(36px, 5vw, 56px)',
    fontWeight: 800,
    color: '#fff',
    margin: '0 0 12px',
    fontFamily: "'Tajawal', sans-serif",
  },
  heroSubtitle: {
    fontSize: 'clamp(18px, 3vw, 28px)',
    color: 'rgba(255,255,255,0.9)',
    margin: '0 0 16px',
    fontWeight: 400,
  },
  heroDesc: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    margin: '0 0 32px',
    lineHeight: 1.7,
    maxWidth: 550,
  },
  heroBtns: {
    display: 'flex',
    gap: 14,
    flexWrap: 'wrap',
  },
  btnGold: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '14px 32px',
    borderRadius: 12,
    background: '#9D7C5F',
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    textDecoration: 'none',
    boxShadow: '0 4px 16px rgba(157,124,95,0.3)',
    fontFamily: "'Tajawal', sans-serif",
  },
  btnOutline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 32px',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.1)',
    border: '2px solid rgba(255,255,255,0.3)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    textDecoration: 'none',
    backdropFilter: 'blur(8px)',
    fontFamily: "'Tajawal', sans-serif",
  },
  section: {
    padding: '60px 20px',
    maxWidth: 1200,
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: '#1A1613',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: "'Tajawal', sans-serif",
  },
  sectionDesc: {
    fontSize: 15,
    color: '#6B6560',
    textAlign: 'center',
    marginBottom: 40,
    maxWidth: 600,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    marginTop: 32,
  },
  statCard: {
    background: '#fff',
    borderRadius: 16,
    padding: '28px 20px',
    border: '2px solid rgba(157,124,95,0.15)',
    textAlign: 'right',
  },
  featGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 16,
    marginTop: 32,
  },
  featCard: {
    background: '#fff',
    borderRadius: 16,
    padding: '32px 24px',
    textAlign: 'right',
    border: '2px solid rgba(157,124,95,0.15)',
  },
  catGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16,
    marginTop: 32,
  },
  catCard: {
    borderRadius: 16,
    padding: '36px 24px',
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    minHeight: 160,
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  cta: {
    padding: '80px 20px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #1B7F5F 0%, #9D7C5F 50%, #D4A574 100%)',
  },
  ctaBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '16px 40px',
    borderRadius: 14,
    background: '#fff',
    color: '#1B7F5F',
    fontSize: 17,
    fontWeight: 700,
    textDecoration: 'none',
    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
    fontFamily: "'Tajawal', sans-serif",
  },
};

export default Home;