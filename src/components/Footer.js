import React from 'react';

function Footer() {
  return (
    <footer style={s.footer}>
      <div style={s.row}>
        <div style={s.logo}>أ</div>
        <span style={s.brand}>أولى</span>
        <span style={s.sep}>·</span>
        <span style={s.sub}>بلاغ ذكي</span>
      </div>
      <p style={s.hack}>Vibe Coding Hackathon 2026</p>
    </footer>
  );
}

const s = {
  footer: {
    borderTop: '1px solid rgba(0,0,0,0.04)', padding: 20,
    textAlign: 'center', paddingBottom: 90, background: '#fff',
  },
  row: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 6 },
  logo: {
    width: 20, height: 20, borderRadius: 6,
    background: 'linear-gradient(135deg, #006838, #00a65a)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 9, fontWeight: 800, color: '#fff',
  },
  brand: { color: 'var(--primary)', fontSize: 13, fontWeight: 700 },
  sep: { color: 'var(--text-faint)', fontSize: 13 },
  sub: { color: 'var(--text-faint)', fontSize: 11 },
  hack: { color: 'var(--text-faint)', fontSize: 10, margin: 0, opacity: 0.6 },
};

export default Footer;
