import React from 'react';

function Footer() {
  return (
    <footer style={s.footer}>
      <p style={s.text}>© 2026 Awla | أولى - نظام البلاغات الذكي</p>
      <p style={s.sub}>مستوحى من مدينة الرياض وتطبيق مدينتي</p>
    </footer>
  );
}

const s = {
  footer: {
    background: '#1B7F5F',
    color: '#fff',
    padding: '24px 20px',
    textAlign: 'center',
  },
  text: {
    fontSize: 14,
    margin: 0,
    fontFamily: "'Tajawal', sans-serif",
  },
  sub: {
    fontSize: 12,
    margin: '8px 0 0',
    opacity: 0.7,
    fontFamily: "'Tajawal', sans-serif",
  },
};

export default Footer;