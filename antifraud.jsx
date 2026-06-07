/* ============================================================
   AI EXPRESS — Anti-fraud / multi-account guard
   ------------------------------------------------------------
   ⚠️  PROTOTYPE / CLIENT-SIDE ONLY
   Le registre vit dans localStorage et l'IP est lue via une API
   publique (avec repli). C'est démonstratif : un vrai blocage
   exige un BACKEND qui stocke IP + empreinte + adresse vérifiée
   côté serveur (localStorage se contourne en navigation privée
   ou sur un autre appareil). La logique ci-dessous est conçue
   pour être rebranchée telle quelle sur une API serveur.
   ============================================================ */

const AF = (function () {
  const REG_KEY = 'aix_registry';     // [{ email, ip, fp, addr, address, ts }]
  const DEVICE_KEY = 'aix_device';

  function getDeviceId() {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) { id = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem(DEVICE_KEY, id); }
    return id;
  }

  function deviceFingerprint() {
    const sig = [
      navigator.userAgent, navigator.language,
      (screen.width + 'x' + screen.height), screen.colorDepth,
      new Date().getTimezoneOffset(), navigator.hardwareConcurrency || '',
      navigator.platform || '', getDeviceId(),
    ].join('|');
    let h = 0;
    for (let i = 0; i < sig.length; i++) { h = (h * 31 + sig.charCodeAt(i)) | 0; }
    return 'fp_' + (h >>> 0).toString(36);
  }

  async function getPublicIP() {
    // Works in a real browser. In sandboxed previews / offline → graceful fallback.
    const sources = ['https://api.ipify.org?format=json', 'https://api64.ipify.org?format=json'];
    for (const url of sources) {
      try {
        const ctrl = new AbortController();
        const tm = setTimeout(() => ctrl.abort(), 3500);
        const r = await fetch(url, { signal: ctrl.signal });
        clearTimeout(tm);
        const j = await r.json();
        if (j && j.ip) return j.ip;
      } catch (e) { /* try next */ }
    }
    // Stable per-device pseudo-IP so the same device still maps to one "IP".
    return '10.x·' + getDeviceId().slice(-6);
  }

  function normAddr(a) {
    return (a || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')   // strip accents
      .replace(/\b(rue|avenue|av|bd|boulevard|street|st|impasse|chemin|allee|place)\b/g, '')
      .replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function loadReg() { try { return JSON.parse(localStorage.getItem(REG_KEY)) || []; } catch (e) { return []; } }
  function saveReg(r) { localStorage.setItem(REG_KEY, JSON.stringify(r)); }
  function maskEmail(e) {
    const [u, d] = (e || '').split('@');
    if (!d) return e;
    const um = u.length <= 2 ? u[0] + '•' : u.slice(0, 2) + '•'.repeat(Math.min(u.length - 2, 4));
    return um + '@' + d;
  }

  /* The core gate. mode: 'signup' | 'signin'
     resolves with one of:
       { ok:true, account }
       { ok:false, reason:'duplicate', by:'address'|'ip'|'device', detail:{ ip, email } }
       { ok:false, reason:'exists', detail:{ email } }
  */
  async function evaluate({ email, address, mode }) {
    const ip = await getPublicIP();
    const fp = deviceFingerprint();
    const addr = normAddr(address);
    const em = (email || '').trim().toLowerCase();
    const reg = loadReg();
    const existing = reg.find((r) => r.email === em);

    if (mode === 'signin') {
      // Returning user signing into their own account → always allowed.
      if (existing) return { ok: true, account: existing };
      // Unknown email on sign-in: register it for this session (no duplicate block).
      const acct = { email: em, ip, fp, addr, address: address || '', ts: Date.now() };
      reg.push(acct); saveReg(reg);
      return { ok: true, account: acct };
    }

    // ---- SIGN-UP ----
    if (existing) return { ok: false, reason: 'exists', detail: { email: em } };

    // Any DIFFERENT account already tied to this address / IP / device?
    const dupAddr = addr && reg.find((r) => r.addr && r.addr === addr);
    const dupIp = reg.find((r) => r.ip === ip);
    const dupFp = reg.find((r) => r.fp === fp);
    const hit = dupAddr || dupIp || dupFp;
    if (hit) {
      const by = dupAddr ? 'address' : (dupIp ? 'ip' : 'device');
      return { ok: false, reason: 'duplicate', by, detail: { ip, email: maskEmail(hit.email) } };
    }

    const acct = { email: em, ip, fp, addr, address: address || '', ts: Date.now() };
    reg.push(acct); saveReg(reg);
    return { ok: true, account: acct };
  }

  return { evaluate, getPublicIP, maskEmail, _loadReg: loadReg };
})();

window.AF = AF;
