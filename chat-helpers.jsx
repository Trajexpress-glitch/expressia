/* ============================================================
   AI EXPRESS — Chat (live AI via window.claude.complete)
   ============================================================ */

/* ----- byte → KB helper ----- */
function bytesKB(str) { return new Blob([str]).size / 1024; }

/* ----- lightweight markdown renderer (code blocks, bold, lists) ----- */
function renderRich(text, t) {
  const parts = text.split(/```/);
  return parts.map((chunk, i) => {
    if (i % 2 === 1) {
      // code block — first line may be a language
      const nl = chunk.indexOf('\n');
      const lang = nl > 0 && chunk.slice(0, nl).trim().length < 16 && !chunk.slice(0, nl).includes(' ') ? chunk.slice(0, nl).trim() : '';
      const code = lang ? chunk.slice(nl + 1) : chunk;
      return <CodeBlock key={i} code={code.replace(/\n$/, '')} lang={lang} t={t} />;
    }
    return <RichText key={i} text={chunk} />;
  });
}

function RichText({ text }) {
  const lines = text.split('\n');
  const out = [];
  let list = [];
  const flush = (key) => { if (list.length) { out.push(<ul key={'ul' + key} style={{ margin: '6px 0 10px', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 5 }}>{list}</ul>); list = []; } };
  lines.forEach((ln, i) => {
    const m = ln.match(/^\s*[-*]\s+(.*)/);
    if (m) { list.push(<li key={i} style={{ lineHeight: 1.6 }}>{inline(m[1])}</li>); return; }
    flush(i);
    if (ln.trim() === '') return;
    const h = ln.match(/^#{1,3}\s+(.*)/);
    if (h) { out.push(<div key={i} style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, margin: '10px 0 4px' }}>{inline(h[1])}</div>); return; }
    out.push(<p key={i} style={{ lineHeight: 1.68, margin: '0 0 9px' }}>{inline(ln)}</p>);
  });
  flush('end');
  return <>{out}</>;
}

function inline(s) {
  // split on **bold** and `code`
  const nodes = []; let rest = s; let k = 0;
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/;
  while (true) {
    const m = rest.match(re);
    if (!m) { nodes.push(rest); break; }
    if (m.index > 0) nodes.push(rest.slice(0, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) nodes.push(<strong key={k++} style={{ color: 'var(--text)', fontWeight: 600 }}>{tok.slice(2, -2)}</strong>);
    else nodes.push(<code key={k++} className="mono" style={{ background: 'oklch(0.80 0.150 218 / 0.13)', color: 'var(--accent-3)', padding: '1px 6px', borderRadius: 5, fontSize: '0.9em' }}>{tok.slice(1, -1)}</code>);
    rest = rest.slice(m.index + tok.length);
  }
  return nodes;
}

function CodeBlock({ code, lang, t }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard && navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div style={{ margin: '10px 0 12px', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: 'oklch(0.11 0.018 258)' }}>
      <div className="row" style={{ justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid var(--border-soft)', background: 'oklch(0.14 0.02 258)' }}>
        <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-faint)', letterSpacing: '0.05em' }}>{lang || 'code'}</span>
        <button className="chip" style={{ padding: '4px 9px', fontSize: 11.5 }} onClick={copy}>
          {copied ? <><Ic.check style={{ width: 13, height: 13, color: 'var(--success)' }} /> {t.copied}</> : <><Ic.copy style={{ width: 13, height: 13 }} /> {t.copy}</>}
        </button>
      </div>
      <pre className="mono" style={{ margin: 0, padding: '14px 14px', fontSize: 13, lineHeight: 1.6, overflowX: 'auto', color: 'oklch(0.90 0.02 250)' }}><code>{code}</code></pre>
    </div>
  );
}

/* ----- AI image card (real image if a URL is provided, else placeholder) ----- */
function ImageResult({ prompt, t, seed, imageUrl }) {
  const hue1 = (seed * 47) % 360, hue2 = (hue1 + 60) % 360;
  const isUrl = typeof imageUrl === 'string' && /^https?:\/\//.test(imageUrl);
  if (isUrl) {
    return (
      <div style={{ marginTop: 4 }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 420, aspectRatio: '1 / 1', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', background: 'oklch(0.18 0.03 260)', animation: 'popIn .5s var(--ease) both' }}>
          <img src={imageUrl} alt={prompt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px', background: 'linear-gradient(0deg, oklch(0.10 0.02 258 / 0.92), transparent)' }}>
            <div style={{ fontSize: 13, color: 'oklch(1 0 0 / 0.92)', lineHeight: 1.45 }}>“{prompt}”</div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{
        position: 'relative', width: '100%', maxWidth: 420, aspectRatio: '1 / 1', borderRadius: 16, overflow: 'hidden',
        border: '1px solid var(--border)',
        background: `
          repeating-linear-gradient(135deg, oklch(0.30 0.03 260 / 0.5) 0 14px, transparent 14px 28px),
          radial-gradient(120% 100% at 20% 10%, oklch(0.55 0.16 ${hue1}) 0%, transparent 55%),
          radial-gradient(120% 100% at 90% 100%, oklch(0.50 0.16 ${hue2}) 0%, transparent 60%),
          oklch(0.20 0.03 260)`,
        animation: 'popIn .5s var(--ease) both',
      }}>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
          <div>
            <Ic.image style={{ width: 30, height: 30, color: 'oklch(1 0 0 / 0.55)', margin: '0 auto 10px' }} />
            <div className="mono" style={{ fontSize: 11, color: 'oklch(1 0 0 / 0.6)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t.drop_hint}</div>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '14px', background: 'linear-gradient(0deg, oklch(0.10 0.02 258 / 0.92), transparent)' }}>
          <div style={{ fontSize: 13, color: 'oklch(1 0 0 / 0.92)', lineHeight: 1.45 }}>“{prompt}”</div>
        </div>
      </div>
    </div>
  );
}

window.ChatHelpers = { bytesKB, renderRich, ImageResult };
