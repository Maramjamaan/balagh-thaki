import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer style={s.footer}>
      <div style={s.inner}>
        <div className="footer-grid" style={s.topGrid}>
          <div>
            <div style={s.brand}>
              <div style={s.logoMark}>أ</div>
              <div>
                <span style={{ fontSize: 22, fontWeight: 900, display: 'block', lineHeight: 1 }}>أولى</span>
                <span style={{ fontSize: 11, opacity: 0.5 }}>Awla | Excavation Monitor</span>
              </div>
            </div>
            <p style={{ fontSize: 13, opacity: 0.6, lineHeight: 1.8, marginTop: 12, maxWidth: 280 }}>
              أول نظام ذكي لرصد الحفريات المتأخرة في شوارع الرياض — يستخدم AI لتحليل الصور وكشف التجاوزات وترتيب أداء الجهات
            </p>
          </div>
          <div>
            <h4 style={s.colTitle}>روابط سريعة</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[{ to: '/', label: '🏠 الرئيسية' }, { to: '/submit', label: '📸 بلّغ عن حفرية' }, { to: '/track', label: '🔍 تتبع البلاغات' }, { to: '/map', label: '🗺️ خريطة الحفريات' }, { to: '/dashboard', label: '📊 لوحة المراقبة' }].map((link, i) => (
                <Link key={i} to={link.to} style={s.link}>{link.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={s.colTitle}>التقنيات</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['React.js', 'Supabase', 'Claude AI', 'GPT-4 Vision', 'Web Speech API', 'Leaflet', 'Recharts'].map((tech, i) => (
                <span key={i} style={s.tag}>{tech}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 style={s.colTitle}>فريق العمل</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[{ initial: 'م', name: 'مرام الزهراني', role: 'Backend & AI' }, { initial: 'ع', name: 'عبدالمجيد الجهني', role: 'Frontend & Design' }].map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={s.avatar}>{m.initial}</div>
                  <div><p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{m.name}</p><p style={{ margin: 0, fontSize: 11, opacity: 0.5 }}>{m.role}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={s.divider} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ fontSize: 12, opacity: 0.5, margin: 0 }}>© 2026 أولى — نظام ذكي لرصد الحفريات المتأخرة في الرياض</p>
          <p style={{ fontSize: 11, opacity: 0.35, margin: 0 }}>مشروع هاكاثون Vibe Coding 2026 • يُكمّل عمل RIPC ومنصة نسّق</p>
        </div>
      </div>
    </footer>
  );
}

const s = {
  footer: { background: 'linear-gradient(135deg, #03471f 0%, #022d14 100%)', color: '#fff', padding: '28px 24px 16px' },
  inner: { maxWidth: 1100, margin: '0 auto' },
 topGrid: { display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 24 },
  brand: { display: 'flex', alignItems: 'center', gap: 10 },
  logoMark: { width: 40, height: 40, borderRadius: 12, background: 'rgba(197,166,86,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: '#C5A656', border: '1px solid rgba(197,166,86,0.3)' },
  colTitle: { fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#C5A656', fontFamily: "'Tajawal', sans-serif" },
  link: { fontSize: 13, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontFamily: "'Tajawal', sans-serif" },
  tag: { padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', fontSize: 11, color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.06)' },
  avatar: { width: 34, height: 34, borderRadius: 10, background: 'rgba(197,166,86,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#C5A656', border: '1px solid rgba(197,166,86,0.2)' },
 divider: { height: 1, background: 'rgba(255,255,255,0.08)', margin: '16px 0 12px' },
};

export default Footer;
