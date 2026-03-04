import React from 'react';

function RoleSwitcher({ role, onSwitch }) {
  const isGov = role === 'government';

  const handleSwitch = (newRole) => {
    onSwitch(newRole);
  };

  return (
    <div style={s.wrapper}>
      <div style={s.container}>
        <div style={{ ...s.track, background: isGov ? 'rgba(3,71,31,0.08)' : 'rgba(3,71,31,0.06)' }}>
          <div style={{
            ...s.slider,
            transform: isGov ? 'translateX(0%)' : 'translateX(100%)',
            background: isGov ? '#C5A656' : '#03471f',
          }} />

          <button
            onClick={() => handleSwitch('government')}
            style={{
              ...s.btn,
              color: isGov ? '#0d1b2a' : 'var(--text-dim)',
              fontWeight: isGov ? 800 : 500,
            }}
          >
            🏛️ جهة حكومية
          </button>

          <button
            onClick={() => handleSwitch('citizen')}
            style={{
              ...s.btn,
              color: !isGov ? '#fff' : 'rgba(255,255,255,0.6)',
              fontWeight: !isGov ? 800 : 500,
            }}
          >
            👤 مواطن
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  wrapper: {
    background: 'var(--bg)',
    padding: '10px 0',
    borderBottom: '1px solid var(--card-border)',
    transition: 'all 0.3s',
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'center',
    padding: '0 24px',
  },
  track: {
    position: 'relative',
    display: 'flex',
    borderRadius: 14,
    padding: 4,
    gap: 0,
    overflow: 'hidden',
    transition: 'all 0.3s',
  },
  slider: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: 'calc(50% - 4px)',
    borderRadius: 11,
    transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
    right: 4,
  },
  btn: {
    position: 'relative',
    zIndex: 1,
    border: 'none',
    background: 'transparent',
    padding: '8px 20px',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: "'Tajawal', sans-serif",
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
  },
};

export default RoleSwitcher;
