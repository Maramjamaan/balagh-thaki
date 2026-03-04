import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer style={s.footer}>
      <div style={s.inner}>
        {/* Top section */}
        <div style={s.topGrid}>
          {/* Brand */}
          <div style={{ textAlign: 'right' }}>
            <div style={s.brand}>
              <div style={s.logoMark}>أ</div>
              <div>
                <span style={{ fontSize: 22, fontWeight: 900, display: 'block', lineHeight: 1 }}>أولى</span>
                <span style={{ fontSize: 11, opacity: 0.5 }}>Awla | Smart Reporting</span>
              </div>
            </div>
            <p style={{ fontSize: 13, opacity: 0.6, lineHeight: 1.8, marginTop: 12, maxWidth: 280 }}>
              نظام بلاغات ذكي يستخدم الذكاء الاصطناعي لتصنيف مشاكل البنية التحتية وتوجيهها للجهة المسؤولة تلقائياً
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={s.colTitle}>روابط سريعة</h4>
            <div style={s.linksList}>
              <Link to="/" style={s.link}>🏠 الرئيسية</Link>
              <Link to="/submit" style={s.link}>📸 رفع بلاغ</Link>
              <Link to="/track" style={s.link}>🔍 تتبع البلاغات</Link>
              <Link to="/map" style={s.link}>🗺️ خريطة الحفريات</Link>
            </div>
          </div>

          {/* Tech */}
          <div>
            <h4 style={s.colTitle}>التقنيات</h4>
            <div style={s.tagsList}>
              {['React', 'Supabase', 'Claude AI', 'GPT-4 Vision', 'Web Speech API', 'Leaflet'].map((tech, i) => (
                <span key={i} style={s.tag}>{tech}</span>
              ))}
            </div>
          </div>

          {/* Team */}
          <div>
            <h4 style={s.colTitle}>فريق العمل</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={s.teamMember}>
                <div style={s.avatar}>م</div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>مرام الزهراني</p>
                  <p style={{ margin: 0, fontSize: 11, opacity: 0.5 }}>Backend & AI</p>
                </div>
              </div>
              <div style={s.teamMember}>
                <div style={s.avatar}>ع</div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>عبدالمجيد الجهني</p>
                  <p style={{ margin: 0, fontSize: 11, opacity: 0.5 }}>Frontend & Design</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={s.divider} />

        {/* Bottom */}
        <div style={s.bottom}>
          <p style={{ fontSize: 12, opacity: 0.5, margin: 0 }}>© 2026 أولى — نظام البلاغات الذكي لمدينة الرياض</p>
          <p style={{ fontSize: 11, opacity: 0.35, margin: 0 }}>مشروع هاكاثون Vibe Coding 2026 • مبني بالذكاء الاصطناعي</p>
        </div>
      </div>
    </footer>
  );
}

const s = {
  footer: {
    background: 'linear-gradient(135deg, #03471f 0%, #022d14 100%)',
    color: '#fff',
    padding: '48px 24px 28px',
  },
  inner: {
    maxWidth: 1100,
    margin: '0 auto',
  },
  topGrid: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
    gap: 40,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: 'rgba(197,166,86,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 900,
    color: '#C5A656',
    border: '1px solid rgba(197,166,86,0.3)',
  },
  colTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 14,
    color: '#C5A656',
    fontFamily: "'Tajawal', sans-serif",
  },
  linksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  link: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    textDecoration: 'none',
    transition: 'color 0.2s',
    fontFamily: "'Tajawal', sans-serif",
  },
  tagsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    padding: '4px 10px',
    borderRadius: 8,
    background: 'rgba(255,255,255,0.08)',
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  teamMember: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: 'rgba(197,166,86,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 800,
    color: '#C5A656',
    border: '1px solid rgba(197,166,86,0.2)',
  },
  divider: {
    height: 1,
    background: 'rgba(255,255,255,0.08)',
    margin: '32px 0 20px',
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
};

// Responsive override
const footerStyle = document.createElement('style');
footerStyle.textContent = `
  @media (max-width: 768px) {
    footer > div > div:first-child {
      grid-template-columns: 1fr !important;
      gap: 28px !important;
    }
  }
`;
document.head.appendChild(footerStyle);

export default Footer;
