import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RoleSwitcher from './components/RoleSwitcher';
import DemoGuide from './components/DemoGuide';
import Home from './pages/Home';
import SubmitReport from './pages/SubmitReport';
import TrackReport from './pages/TrackReport';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import { seedDemoData, isDemoMode } from './services/demoDataService';
import './App.css';

function App() {
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState('citizen');

  useEffect(() => {
    async function init() {
      if (isDemoMode()) {
        await seedDemoData();
      }
      setReady(true);
    }
    init();
  }, []);

  if (!ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#FAFAF8', direction: 'rtl', fontFamily: "'Tajawal', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid rgba(3,71,31,0.12)', borderTopColor: '#03471f', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#6B6560', fontSize: 14 }}>جاري تحميل أولى...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar role={role} />
        <RoleSwitcher role={role} onSwitch={setRole} />
        {isDemoMode() && (
          <div className="demo-banner-content" style={{
            background: 'linear-gradient(90deg, #03471f, #065a2b)',
            color: '#fff', textAlign: 'center', padding: '6px 16px', fontSize: 12,
            fontFamily: "'Tajawal', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <span style={{ background: 'rgba(255,195,0,0.3)', padding: '2px 10px', borderRadius: 6, fontSize: 11 }}>DEMO</span>
            <span>وضع العرض التوضيحي — 45 حفرية تجريبية في أحياء الرياض</span>
          </div>
        )}
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home role={role} />} />
            <Route path="/submit" element={<SubmitReport />} />
            <Route path="/track" element={<TrackReport />} />
            <Route path="/map" element={<MapPage role={role} />} />
            <Route path="/dashboard" element={<Dashboard role={role} />} />
          </Routes>
        </main>
        <Footer />
        <DemoGuide />
      </div>
    </Router>
  );
}

export default App;
