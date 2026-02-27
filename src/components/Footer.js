import React from 'react';

function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.row}>
        <div style={styles.logoBox}>A</div>
        <span style={styles.brand}>Awla</span>
        <span style={styles.sep}>|</span>
        <span style={styles.sub}>بلاغ ذكي</span>
      </div>
      <p style={styles.hack}>Vibe Coding Hackathon 2026</p>
      <p style={styles.powered}>Powered by AI</p>
    </footer>
  );
}

const styles = {
  footer: {
    background: 'linear-gradient(135deg, #0a1a0a, #1B4D3E)',
    borderTop: '1px solid rgba(200,169,81,0.1)',
    padding: '20px',
    textAlign: 'center',
    direction: 'rtl',
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  logoBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    background: 'linear-gradient(135deg, #C8A951, #1B4D3E)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  brand: { color: '#C8A951', fontSize: 14, fontWeight: 'bold' },
  sep: { color: '#555', fontSize: 13 },
  sub: { color: '#666', fontSize: 12 },
  hack: { color: '#555', fontSize: 11, margin: 0 },
  powered: { color: '#333', fontSize: 10, margin: '4px 0 0' },
};

export default Footer;