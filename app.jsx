/* ============================================================
   AI EXPRESS — Root app & state
   ============================================================ */

const FREE_QUOTA = 500; // Ko offerts
const PLAN_QUOTA = { starter: 2048, pro: 12288, max: 51200 };

function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('aix_lang') || 'fr');
  const [screen, setScreen] = useState(() => (localStorage.getItem('aix_user') ? 'app' : 'auth'));
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('aix_user')) || null; } catch { return null; } });
  const [usedKB, setUsedKB] = useState(() => parseFloat(localStorage.getItem('aix_used') || '0'));
  const [quotaKB, setQuotaKB] = useState(() => parseFloat(localStorage.getItem('aix_quota') || FREE_QUOTA));
  const [paywall, setPaywall] = useState(false);

  const t = STRINGS[lang];

  useEffect(() => { localStorage.setItem('aix_lang', lang); }, [lang]);
  useEffect(() => { localStorage.setItem('aix_used', String(usedKB)); }, [usedKB]);
  useEffect(() => { localStorage.setItem('aix_quota', String(quotaKB)); }, [quotaKB]);

  const remaining = quotaKB - usedKB;

  // auto-open paywall when the tank runs dry
  useEffect(() => {
    if (screen === 'app' && remaining <= 0 && !paywall) {
      const tm = setTimeout(() => setPaywall(true), 600);
      return () => clearTimeout(tm);
    }
  }, [remaining, screen]);

  const addUsage = (kb) => setUsedKB((u) => Math.min(quotaKB + 5, u + kb));

  const onAuth = (u) => { setUser(u); localStorage.setItem('aix_user', JSON.stringify(u)); setScreen('app'); };
  const onSignout = () => { localStorage.removeItem('aix_user'); setUser(null); setScreen('auth'); };

  const onPaid = (plan) => {
    setQuotaKB(PLAN_QUOTA[plan.id] || FREE_QUOTA);
    setUsedKB(0);
    setPaywall(false);
  };

  // dev helper: double-click brand area resets tank (kept subtle)
  const lowWarn = remaining > 0 && remaining / quotaKB <= 0.18;

  return (
    <>
      <div className="atmosphere"><span className="orb a" /><span className="orb b" /><span className="orb c" /></div>

      {screen === 'auth'
        ? <AuthScreen t={t} lang={lang} setLang={setLang} onAuth={onAuth} />
        : <ChatApp t={t} lang={lang} setLang={setLang} user={user || { name: 'Alex', email: 'alex@exemple.com' }}
            usedKB={usedKB} quotaKB={quotaKB} addUsage={addUsage} onRefill={() => setPaywall(true)} onSignout={onSignout} />}

      {paywall && <Paywall t={t} lang={lang} low={remaining > 0} onClose={() => setPaywall(false)} onPaid={onPaid} />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
