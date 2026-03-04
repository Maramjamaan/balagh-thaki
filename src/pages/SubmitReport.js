import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitReport } from '../services/reportService';
import { ENTITY_NAMES_AR, severityToArabic, severityColor, getProviderName } from '../services/aiService';
import { getCurrentLocation } from '../services/locationService';
import { CATEGORIES_LIST } from '../services/confidenceService';
import { checkCanSubmit, recordSubmission } from '../services/spamProtection';
import {
  isVoiceSupported,
  initSpeechRecognition,
  startRecording as startVoiceRecording,
  stopRecording as stopVoiceRecording,
  cleanup as cleanupVoice,
  analyzeVoiceText,
  MAX_RECORDING_SECONDS,
} from '../services/voiceService';

function SubmitReport() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(0);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [voiceSupported] = useState(isVoiceSupported());
  const [voiceError, setVoiceError] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceAnalysis, setVoiceAnalysis] = useState(null);
  const [analyzingVoice, setAnalyzingVoice] = useState(false);
  const timerRef = useRef(null);
  const audioBlobPromiseRef = useRef(null);

  useEffect(() => {
    getCurrentLocation()
      .then(loc => setLocation(loc))
      .catch(() => setLocation({ latitude: 24.7136, longitude: 46.6753, neighborhood: 'الرياض' }));

    if (voiceSupported) {
      initSpeechRecognition({
        onTranscript: (text) => setVoiceText(prev => prev + text),
        onError: (msg) => setVoiceError(msg),
      });
    }

    return () => cleanupVoice(timerRef.current);
  }, [voiceSupported]);

  // === Voice Functions ===
  const handleStartRecording = async () => {
    setVoiceError('');
    setVoiceText('');
    setRecordingTime(0);
    setAudioBlob(null);
    setVoiceAnalysis(null);

    const result = await startVoiceRecording({
      onTranscript: (text) => setVoiceText(prev => prev + text),
      onError: (msg) => { setVoiceError(msg); setIsRecording(false); },
      onTimeUpdate: (sec) => setRecordingTime(sec),
      onMaxReached: () => {
        setIsRecording(false);
        setVoiceError('⏱️ وصلت الحد الأقصى (دقيقتين) — تم إيقاف التسجيل تلقائياً');
      },
    });

    if (result) {
      setIsRecording(true);
      timerRef.current = result.timer;
      audioBlobPromiseRef.current = result.audioBlobPromise;
    }
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    stopVoiceRecording();
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }

    // انتظر ملف الصوت
    if (audioBlobPromiseRef.current) {
      const blob = await audioBlobPromiseRef.current;
      setAudioBlob(blob);
    }
  };

  const handleAnalyzeVoice = async () => {
    if (!voiceText.trim()) {
      setVoiceError('📝 ما فيه نص — سجّل مرة ثانية وتكلم بصوت واضح');
      return;
    }
    setAnalyzingVoice(true);
    setVoiceError('');
    try {
      const analysis = await analyzeVoiceText(voiceText);
      setVoiceAnalysis(analysis);
      if (analysis.needs_clarification) {
        setVoiceError(`⚠️ ${analysis.clarification_message}`);
      }
      // أضف الوصف النظيف للملاحظات
      if (analysis.understood && analysis.clean_description) {
        setNotes(prev => prev ? prev + '\n' + analysis.clean_description : analysis.clean_description);
      }
    } catch (err) {
      setVoiceError('حدث خطأ في تحليل الصوت');
    }
    setAnalyzingVoice(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // === Image & Submit ===
  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { setError('حجم الصورة كبير — الحد الأقصى 10 ميجا'); return; }
      setImage(file); setPreview(URL.createObjectURL(file)); setError('');
    }
  };

  const handleSubmit = async () => {
    if (!image) { setError('ارفع صورة المشكلة أولاً'); return; }

    // فحص التكرار قبل الإرسال
    const spamCheck = checkCanSubmit(
      location?.latitude,
      location?.longitude,
      voiceAnalysis?.category || null
    );

    if (!spamCheck.allowed) {
      setError(spamCheck.message);
      return;
    }

    setLoading(true); setError(''); setStep(1);
    try {
      if (isRecording) handleStopRecording();

      setTimeout(() => setStep(2), 1200);
      setTimeout(() => setStep(3), 2400);
      setTimeout(() => setStep(4), 3200);

      const res = await submitReport(image, {
        notes: notes || null,
        audioBlob: audioBlob || null,
        voiceText: voiceText || null,
      });

      // سجّل البلاغ عشان نمنع التكرار
      recordSubmission({
        latitude: res.location?.latitude,
        longitude: res.location?.longitude,
        category: res.ai?.category,
        reportId: res.report?.id,
      });

      setStep(5);
      setTimeout(() => setResult(res), 400);
    } catch (err) { setError(err.message); setStep(0); }
    setLoading(false);
  };

  const resetForm = () => {
    setImage(null); setPreview(null); setResult(null);
    setError(''); setStep(0); setNotes(''); setShowDetails(false);
    setVoiceText(''); setAudioBlob(null); setVoiceError('');
    setRecordingTime(0); setIsRecording(false); setVoiceAnalysis(null);
    cleanupVoice(timerRef.current);
  };
  // === Result Page ===
  if (result) {
    const p = result.priority;
    const circ = 2 * Math.PI * 54;
    const offset = circ - (p.score / 100) * circ;
    const ai = result.ai;
    const validation = result.validation;
    const cluster = result.cluster;
    const escalation = result.escalation;

    return (
      <div style={st.page}>
        <div className="fade-up">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, margin: '0 auto', background: 'rgba(3,71,31,0.06)', border: '2px solid rgba(3,71,31,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#03471f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h2 style={{ color: 'var(--primary)', fontSize: 22, fontWeight: 800, margin: '14px 0 4px' }}>تم إرسال البلاغ بنجاح</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: 12 }}>رقم البلاغ: <span style={{ color: 'var(--primary)', direction: 'ltr', display: 'inline-block' }}>{result.report.id?.slice(0, 8)}</span></p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '4px 14px', borderRadius: 8, background: 'var(--primary-light)', border: '1px solid var(--primary-border)' }}>
              <span style={{ fontSize: 10 }}>🤖</span>
              <span style={{ fontSize: 11, color: 'var(--primary)' }}>{getProviderName()}</span>
            </div>
          </div>

          {/* Priority Circle */}
          <div className="glass" style={{ padding: 28, marginBottom: 14, textAlign: 'center' }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="10" />
              <circle cx="70" cy="70" r="54" fill="none" stroke={p.dynamic?.level?.color || p.level.color} strokeWidth="10" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 70 70)" style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
              <text x="70" y="64" textAnchor="middle" fill={p.dynamic?.level?.color || p.level.color} fontSize="32" fontWeight="800" fontFamily="Tajawal">{p.score}</text>
              <text x="70" y="86" textAnchor="middle" fill="var(--text-dim)" fontSize="12" fontFamily="Tajawal">{p.dynamic?.level?.label || p.level.label}</text>
            </svg>
            {escalation?.escalated && (
              <div style={{ marginTop: 8, padding: '6px 14px', borderRadius: 10, background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.12)', display: 'inline-block' }}>
                <span style={{ fontSize: 12, color: '#F97316' }}>⬆️ تم رفع الأولوية من {escalation.baseScore} إلى {escalation.dynamicScore}</span>
              </div>
            )}
          </div>

          {/* Confidence */}
          {validation && (
            <div className="glass" style={{ padding: 20, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 700, margin: 0 }}>🎯 مستوى ثقة التصنيف</h3>
                <span style={{ padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: `${validation.level.color}15`, color: validation.level.color }}>{Math.round(validation.adjustedConfidence * 100)}% — {validation.level.label}</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.04)', borderRadius: 8, height: 8, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ height: '100%', borderRadius: 8, background: validation.level.color, width: `${Math.round(validation.adjustedConfidence * 100)}%`, transition: 'width 1s ease' }} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '0 0 8px' }}>{validation.summary}</p>
              {validation.warnings.length > 0 && validation.warnings.map((w, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.12)', borderRadius: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>⚠️</span>
                  <span style={{ fontSize: 12, color: '#92400E' }}>{w}</span>
                </div>
              ))}
              {validation.needsManualClassification && (
                <div style={{ marginTop: 12, padding: 14, background: 'rgba(220,38,38,0.04)', border: '2px solid rgba(220,38,38,0.12)', borderRadius: 14 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#DC2626', margin: '0 0 10px' }}>اختر التصنيف المناسب:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {CATEGORIES_LIST.map(cat => (
                      <button key={cat.id} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: cat.id === ai.category ? '#03471f' : '#fff', color: cat.id === ai.category ? '#fff' : '#1A1613', fontSize: 12, cursor: 'pointer', fontFamily: "'Tajawal', sans-serif" }}>{cat.icon} {cat.label}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cluster */}
          {cluster?.isDuplicate && (
            <div className="glass" style={{ padding: 20, marginBottom: 14, background: 'rgba(37,99,235,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📍</div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1E40AF', margin: 0 }}>تم كشف بلاغات مشابهة!</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '2px 0 0' }}>التجميع الجغرافي الذكي</p>
                </div>
              </div>
              <div style={{ padding: 14, background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.1)', borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>بلاغات مشابهة في المنطقة</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: '#2563EB' }}>{cluster.nearbyCount}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: 0 }}>{cluster.message_detail}</p>
              </div>
            </div>
          )}

          {/* Escalation Factors */}
          {escalation?.factors?.length > 0 && (
            <div className="glass" style={{ padding: 20, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 22 }}>⚡</span>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>عوامل التصعيد الذكي ({escalation.factors.length})</h3>
              </div>
              {escalation.factors.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(0,0,0,0.02)', borderRadius: 12, marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{f.icon}</span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{f.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '2px 0 0' }}>{f.detail}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#F97316' }}>+{f.boost}</span>
                </div>
              ))}
            </div>
          )}

          {/* AI Details */}
          <div className="glass" style={{ padding: 20, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 700, margin: 0 }}>🤖 تحليل الذكاء الاصطناعي</h3>
              <button onClick={() => setShowDetails(!showDetails)} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--primary)', cursor: 'pointer', fontFamily: "'Tajawal', sans-serif" }}>{showDetails ? 'إخفاء ▲' : 'تفاصيل ▼'}</button>
            </div>
            {[['الفئة', ai.category_ar], ['التصنيف الفرعي', ai.subcategory_ar]].map(([l, v], i) => (
              <div key={i} style={st.row}><span style={st.rowL}>{l}</span><span style={st.rowV}>{v}</span></div>
            ))}
            <div style={st.row}><span style={st.rowL}>الشدة</span><span style={{ fontSize: 13, fontWeight: 700, color: severityColor(ai.severity) }}>{ai.severity}/5 — {severityToArabic(ai.severity)}</span></div>
            <div style={st.row}><span style={st.rowL}>الحي</span><span style={st.rowV}>{result.location.neighborhood}</span></div>
            <div style={{ background: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: 14, padding: 14, marginTop: 14, textAlign: 'center' }}>
              <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>الجهة المسؤولة</span>
              <span style={{ color: 'var(--primary)', fontSize: 16, fontWeight: 800, display: 'block', marginTop: 4 }}>{ENTITY_NAMES_AR[ai.responsible_entity] || ai.responsible_entity}</span>
            </div>
            {showDetails && ai.description_ar && (
              <div style={{ marginTop: 14, padding: 12, background: 'rgba(0,0,0,0.02)', borderRadius: 12 }}>
                <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '0 0 4px' }}>وصف AI:</p>
                <p style={{ fontSize: 13, margin: 0, lineHeight: 1.7 }}>{ai.description_ar}</p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={resetForm} style={{ flex: 1, padding: 14, background: '#03471f', color: '#fff', border: 'none', borderRadius: 14, fontSize: 14, cursor: 'pointer', fontWeight: 700, fontFamily: "'Tajawal', sans-serif" }}>📸 بلاغ جديد</button>
            <button onClick={() => navigate('/dashboard')} style={{ flex: 1, padding: 14, background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary-border)', borderRadius: 14, fontSize: 14, cursor: 'pointer', fontFamily: "'Tajawal', sans-serif" }}>📊 لوحة التحكم</button>
          </div>
        </div>
      </div>
    );
  }

  // === Upload Form ===
  return (
    <div style={st.page}>
      <div style={{ textAlign: 'center', marginBottom: 32 }} className="fade-up">
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1A1613', margin: '0 0 8px' }}>رفع بلاغ جديد</h1>
        <p style={{ color: '#6B6560', fontSize: 15 }}>التقط صورة ودع الذكاء الاصطناعي يحلل ويصنف تلقائياً</p>
      </div>

      <div className="fade-up glass" style={{ padding: 32, marginBottom: 32, borderRadius: 24 }}>
        <div style={{ marginBottom: 28 }}>
          <label style={st.label}>صورة المشكلة</label>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleImage} style={{ display: 'none' }} />
          {preview ? (
            <div style={{ position: 'relative' }}>
              <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 16 }} />
              <button onClick={() => { setImage(null); setPreview(null); }} style={{ position: 'absolute', top: 12, left: 12, background: '#DC2626', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontFamily: "'Tajawal', sans-serif" }}>حذف</button>
            </div>
          ) : (
            <div onClick={() => fileRef.current?.click()} style={{ border: '3px dashed rgba(0,0,0,0.1)', borderRadius: 16, padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.015)', transition: 'border-color 0.2s' }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6B6560" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
              </div>
              <p style={{ color: '#1A1613', fontSize: 16, margin: '12px 0 4px', fontWeight: 500 }}>انقر لالتقاط أو رفع صورة</p>
              <p style={{ color: '#A0A0A0', fontSize: 13 }}>PNG, JPG حتى 10MB</p>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={st.label}>الموقع</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14, padding: '16px 20px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#03471f" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>تم تحديد الموقع تلقائياً</p>
              <p style={{ fontSize: 12, color: '#6B6560', margin: '4px 0 0', direction: 'ltr', textAlign: 'right' }}>{location ? `${location.latitude.toFixed(4)}° N, ${location.longitude.toFixed(4)}° E — ${location.neighborhood}` : 'جاري...'}</p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={st.label}>ملاحظات إضافية (اختياري)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="أضف تفاصيل إضافية..." style={{ width: '100%', height: 100, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: 16, resize: 'none', fontSize: 14, fontFamily: "'Tajawal', sans-serif", outline: 'none', direction: 'rtl' }} />
        </div>

        {/* Voice Recording Section */}
        {voiceSupported && (
          <div style={{ marginBottom: 28 }}>
            <label style={st.label}>🎙️ وصف صوتي للمشكلة (اختياري)</label>
            <div style={{
              background: isRecording ? 'rgba(220,38,38,0.04)' : 'rgba(3,71,31,0.02)',
              border: `2px solid ${isRecording ? 'rgba(220,38,38,0.2)' : 'rgba(0,0,0,0.06)'}`,
              borderRadius: 16, padding: 20, transition: 'all 0.3s',
            }}>
              {/* Record Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    style={{
                      width: 52, height: 52, borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: isRecording ? '#DC2626' : '#03471f',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: isRecording ? '0 0 0 4px rgba(220,38,38,0.2)' : '0 2px 8px rgba(3,71,31,0.2)',
                      animation: isRecording ? 'pulse 1.5s ease-in-out infinite' : 'none',
                    }}
                  >
                    {isRecording ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
                    )}
                  </button>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1613', margin: 0 }}>
                      {isRecording ? 'جاري التسجيل...' : audioBlob ? '✅ تم التسجيل' : 'اضغط للتسجيل'}
                    </p>
                    <p style={{ fontSize: 12, color: isRecording ? '#DC2626' : '#6B6560', margin: '2px 0 0' }}>
                      {isRecording ? `⏱️ ${formatTime(recordingTime)} / ${formatTime(MAX_RECORDING_SECONDS)}` : 'وصف المشكلة بالعربي — AI يحلل كلامك'}
                    </p>
                  </div>
                </div>
                {isRecording && (
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0, 1, 2, 3, 4].map(i => (
                      <div key={i} style={{ width: 4, borderRadius: 2, background: '#DC2626', animation: `pulse ${0.5 + i * 0.15}s ease-in-out infinite alternate`, height: 12 + Math.random() * 16 }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Error */}
              {voiceError && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 10 }}>
                  <p style={{ fontSize: 13, color: '#DC2626', margin: 0 }}>{voiceError}</p>
                </div>
              )}

              {/* Transcribed Text */}
              {voiceText && !isRecording && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ background: '#fff', borderRadius: 12, padding: 14, border: '1px solid rgba(0,0,0,0.06)' }}>
                    <p style={{ fontSize: 11, color: '#6B6560', margin: '0 0 6px', fontWeight: 600 }}>📝 النص المحوّل:</p>
                    <p style={{ fontSize: 14, color: '#1A1613', margin: 0, lineHeight: 1.7, direction: 'rtl' }}>{voiceText}</p>
                  </div>

                  {/* Analyze Button */}
                  <button onClick={handleAnalyzeVoice} disabled={analyzingVoice} style={{
                    width: '100%', marginTop: 10, padding: '12px 16px',
                    background: analyzingVoice ? 'rgba(3,71,31,0.08)' : 'linear-gradient(135deg, #03471f, #065a2b)',
                    color: analyzingVoice ? '#6B6560' : '#fff', border: 'none', borderRadius: 12,
                    fontSize: 14, fontWeight: 700, cursor: analyzingVoice ? 'wait' : 'pointer',
                    fontFamily: "'Tajawal', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                    {analyzingVoice ? (
                      <><span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#03471f', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> جاري تحليل الكلام...</>
                    ) : (
                      <>🤖 حلل بالذكاء الاصطناعي</>
                    )}
                  </button>

                  {/* Voice Analysis Result */}
                  {voiceAnalysis && voiceAnalysis.understood && (
                    <div style={{ marginTop: 12, padding: 14, background: 'rgba(3,71,31,0.04)', border: '1px solid rgba(3,71,31,0.12)', borderRadius: 12 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#03471f', margin: '0 0 8px' }}>🤖 تحليل الذكاء الاصطناعي للوصف الصوتي:</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                        <span style={{ padding: '4px 12px', borderRadius: 8, background: '#03471f', color: '#fff', fontSize: 12 }}>📂 {voiceAnalysis.category_ar}</span>
                        <span style={{ padding: '4px 12px', borderRadius: 8, background: 'rgba(3,71,31,0.1)', color: '#03471f', fontSize: 12 }}>⚡ شدة: {voiceAnalysis.severity_hint}/5</span>
                      </div>
                      {voiceAnalysis.keywords && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {voiceAnalysis.keywords.map((kw, i) => (
                            <span key={i} style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.04)', fontSize: 11, color: '#6B6560' }}>#{kw}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Delete */}
                  <button onClick={() => { setVoiceText(''); setVoiceError(''); setVoiceAnalysis(null); }} style={{
                    width: '100%', marginTop: 8, padding: '8px 16px',
                    background: 'transparent', color: '#DC2626', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 10,
                    fontSize: 12, cursor: 'pointer', fontFamily: "'Tajawal', sans-serif",
                  }}>🗑️ حذف التسجيل وإعادة المحاولة</button>
                </div>
              )}

              {/* No text warning */}
              {!voiceText && audioBlob && !isRecording && !voiceError && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 10 }}>
                  <p style={{ fontSize: 13, color: '#92400E', margin: 0 }}>⚠️ تم التسجيل لكن ما قدرنا نحوّله لنص — ممكن الصوت كان غير واضح. التسجيل مرفق مع البلاغ.</p>
                </div>
              )}

              {/* Audio Playback */}
              {audioBlob && !isRecording && (
                <div style={{ marginTop: 12 }}>
                  <audio controls src={URL.createObjectURL(audioBlob)} style={{ width: '100%', height: 36, borderRadius: 8 }} />
                </div>
              )}
            </div>
          </div>
        )}

        {!voiceSupported && (
          <div style={{ marginBottom: 28, padding: '14px 18px', background: 'rgba(0,0,0,0.02)', borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: 13, color: '#6B6560', margin: 0 }}>🎙️ التسجيل الصوتي غير متاح — استخدم Chrome أو Edge</p>
          </div>
        )}
      
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.12)', borderRadius: 14, padding: '12px 16px', marginBottom: 14 }}>
            <span>⚠️</span><p style={{ color: '#DC2626', fontSize: 13, margin: 0 }}>{error}</p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading || !image} style={{
          width: '100%', padding: 18, border: 'none', borderRadius: 14, fontSize: 17, fontWeight: 700, fontFamily: "'Tajawal', sans-serif",
          background: loading ? 'rgba(3,71,31,0.08)' : !image ? 'rgba(0,0,0,0.04)' : '#03471f',
          color: loading || !image ? '#A0A0A0' : '#fff', cursor: loading || !image ? 'not-allowed' : 'pointer', transition: 'all 0.3s',
        }}>
          {loading ? 'جاري التحليل...' : '⬆️ إرسال البلاغ'}
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', marginTop: 24 }} className="fade-in">
          <div style={{ width: 44, height: 44, border: '3px solid rgba(3,71,31,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ marginTop: 16 }}>
            {[
              { s: 1, icon: '🤖', t: 'تحليل الصورة بالذكاء الاصطناعي...' },
              { s: 2, icon: '🎙️', t: 'تحليل الوصف الصوتي...' },
              { s: 3, icon: '📍', t: 'كشف البلاغات المكررة...' },
              { s: 4, icon: '⚡', t: 'حساب الأولوية الذكية...' },
              { s: 5, icon: '✨', t: 'شبه خلصنا...' },
            ].map(item => (
              <p key={item.s} style={{ fontSize: 13, color: step >= item.s ? 'var(--primary)' : 'var(--text-faint)', fontWeight: step === item.s ? 700 : 400, margin: '6px 0', transition: 'all 0.3s' }}>
                {step > item.s ? '✅' : step === item.s ? item.icon : '○'} {item.t}
              </p>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 20 }} className="fade-up">
        {[
          { icon: '🤖', title: 'تصنيف ذكي', desc: 'AI يحلل الصورة ويحدد النوع والشدة' },
          { icon: '📍', title: 'كشف التكرار', desc: 'يدمج البلاغات المتشابهة تلقائياً' },
          { icon: '⚡', title: 'أولوية ديناميكية', desc: 'تتغير حسب الخطورة والتكرار' },
        ].map((item, i) => (
          <div key={i} className="glass" style={{ padding: '24px 20px', textAlign: 'center' }}>
            <span style={{ fontSize: 28 }}>{item.icon}</span>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '8px 0 4px' }}>{item.title}</h3>
            <p style={{ fontSize: 12, color: '#6B6560', margin: 0 }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const st = {
  page: { padding: '40px 20px', maxWidth: 800, margin: '0 auto', minHeight: 'calc(100vh - 140px)' },
  label: { display: 'block', fontSize: 15, fontWeight: 700, color: '#1A1613', marginBottom: 12, fontFamily: "'Tajawal', sans-serif" },
  row: { display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' },
  rowL: { color: 'var(--text-dim)', fontSize: 13 },
  rowV: { color: 'var(--text)', fontSize: 13, fontWeight: 700 },
};

export default SubmitReport;
