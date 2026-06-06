/* ============================================================
   AI EXPRESS — Shared UI primitives
   ============================================================ */
const { useState, useRef, useEffect, useCallback } = React;

/* ---------- Icons (stroke, 24x24) ---------- */
const Ic = {
  bolt: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" fill="currentColor" stroke="none"/></svg>,
  send: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 12 20 4l-4 16-4-7-8-1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/></svg>,
  text: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 6h14M5 12h14M5 18h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  image: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8"/><circle cx="9" cy="10" r="1.7" stroke="currentColor" strokeWidth="1.6"/><path d="m5 17 4.5-4 3 2.5L16 11l3.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/></svg>,
  code: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m9 8-4 4 4 4M15 8l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  plus: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>,
  copy: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="8" y="8" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.7"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="1.7"/></svg>,
  check: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  refresh: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M20 11a8 8 0 1 0-.7 3.3M20 5v6h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  fuel: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M4 21h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 9h2.5a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V9l-2.5-2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 8h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  user: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7"/><path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  logout: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M16 16l4-4-4-4M20 12H9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  google: (p) => <svg viewBox="0 0 24 24" {...p}><path fill="#4285F4" d="M22.5 12.2c0-.7-.06-1.4-.18-2.06H12v3.9h5.9a5 5 0 0 1-2.18 3.3v2.74h3.52c2.06-1.9 3.26-4.7 3.26-7.88Z"/><path fill="#34A853" d="M12 23c2.94 0 5.42-.97 7.22-2.64l-3.52-2.74c-.98.66-2.23 1.05-3.7 1.05-2.84 0-5.25-1.92-6.11-4.5H2.26v2.82A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.89 14.17a6.6 6.6 0 0 1 0-4.34V7.01H2.26a11 11 0 0 0 0 9.98l3.63-2.82Z"/><path fill="#EA4335" d="M12 5.38c1.6 0 3.04.55 4.17 1.63l3.12-3.12C17.42 2.1 14.94 1 12 1A11 11 0 0 0 2.26 7.01l3.63 2.82C6.75 7.3 9.16 5.38 12 5.38Z"/></svg>,
  close: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  spark: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  lock: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="5" y="10" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.7"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7"/></svg>,
};

/* ---------- Logo ---------- */
function Brand({ size = 19, onClick }) {
  return (
    <div className="brand" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <span className="mark"><Ic.bolt style={{ color: 'oklch(0.16 0.03 258)' }} /></span>
      <span className="name" style={{ fontSize: size }}>AI <b>Express</b></span>
    </div>
  );
}

/* ---------- Language toggle ---------- */
function LangToggle({ lang, setLang }) {
  return (
    <div className="row" style={{ background: 'oklch(0.13 0.02 258 / 0.6)', border: '1px solid var(--border-soft)', borderRadius: 999, padding: 3, fontFamily: 'var(--font-mono)' }}>
      {['fr', 'en'].map((l) => (
        <button key={l} onClick={() => setLang(l)}
          style={{
            border: 'none', cursor: 'pointer', borderRadius: 999, padding: '5px 12px', fontSize: 12.5, fontWeight: 600,
            fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
            background: lang === l ? 'var(--accent)' : 'transparent',
            color: lang === l ? 'oklch(0.16 0.03 258)' : 'var(--text-dim)',
            transition: 'all .16s var(--ease)',
          }}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}

/* ---------- KB formatter ---------- */
function fmtKB(kb) {
  if (kb >= 1024) return (kb / 1024).toFixed(kb >= 10240 ? 0 : 1) + ' Mo';
  return Math.round(kb) + ' Ko';
}

/* ---------- Data Tank Gauge ----------
   ratio 0..1 of how FULL the tank is (1 = full, 0 = empty) */
function DataTank({ usedKB, quotaKB, t, compact, onRefill }) {
  const remaining = Math.max(0, quotaKB - usedKB);
  const fillRatio = Math.max(0, Math.min(1, remaining / quotaKB));
  const pct = Math.round(fillRatio * 100);
  const low = fillRatio <= 0.18;
  const empty = remaining <= 0;
  const color = empty ? 'var(--danger)' : low ? 'var(--warn)' : 'var(--accent)';

  return (
    <div className="glass" style={{ padding: compact ? '13px 14px' : '16px', borderRadius: 14 }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 11 }}>
        <div className="row gap-2" style={{ color: color, fontWeight: 600, fontSize: 13 }}>
          <Ic.fuel style={{ width: 17, height: 17 }} />
          <span style={{ color: 'var(--text)' }}>{t.data_tank}</span>
        </div>
        <span className="mono" style={{ fontSize: 12.5, color: color, fontWeight: 600 }}>{pct}%</span>
      </div>

      {/* Segmented gauge */}
      <div className="row" style={{ gap: 3, marginBottom: 10 }}>
        {Array.from({ length: 16 }).map((_, i) => {
          const on = i < Math.round(fillRatio * 16);
          return <div key={i} style={{
            flex: 1, height: 14, borderRadius: 3,
            background: on ? color : 'oklch(1 0 0 / 0.06)',
            boxShadow: on ? `0 0 10px -2px ${color}` : 'none',
            transition: 'all .35s var(--ease)',
          }} />;
        })}
      </div>

      <div className="row" style={{ justifyContent: 'space-between', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
        <span className="faint">{fmtKB(usedKB)} {t.used}</span>
        <span style={{ color: 'var(--text-dim)' }}>{fmtKB(remaining)} {t.remaining}</span>
      </div>

      {(low || empty) && (
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 13, justifyContent: 'center' }} onClick={onRefill}>
          <Ic.fuel style={{ width: 16, height: 16 }} /> {t.refill}
        </button>
      )}
    </div>
  );
}

Object.assign(window, { Ic, Brand, LangToggle, DataTank, fmtKB });
