import React from 'react';

function RoleSwitcher({ role, onSwitch }) {
  return (
    <div style={s.wrapper}>
      <div style={s.container}>
        <button
          onClick={() => onSwitch('citizen')}
          style={{ ...s.btn, ...(role === 'citizen' ? s.activeBtn : s.inactiveBtn) }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          <span>مواطن</span>
        </button>
        <button
          onClick={() => onSwitch('government')}
          style={{ ...s.btn, ...(role === 'government' ? s.activeGovBtn : s.inactiveBtn) }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>جهة حكومية</span>
        </button>
      </div>
    </div>
  );
}

const s = {
  wrapper: { display: 'flex', justifyContent: 'center', padding: '12px 16px', background: 'rgba(245,241,237,0.6)', borderBottom: '1px solid rgba(0,0,0,0.04)' },
  container: { display: 'flex', background: '#fff', borderRadius: 12, padding: 4, gap: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' },
  btn: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Tajawal', sans-serif", transition: 'all 0.25s ease' },
  activeBtn: { background: '#03471f', color: '#fff', boxShadow: '0 2px 6px rgba(3,71,31,0.25)' },
  activeGovBtn: { background: '#C5A656', color: '#fff', boxShadow: '0 2px 6px rgba(197,166,86,0.3)' },
  inactiveBtn: { background: 'transparent', color: '#6B6560' },
};

export default RoleSwitcher;
