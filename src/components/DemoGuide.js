import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function DemoGuide() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('awla-guide-dismissed');
    if (!wasDismissed) {
      setTimeout(() => setVisible(true), 1500);
    } else {
      setDismissed(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem('awla-guide-dismissed', 'true');
  };

  const steps = [
    {
      icon: '📸',
      title: 'بلّغ عن حفرية',
      desc: 'ارفع صورة أي حفرية — AI يحدد نوعها ومرحلتها وعمرها والجهة المسؤولة',
      action: () => { dismiss(); navigate('/submit'); },
      btnText: 'جرّب الآن',
    },
    {
      icon: '📊',
      title: 'لوحة مراقبة الحفريات',
      desc: '45 حفرية demo + Leaderboard يكشف أي شركة خدمات هي الأكثر تأخيراً',
      action: () => { dismiss(); navigate('/dashboard'); },
      btnText: 'الداشبورد',
    },
    {
      icon: '🗺️',
      title: 'خريطة حفريات الرياض',
      desc: 'كل الحفريات على الخريطة — مع التجميع الجغرافي وألوان الأولوية',
      action: () => { dismiss(); navigate('/map'); },
      btnText: 'الخريطة',
    },
    {
      icon: '🔍',
      title: 'تتبع حفرية',
      desc: 'جرّب AW-2026-12345 لتتبع بلاغ حفرية مع Timeline كامل',
      action: () => { dismiss(); navigate('/track'); },
      btnText: 'تتبع',
    },
  ];

  if (dismissed && !visible) {
    return (
      <button onClick={() => { setVisible(true); setDismissed(false); }}
        style={{
          position: 'fixed', bottom: 20, left: 20, zIndex: 9999,
          width: 48, height: 48, borderRadius: 14, border: 'none',
          background: '#03471f', color: '#fff', fontSize: 20, cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(3,71,31,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
        🧭
      </button>
    );
  }

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: 20, zIndex: 9999,
      width: 340, maxWidth: 'calc(100vw - 40px)',
      background: '#fff', borderRadius: 20, padding: 0,
      boxShadow: '0 12px 48px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)',
      animation: 'fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #03471f, #065a2b)',
        padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 800, margin: 0 }}>🧭 دليل العرض</h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, margin: '2px 0 0' }}>اكتشف نظام رصد الحفريات</p>
        </div>
        <button onClick={dismiss}
          style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
          ✕
        </button>
      </div>

      {/* Steps */}
      <div style={{ padding: '12px 16px 16px' }}>
        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
          {steps.map((_, i) => (
            <div key={i} onClick={() => setCurrentStep(i)}
              style={{
                flex: 1, height: 4, borderRadius: 2, cursor: 'pointer',
                background: i === currentStep ? '#03471f' : i < currentStep ? '#C5A656' : 'rgba(0,0,0,0.06)',
                transition: 'all 0.3s',
              }} />
          ))}
        </div>

        {/* Current step */}
        <div style={{ minHeight: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'var(--primary-light)', border: '1px solid var(--primary-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              flexShrink: 0,
            }}>
              {steps[currentStep].icon}
            </div>
            <div>
              <h4 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                {steps[currentStep].title}
              </h4>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '2px 0 0', lineHeight: 1.6 }}>
                {steps[currentStep].desc}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button onClick={steps[currentStep].action}
              style={{
                flex: 1, padding: '10px 16px', background: '#03471f', color: '#fff',
                border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: "'Tajawal', sans-serif",
              }}>
              {steps[currentStep].btnText} ←
            </button>
            {currentStep < steps.length - 1 && (
              <button onClick={() => setCurrentStep(currentStep + 1)}
                style={{
                  padding: '10px 16px', background: 'rgba(0,0,0,0.03)', color: 'var(--text-dim)',
                  border: '1px solid rgba(0,0,0,0.06)', borderRadius: 10, fontSize: 13,
                  cursor: 'pointer', fontFamily: "'Tajawal', sans-serif",
                }}>
                التالي
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DemoGuide;
