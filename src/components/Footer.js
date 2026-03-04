import React from 'react';

function Footer() {
  return (
    <footer style={s.footer}>
      <div style={s.inner}>
        <div style={s.brand}>
          <span style={{ fontSize: 18, fontWeight: 900 }}>أولى</span>
          <span style={{ fontSize: 11, opacity: 0.6, marginRight: 8 }}>Awla</span>
        </div>
        <p style={s.text}>© 2026 — نظام البلاغات الذكي لمدينة الرياض</p>
        <p style={s.sub}>مشروع هاكاثون Vibe Coding 2026 • مبني بالذكاء الاصطناعي</p>
      </div>
    </footer>
  );
}

const s = {
  footer: {
    background: 'linear-gradient(135deg, #03471f, #1B7F5F)',
    color: '#fff',
    padding: '28px 24px',
  },
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    textAlign: 'center',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 8,
    fontFamily: "'Tajawal', sans-serif",
  },
  text: {
    fontSize: 13,
    margin: 0,
    opacity: 0.85,
    fontFamily: "'Tajawal', sans-serif",
  },
  sub: {
    fontSize: 11,
    margin: '6px 0 0',
    opacity: 0.5,
    fontFamily: "'Tajawal', sans-serif",
  },
};

export default Footer;
