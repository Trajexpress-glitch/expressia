/* ============================================================
   AI EXPRESS — Paywall ("Refaire le plein") + payment
   ============================================================ */

function planList(t) {
  return [
    {
      id: 'starter', name: 'Starter', price: '9', accent: 'var(--accent-3)',
      desc: t.plan_starter_d,
      feats: [`2 Go ${t.feat_kb}`, t.feat_text, `200 ${t.feat_img_n}`, t.feat_code],
    },
    {
      id: 'pro', name: 'Pro', price: '24', accent: 'var(--accent)', popular: true,
      desc: t.plan_pro_d,
      feats: [`12 Go ${t.feat_kb}`, t.feat_text, t.feat_img_unl, t.feat_code, t.feat_speed],
    },
    {
      id: 'max', name: 'Max', price: '59', accent: 'var(--accent-2)',
      desc: t.plan_max_d,
      feats: [`50 Go ${t.feat_kb}`, t.feat_text, t.feat_img_unl, t.feat_code, t.feat_speed, t.feat_support],
    },
  ];
}

function Paywall({ t, lang, low, onClose, onPaid }) {
  const [step, setStep] = useState('plans'); // plans | pay | success
  const [plan, setPlan] = useState(null);
  const [busy, setBusy] = useState(false);
  const [card, setCard] = useState({ num: '', exp: '', cvc: '', name: '' });
  const plans = planList(t);

  const pickPlan = (p) => { setPlan(p); setStep('pay'); };
  const pay = (e) => {
    e && e.preventDefault();
    setBusy(true);
    setTimeout(() => { setBusy(false); setStep('success'); }, 1400);
  };
  const finish = () => { onPaid(plan); };

  const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const fmtExp = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'grid', placeItems: 'center', padding: 24,
      background: 'oklch(0.10 0.02 258 / 0.78)', backdropFilter: 'blur(10px)', animation: 'fadeIn .25s ease both' }}>
      <div className="panel" style={{ width: '100%', maxWidth: step === 'plans' ? 940 : 460, position: 'relative', padding: 0, overflow: 'hidden', animation: 'popIn .35s var(--ease) both', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>

        <button onClick={onClose} className="center" style={{ position: 'absolute', top: 16, right: 16, zIndex: 2, width: 34, height: 34, borderRadius: 99, border: '1px solid var(--border-soft)', background: 'oklch(1 0 0 / 0.05)', color: 'var(--text-dim)', cursor: 'pointer' }}>
          <Ic.close style={{ width: 16, height: 16 }} />
        </button>

        {/* ============ PLANS ============ */}
        {step === 'plans' && (
          <div style={{ padding: 'clamp(26px, 3vw, 40px)', overflowY: 'auto' }}>
            <div style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 28px' }}>
              <span className="chip" style={{ color: low ? 'var(--warn)' : 'var(--danger)', borderColor: 'var(--border-bright)' }}>
                <Ic.fuel style={{ width: 14, height: 14 }} /> {low ? t.low_tank : t.pw_kicker}
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(26px, 3vw, 36px)', letterSpacing: '-0.02em', marginTop: 16 }}>
                {low ? t.pw_h_low : t.pw_h}
              </h2>
              <p className="dim" style={{ fontSize: 15.5, lineHeight: 1.6, marginTop: 10 }}>{low ? t.pw_sub_low : t.pw_sub}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="plan-grid">
              {plans.map((p, i) => (
                <div key={p.id} className="plan-card" style={{
                  position: 'relative', borderRadius: 18, padding: '24px 20px', display: 'flex', flexDirection: 'column',
                  border: p.popular ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                  background: p.popular ? 'linear-gradient(180deg, oklch(0.80 0.150 218 / 0.10), oklch(0.20 0.03 260 / 0.5))' : 'oklch(0.18 0.025 259 / 0.5)',
                  boxShadow: p.popular ? 'var(--glow-accent)' : 'none',
                  animation: `fadeUp .5s var(--ease) ${0.08 * i + 0.05}s both`,
                }}>
                  {p.popular && <span className="mono" style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: 'oklch(0.16 0.03 258)', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 99, whiteSpace: 'nowrap', letterSpacing: '0.03em' }}>{t.most_popular}</span>}
                  <div className="row gap-2" style={{ marginBottom: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: p.accent, boxShadow: `0 0 10px ${p.accent}` }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 19 }}>{p.name}</span>
                  </div>
                  <p className="faint" style={{ fontSize: 13, lineHeight: 1.5, minHeight: 38 }}>{p.desc}</p>
                  <div className="row" style={{ alignItems: 'baseline', gap: 4, margin: '14px 0 18px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 40, letterSpacing: '-0.03em' }}>{p.price}€</span>
                    <span className="faint" style={{ fontSize: 14 }}>{t.per_month}</span>
                  </div>
                  <div className="col" style={{ gap: 10, flex: 1, marginBottom: 20 }}>
                    {p.feats.map((f, j) => (
                      <div key={j} className="row gap-2" style={{ fontSize: 13.5, color: 'var(--text-dim)', alignItems: 'flex-start' }}>
                        <Ic.check style={{ width: 16, height: 16, color: p.accent, flex: 'none', marginTop: 1 }} /> <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button className={'btn ' + (p.popular ? 'btn-primary' : 'btn-ghost')} onClick={() => pickPlan(p)} style={{ width: '100%', justifyContent: 'center' }}>
                    {t.choose} {p.name}
                  </button>
                </div>
              ))}
            </div>
            <div className="row" style={{ justifyContent: 'center', gap: 8, marginTop: 24, color: 'var(--text-faint)', fontSize: 12.5 }}>
              <Ic.lock style={{ width: 14, height: 14 }} /> {t.pw_secure}
            </div>
          </div>
        )}

        {/* ============ PAYMENT ============ */}
        {step === 'pay' && plan && (
          <form onSubmit={pay} style={{ padding: 'clamp(26px, 3vw, 38px)', overflowY: 'auto' }}>
            <button type="button" onClick={() => setStep('plans')} className="faint" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, marginBottom: 16, fontFamily: 'var(--font-body)' }}>← {t.maybe_later === 'Maybe later' ? 'Back' : 'Retour'}</button>
            <div className="row gap-3" style={{ marginBottom: 22, padding: '14px 16px', borderRadius: 14, border: '1px solid var(--border)', background: 'oklch(1 0 0 / 0.03)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: plan.accent, boxShadow: `0 0 10px ${plan.accent}` }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontFamily: 'var(--font-display)' }}>AI Express {plan.name}</div>
                <div className="faint" style={{ fontSize: 12.5 }}>{plan.feats[0]}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>{plan.price}€<span className="faint" style={{ fontSize: 13, fontWeight: 400 }}>{t.per_month}</span></div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="label">{t.card_number}</label>
              <input className="field mono" inputMode="numeric" placeholder="4242 4242 4242 4242" value={card.num} onChange={(e) => setCard({ ...card, num: fmtCard(e.target.value) })} />
            </div>
            <div className="row gap-3" style={{ marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label className="label">{t.expiry}</label>
                <input className="field mono" placeholder="12/28" value={card.exp} onChange={(e) => setCard({ ...card, exp: fmtExp(e.target.value) })} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">{t.cvc}</label>
                <input className="field mono" inputMode="numeric" placeholder="123" maxLength={4} value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '') })} />
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label className="label">{t.cardholder}</label>
              <input className="field" placeholder={t.name_ph} value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
            </div>

            <button type="submit" className="btn btn-primary" disabled={busy} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15.5 }}>
              {busy ? <span className="mono">{t.processing}</span> : <><Ic.lock style={{ width: 16, height: 16 }} /> {t.pay_now} · {plan.price}€</>}
            </button>
            <div className="row" style={{ justifyContent: 'center', gap: 8, marginTop: 16, color: 'var(--text-faint)', fontSize: 12 }}>
              <Ic.lock style={{ width: 13, height: 13 }} /> {t.pw_secure}
            </div>
          </form>
        )}

        {/* ============ SUCCESS ============ */}
        {step === 'success' && (
          <div style={{ padding: 'clamp(34px, 4vw, 52px)', textAlign: 'center' }}>
            <div className="center" style={{ width: 76, height: 76, borderRadius: 22, margin: '0 auto 22px', background: 'linear-gradient(135deg, var(--success), var(--accent-3))', boxShadow: '0 0 50px -8px var(--success)', animation: 'popIn .5s var(--ease) both' }}>
              <Ic.check style={{ width: 40, height: 40, color: 'oklch(0.16 0.03 258)' }} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, letterSpacing: '-0.02em' }}>{t.success_h}</h2>
            <p className="dim" style={{ fontSize: 15.5, marginTop: 10, maxWidth: 360, marginInline: 'auto', lineHeight: 1.6 }}>{t.success_sub}</p>
            <button className="btn btn-primary" onClick={finish} style={{ marginTop: 26, justifyContent: 'center', padding: '13px 26px' }}>
              <Ic.bolt style={{ width: 16, height: 16 }} /> {t.back_to_app}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

window.Paywall = Paywall;
