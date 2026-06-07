/* ============================================================
   AI EXPRESS — Chat application shell
   ============================================================ */

const MODES = [
  { id: 'text', ic: 'text', label: 'mode_text' },
  { id: 'image', ic: 'image', label: 'mode_image' },
  { id: 'code', ic: 'code', label: 'mode_code' },
];

function ChatApp({ t, lang, setLang, user, usedKB, quotaKB, addUsage, onRefill, onSignout }) {
  const [mode, setMode] = useState('text');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);   // {role, mode, content, kb, seed}
  const [busy, setBusy] = useState(false);
  const [convs, setConvs] = useState([]);          // history items
  const [acctOpen, setAcctOpen] = useState(false);
  const scrollRef = useRef(null);
  const taRef = useRef(null);
  const remaining = Math.max(0, quotaKB - usedKB);
  const { bytesKB, renderRich, ImageResult } = window.ChatHelpers;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  const newChat = () => { if (messages.length) setConvs((c) => [{ id: Date.now(), title: messages[0].content.slice(0, 38), msgs: messages }, ...c]); setMessages([]); setInput(''); };

  const placeholders = { text: t.ask_ph, image: t.ask_ph_img, code: t.ask_ph_code };

  async function callAI(prompt, m, history) {
    const sys = {
      text: "Tu es AI Express, un assistant IA utile, clair et concis. Réponds dans la langue de l'utilisateur. Utilise du markdown léger (gras, listes) quand utile.",
      code: "Tu es AI Express, un assistant de programmation expert. Donne du code propre et complet dans des blocs ```langage. Ajoute une courte explication. Réponds dans la langue de l'utilisateur.",
      image: "Tu génères une légende artistique vivante et brève (1 phrase) décrivant l'image demandée, dans la langue de l'utilisateur. Réponds uniquement par la légende, sans guillemets.",
    }[m];
    const msgs = [{ role: 'user', content: sys + "\n\n---\n" }];
    history.slice(-6).forEach((h) => msgs.push({ role: h.role === 'ai' ? 'assistant' : 'user', content: typeof h.content === 'string' ? h.content : prompt }));
    msgs.push({ role: 'user', content: prompt });
    try {
      const out = await window.claude.complete({ messages: msgs });
      return (out || '').trim() || "…";
    } catch (e) {
      return lang === 'fr' ? "Désolé, une erreur est survenue. Réessayez." : "Sorry, something went wrong. Please try again.";
    }
  }

  async function send(text) {
    const prompt = (text != null ? text : input).trim();
    if (!prompt || busy) return;
    // gate: empty tank
    if (remaining <= 0) { onRefill(); return; }

    const m = mode;
    const userMsg = { role: 'user', mode: m, content: prompt, kb: bytesKB(prompt) };
    setMessages((prev) => [...prev, userMsg]);
    setInput(''); if (taRef.current) taRef.current.style.height = 'auto';
    setBusy(true);
    addUsage(userMsg.kb * 0.2);

    const reply = await callAI(prompt, m, messages);

    // KB accounting — code/apps cost the most, images are heavy files
    let kb;
    if (m === 'image') kb = 70 + Math.random() * 80;          // ~70–150 Ko / image
    else if (m === 'code') kb = bytesKB(reply) * 8 + 18;       // app bundle weight
    else kb = bytesKB(reply);                                  // plain text ~ small
    kb = Math.round(kb * 10) / 10;

    const aiMsg = { role: 'ai', mode: m, content: reply, kb, seed: Math.floor(Math.random() * 999) };
    setMessages((prev) => [...prev, aiMsg]);
    setBusy(false);
    addUsage(kb);
  }

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
  const autoGrow = (e) => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'; };

  const suggestions = [
    { m: 'text', txt: t.s1 }, { m: 'image', txt: t.s2 }, { m: 'code', txt: t.s3 }, { m: 'text', txt: t.s4 },
  ];

  return (
    <div style={{ position: 'relative', zIndex: 1, height: '100vh', display: 'grid', gridTemplateColumns: '276px minmax(0,1fr)' }} className="app-grid">
      {/* ============ SIDEBAR ============ */}
      <aside className="sidebar" style={{ borderRight: '1px solid var(--border-soft)', background: 'oklch(0.14 0.02 258 / 0.55)', backdropFilter: 'blur(14px)', display: 'flex', flexDirection: 'column', padding: 16, gap: 14 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <Brand size={18} />
          <LangToggle lang={lang} setLang={setLang} />
        </div>

        <button className="btn btn-primary" onClick={newChat} style={{ justifyContent: 'center', width: '100%' }}>
          <Ic.plus style={{ width: 17, height: 17 }} /> {t.new_chat}
        </button>

        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, marginTop: 4 }}>
          <div className="label" style={{ marginBottom: 8, paddingLeft: 4 }}>{t.history}</div>
          <div className="col" style={{ gap: 3 }}>
            {convs.length === 0 && <div className="faint" style={{ fontSize: 13, padding: '8px 6px', lineHeight: 1.5 }}>—</div>}
            {convs.map((c) => (
              <button key={c.id} onClick={() => setMessages(c.msgs)} className="hist-item"
                style={{ textAlign: 'left', border: 'none', background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer', padding: '9px 10px', borderRadius: 9, fontSize: 13.5, fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'all .15s' }}>
                {c.title}…
              </button>
            ))}
          </div>
        </div>

        <DataTank usedKB={usedKB} quotaKB={quotaKB} t={t} onRefill={onRefill} />

        {/* account */}
        <div style={{ position: 'relative' }}>
          {acctOpen && (
            <div className="glass" style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, right: 0, padding: 6, animation: 'popIn .2s var(--ease) both' }}>
              <button className="acct-row" onClick={onRefill}><Ic.fuel style={{ width: 16, height: 16 }} /> {t.refill}</button>
              <button className="acct-row" onClick={onSignout}><Ic.logout style={{ width: 16, height: 16 }} /> {t.signout}</button>
            </div>
          )}
          <button onClick={() => setAcctOpen((o) => !o)} className="row gap-3"
            style={{ width: '100%', border: '1px solid var(--border-soft)', background: 'oklch(1 0 0 / 0.03)', borderRadius: 12, padding: '9px 11px', cursor: 'pointer', color: 'var(--text)' }}>
            <span className="center" style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: 'oklch(0.16 0.03 258)', fontWeight: 700, fontFamily: 'var(--font-display)', flex: 'none' }}>
              {(user.name || 'A').charAt(0).toUpperCase()}
            </span>
            <span style={{ textAlign: 'left', overflow: 'hidden' }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
              {user.email ? <div className="faint" style={{ fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div> : null}
            </span>
          </button>
        </div>
      </aside>

      {/* ============ MAIN ============ */}
      <main style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* scroll area */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 24px 8px' }}>
            {messages.length === 0 ? (
              <Welcome t={t} suggestions={suggestions} onPick={(s) => { setMode(s.m); send(s.txt); }} />
            ) : (
              <div className="col" style={{ gap: 26 }}>
                {messages.map((msg, i) => <Message key={i} msg={msg} t={t} renderRich={renderRich} ImageResult={ImageResult} onRegen={msg.role === 'ai' ? () => send(messages[i - 1] && messages[i - 1].content) : null} />)}
                {busy && <Thinking t={t} mode={mode} />}
              </div>
            )}
          </div>
        </div>

        {/* composer */}
        <div style={{ padding: '10px 24px 22px', background: 'linear-gradient(0deg, var(--bg) 30%, transparent)' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            {/* mode chips */}
            <div className="row gap-2" style={{ marginBottom: 10 }}>
              {MODES.map((mm) => {
                const I = Ic[mm.ic];
                return (
                  <button key={mm.id} className={'chip' + (mode === mm.id ? ' active' : '')} onClick={() => setMode(mm.id)}>
                    <I style={{ width: 15, height: 15 }} /> {t[mm.label]}
                  </button>
                );
              })}
              {remaining <= 0 && <span className="chip" style={{ marginLeft: 'auto', color: 'var(--danger)', borderColor: 'var(--danger)' }}><Ic.fuel style={{ width: 14, height: 14 }} /> {t.pw_kicker}</span>}
            </div>

            <div className="glass composer" style={{ padding: 10, borderRadius: 18, display: 'flex', alignItems: 'flex-end', gap: 10, borderColor: 'var(--border)' }}>
              <textarea ref={taRef} className="composer-ta" rows={1} value={input} onChange={autoGrow} onKeyDown={onKey}
                placeholder={placeholders[mode]}
                style={{ flex: 1, resize: 'none', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 15.5, lineHeight: 1.5, padding: '8px 6px', maxHeight: 200 }} />
              <button className="btn btn-primary" onClick={() => send()} disabled={busy || !input.trim()} style={{ padding: '11px 14px', borderRadius: 12 }}>
                <Ic.send style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <div className="row" style={{ justifyContent: 'center', gap: 7, marginTop: 10, color: 'var(--text-faint)', fontSize: 11.5 }}>
              <Ic.bolt style={{ width: 12, height: 12, color: 'var(--accent)' }} />
              <span className="mono">{lang === 'fr' ? 'Réponses générées par IA · vérifiez les informations importantes' : 'AI-generated · verify important information'}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ----- Welcome / empty state ----- */
function Welcome({ t, suggestions, onPick }) {
  return (
    <div style={{ paddingTop: 'min(8vh, 70px)', animation: 'fadeUp .6s var(--ease) both' }}>
      <div className="center" style={{ width: 60, height: 60, borderRadius: 18, margin: '0 auto 22px',
        background: 'linear-gradient(135deg, var(--accent-3), var(--accent) 50%, var(--accent-2))',
        boxShadow: 'var(--glow-accent)', animation: 'pulse-ring 2.6s ease-out infinite' }}>
        <Ic.bolt style={{ width: 30, height: 30, color: 'oklch(0.16 0.03 258)' }} />
      </div>
      <h1 style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, letterSpacing: '-0.02em' }}>
        {t.tagline}
      </h1>
      <p className="dim" style={{ textAlign: 'center', marginTop: 8, fontSize: 15 }}>{t.suggestions}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 26 }}>
        {suggestions.map((s, i) => {
          const I = Ic[s.m === 'image' ? 'image' : s.m === 'code' ? 'code' : 'spark'];
          return (
            <button key={i} onClick={() => onPick(s)} className="suggest-card panel"
              style={{ textAlign: 'left', padding: '15px 16px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start', color: 'var(--text)', animation: `fadeUp .5s var(--ease) ${0.06 * i + 0.1}s both` }}>
              <span className="center" style={{ width: 32, height: 32, borderRadius: 9, background: 'oklch(0.80 0.150 218 / 0.12)', color: 'var(--accent)', flex: 'none' }}>
                <I style={{ width: 17, height: 17 }} />
              </span>
              <span style={{ fontSize: 14, lineHeight: 1.45 }}>{s.txt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ----- single message ----- */
function Message({ msg, t, renderRich, ImageResult, onRegen }) {
  const isUser = msg.role === 'user';
  return (
    <div className="row" style={{ gap: 14, alignItems: 'flex-start', flexDirection: isUser ? 'row-reverse' : 'row', animation: 'fadeUp .4s var(--ease) both' }}>
      <span className="center" style={{ width: 34, height: 34, borderRadius: 10, flex: 'none',
        background: isUser ? 'var(--surface-3)' : 'linear-gradient(135deg, var(--accent-3), var(--accent) 50%, var(--accent-2))',
        color: isUser ? 'var(--text-dim)' : 'oklch(0.16 0.03 258)', border: isUser ? '1px solid var(--border)' : 'none' }}>
        {isUser ? <Ic.user style={{ width: 18, height: 18 }} /> : <Ic.bolt style={{ width: 17, height: 17 }} />}
      </span>
      <div style={{ maxWidth: '82%', minWidth: 0 }}>
        <div className="row gap-2" style={{ marginBottom: 5, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dim)' }}>{isUser ? t.you : 'AI Express'}</span>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-faint)', background: 'oklch(1 0 0 / 0.04)', padding: '2px 7px', borderRadius: 99 }}>
            {msg.kb < 1 ? msg.kb.toFixed(1) : Math.round(msg.kb)} Ko
          </span>
        </div>
        <div className={isUser ? '' : 'panel'} style={isUser
          ? { background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '16px 16px 4px 16px', padding: '12px 16px', fontSize: 15.5, lineHeight: 1.6 }
          : { padding: '15px 18px', borderRadius: '4px 16px 16px 16px', fontSize: 15 }}>
          {msg.mode === 'image' && !isUser
            ? <ImageResult prompt={msg.content} t={t} seed={msg.seed || 1} />
            : (isUser ? msg.content : renderRich(msg.content, t))}
        </div>
        {!isUser && onRegen && msg.mode !== 'image' && (
          <button className="chip" style={{ marginTop: 9, padding: '5px 10px', fontSize: 12 }} onClick={onRegen}>
            <Ic.refresh style={{ width: 13, height: 13 }} /> {t.regenerate}
          </button>
        )}
      </div>
    </div>
  );
}

/* ----- thinking indicator ----- */
function Thinking({ t, mode }) {
  return (
    <div className="row" style={{ gap: 14, alignItems: 'flex-start', animation: 'fadeIn .3s ease both' }}>
      <span className="center" style={{ width: 34, height: 34, borderRadius: 10, flex: 'none', background: 'linear-gradient(135deg, var(--accent-3), var(--accent) 50%, var(--accent-2))', color: 'oklch(0.16 0.03 258)' }}>
        <Ic.bolt style={{ width: 17, height: 17 }} />
      </span>
      <div className="panel" style={{ padding: '14px 18px', borderRadius: '4px 16px 16px 16px', display: 'flex', alignItems: 'center', gap: 11 }}>
        <span className="row" style={{ gap: 5 }}>
          {[0, 1, 2].map((i) => <span key={i} style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--accent)', animation: `blink 1.2s ${i * 0.18}s infinite ease-in-out` }} />)}
        </span>
        <span className="dim" style={{ fontSize: 14 }}>{mode === 'image' ? t.generating_img : t.thinking}…</span>
      </div>
    </div>
  );
}

window.ChatApp = ChatApp;
