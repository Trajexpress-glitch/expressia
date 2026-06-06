/* ============================================================
   AI EXPRESS — Auth screen (sign in / sign up)
   ============================================================ */

function AuthScreen({ t, lang, setLang, onAuth }) {
  const [mode, setMode] = useState('signup'); // 'signin' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const valid = form.email.includes('@') && form.password.length >= 4 && (mode === 'signin' || form.name.trim());

  const submit = (e) => {
    e && e.preventDefault();
    if (!valid && mode === 'signup') { /* allow google fast-path even if invalid */ }
    setBusy(true);
    setTimeout(() => {
      onAuth({ name: form.name || (form.email.split('@')[0] || 'Alex'), email: form.email || 'alex@exemple.com' });
    }, 700);
  };

  const features = [
    { ic: Ic.spark, txt: t.f_live },
    { ic: Ic.image, txt: t.f_img },
    { ic: Ic.code, txt: t.f_code },
  ];

  return (
    <div style={{ position: 'relative', zIndex: 1, height: '100vh', display: 'grid', gridTemplateColumns: 'minmax(0, 1.05fr) minmax(440px, 0.95fr)' }} className="auth-grid">
      {/* ---- Left: pitch ---- */}
      <div style={{ padding: 'clamp(28px, 5vw, 64px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }} className="auth-left">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <Brand size={21} />
          <LangToggle lang={lang} setLang={setLang} />
        </div>

        <div style={{ maxWidth: 580 }}>
          <div className="row gap-2" style={{ marginBottom: 22 }}>
            <span className="chip" style={{ color: 'var(--accent)', borderColor: 'var(--border-bright)', animation: 'fadeUp .6s var(--ease) both' }}>
              <Ic.bolt style={{ width: 14, height: 14 }} /> {t.auth_kicker}
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(34px, 4.4vw, 58px)', lineHeight: 1.04, letterSpacing: '-0.025em', whiteSpace: 'pre-line', animation: 'fadeUp .7s var(--ease) .05s both' }}>
            {t.auth_h}
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 'clamp(15px, 1.4vw, 18px)', lineHeight: 1.6, marginTop: 22, maxWidth: 500, animation: 'fadeUp .7s var(--ease) .12s both' }}>
            {t.auth_sub}
          </p>

          <div className="col gap-3" style={{ marginTop: 34, animation: 'fadeUp .7s var(--ease) .2s both' }}>
            {features.map((f, i) => (
              <div key={i} className="row gap-3">
                <span className="center" style={{ width: 38, height: 38, borderRadius: 11, background: 'oklch(0.80 0.150 218 / 0.12)', border: '1px solid var(--border-soft)', color: 'var(--accent)', flex: 'none' }}>
                  <f.ic style={{ width: 19, height: 19 }} />
                </span>
                <span style={{ fontSize: 16, fontWeight: 500 }}>{f.txt}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="row gap-3" style={{ color: 'var(--text-faint)', fontSize: 13.5, animation: 'fadeUp .7s var(--ease) .28s both' }}>
          <span className="center" style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }} />
          {t.trust}
        </div>

        {/* floating tank preview */}
        <div className="tank-float glass" style={{ position: 'absolute', right: -40, bottom: 90, width: 230, padding: 15, borderRadius: 16, transform: 'rotate(-4deg)', opacity: 0.92, animation: 'fadeIn 1s ease .5s both, drift 14s ease-in-out infinite alternate' }}>
          <div className="row gap-2" style={{ color: 'var(--accent)', fontSize: 12.5, fontWeight: 600, marginBottom: 10 }}>
            <Ic.fuel style={{ width: 15, height: 15 }} /> <span style={{ color: 'var(--text)' }}>{t.free_tank}</span>
          </div>
          <div className="row" style={{ gap: 3 }}>
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: 12, borderRadius: 2, background: i < 14 ? 'var(--accent)' : 'oklch(1 0 0 / 0.08)', boxShadow: i < 14 ? '0 0 8px -1px var(--accent)' : 'none' }} />
            ))}
          </div>
          <div className="mono" style={{ marginTop: 9, fontSize: 11.5, color: 'var(--text-dim)' }}>500 Ko · 100%</div>
        </div>
      </div>

      {/* ---- Right: form ---- */}
      <div className="auth-right" style={{ display: 'grid', placeItems: 'center', padding: 'clamp(24px, 4vw, 48px)' }}>
        <form onSubmit={submit} className="glass" style={{ width: '100%', maxWidth: 420, padding: 'clamp(26px, 3vw, 38px)', animation: 'popIn .6s var(--ease) .1s both' }}>
          {/* tabs */}
          <div className="row" style={{ background: 'oklch(0.13 0.02 258 / 0.6)', borderRadius: 999, padding: 4, marginBottom: 26 }}>
            {[['signin', t.tab_signin], ['signup', t.tab_signup]].map(([m, label]) => (
              <button type="button" key={m} onClick={() => setMode(m)}
                style={{ flex: 1, border: 'none', cursor: 'pointer', borderRadius: 999, padding: '10px', fontSize: 14.5, fontWeight: 600, fontFamily: 'var(--font-body)',
                  background: mode === m ? 'var(--surface-3)' : 'transparent', color: mode === m ? 'var(--text)' : 'var(--text-faint)',
                  boxShadow: mode === m ? 'var(--shadow-card)' : 'none', transition: 'all .2s var(--ease)' }}>
                {label}
              </button>
            ))}
          </div>

          {mode === 'signup' && (
            <div style={{ marginBottom: 16, animation: 'fadeUp .3s var(--ease) both' }}>
              <label className="label">{t.name}</label>
              <input className="field" placeholder={t.name_ph} value={form.name} onChange={set('name')} />
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label className="label">{t.email}</label>
            <input className="field" type="email" placeholder={t.email_ph} value={form.email} onChange={set('email')} />
          </div>
          <div style={{ marginBottom: 22 }}>
            <label className="label">{t.password}</label>
            <input className="field" type="password" placeholder={t.password_ph} value={form.password} onChange={set('password')} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={busy} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15.5 }}>
            {busy ? <span className="mono">···</span> : <>{mode === 'signup' ? t.signup : t.signin} <Ic.bolt style={{ width: 16, height: 16 }} /></>}
          </button>

          <div className="row gap-3" style={{ margin: '20px 0', color: 'var(--text-faint)', fontSize: 12.5 }}>
            <span style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} /> {t.or} <span style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
          </div>

          <button type="button" className="btn btn-ghost" onClick={submit} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            <Ic.google style={{ width: 18, height: 18 }} /> {t.google}
          </button>

          <p className="faint" style={{ fontSize: 12, lineHeight: 1.6, marginTop: 20, textAlign: 'center' }}>{t.terms}</p>
        </form>
      </div>
    </div>
  );
}

window.AuthScreen = AuthScreen;
