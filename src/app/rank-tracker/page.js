'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, TrendingUp, ArrowRight, Zap, Check, Shield, BarChart3, Globe, Sparkles, Mail, LogOut, Swords } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const translations = {
  en: {
    hero: { title: 'Track Your AI Visibility', subtitle: 'GeoRank Tracker', description: 'Monitor how your site appears in AI search results for your target keywords.', freeScans: 'Free for everyone', aiPowered: 'AI-powered', history: 'Check history' },
    inputs: { url: 'Enter site URL (e.g., yoursite.com)', keywords: 'Keywords, comma separated (e.g., CRM, project management)', button: 'Check Rankings', checking: 'Checking...' },
    results: { title: 'Results for', visible: 'Visible', notVisible: 'Not visible', position: 'Position in results: #' },
    error: { default: 'An error occurred. Please try again.' },
    login: { placeholder: 'you@example.com', button: 'Sign In', sending: 'Sending...', checkEmail: 'Check your email! We sent a magic link.' },
    geoScanLink: 'Need a full AI visibility audit?', tryGeoScan: 'Try GeoScan', blogLink: 'Read our Blog',
    compare: { button: 'Compare', title: 'Compare with Competitors', description: 'Enter up to 3 competitor URLs to see how they rank for the same keywords.', yourSite: 'Your Site', compareButton: 'Run Comparison', close: 'Close', module: 'Keyword', noData: 'No data' },
    audit: { button: 'Audit in GeoScan', tooltip: 'Scan this site for AI crawler blocking, llms.txt, OG/Schema and more' }
  },
  ru: {
    hero: { title: 'Отслеживайте свою AI-видимость', subtitle: 'GeoRank Tracker', description: 'Мониторинг появления вашего сайта в результатах AI-поиска по ключевым словам.', freeScans: 'Бесплатно для всех', aiPowered: 'На основе AI', history: 'История проверок' },
    inputs: { url: 'Введите URL сайта (например, yoursite.com)', keywords: 'Ключевые слова через запятую (CRM, project management)', button: 'Проверить позиции', checking: 'Проверяем...' },
    results: { title: 'Результаты для', visible: 'Видим', notVisible: 'Не видим', position: 'Позиция в выдаче: #' },
    error: { default: 'Произошла ошибка. Попробуйте снова.' },
    login: { placeholder: 'you@example.com', button: 'Войти', sending: 'Отправка...', checkEmail: 'Проверьте почту! Мы отправили волшебную ссылку.' },
    geoScanLink: 'Нужен полный аудит AI-видимости?', tryGeoScan: 'Попробуйте GeoScan', blogLink: 'Читать блог',
    compare: { button: 'Сравнить', title: 'Сравнение с конкурентами', description: 'Введите до 3 URL конкурентов, чтобы сравнить их позиции по тем же ключевым словам.', yourSite: 'Ваш сайт', compareButton: 'Запустить сравнение', close: 'Закрыть', module: 'Ключ', noData: 'Нет данных' },
    audit: { button: 'Аудит в GeoScan', tooltip: 'Проверить сайт на блокировку AI-краулеров, llms.txt, OG/Schema и другое' }
  }
};

function LanguageSwitcher({ locale, setLocale }) {
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => setLocale('en')} className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${locale === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>EN</button>
      <button onClick={() => setLocale('ru')} className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${locale === 'ru' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>RU</button>
    </div>
  );
}

export default function Home() {
  const [locale, setLocale] = useState('en');
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [compareOpen, setCompareOpen] = useState(false);
  const [competitorUrls, setCompetitorUrls] = useState(['', '', '']);
  const [compareResults, setCompareResults] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('georank-locale');
    if (saved === 'en' || saved === 'ru') setLocale(saved);
    setReady(true);
  }, []);

  useEffect(() => { localStorage.setItem('georank-locale', locale); }, [locale]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    await supabase.from('profiles').select('*').eq('id', userId).single();
  };

  const handleSendLink = async () => {
    if (!email) return;
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setAuthLoading(false);
    if (error) alert(error.message);
    else alert(t.login.checkEmail);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const t = translations[locale];
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    if (!url || !keywords.trim()) return;
    const kwArray = keywords.split(',').map(k => k.trim()).filter(k => k);
    if (kwArray.length === 0) return;
    setLoading(true); setError(''); setResults(null);
    try {
      const res = await fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url, keywords: kwArray }) });
      if (!res.ok) throw new Error('Tracking failed');
      const data = await res.json(); setResults(data.results);
    } catch (err) { setError(err.message || t.error.default); } finally { setLoading(false); }
  };

  const handleCompare = async () => {
    const validUrls = [url, ...competitorUrls].filter(u => u.trim() !== '');
    if (validUrls.length < 2) return;
    const kwArray = keywords.split(',').map(k => k.trim()).filter(k => k);
    if (kwArray.length === 0) return;
    setCompareLoading(true);
    try {
      const res = await fetch('/api/compare-rank', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ urls: validUrls, keywords: kwArray }) });
      const data = await res.json();
      setCompareResults(data.results);
    } catch (err) { alert('Comparison failed: ' + err.message); } finally { setCompareLoading(false); }
  };

  if (!ready) return null;

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-start px-4 py-16">
      <div className="max-w-3xl w-full space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2"><Globe className="w-5 h-5 text-blue-400" /><span className="text-sm font-medium">GeoRank</span></div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher locale={locale} setLocale={setLocale} />
            <button onClick={() => setCompareOpen(true)} disabled={!results} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-xl transition-colors duration-200 flex items-center gap-1"><Swords className="w-4 h-4" /> {t.compare.button}</button>
            {!session ? (
              <div className="flex items-center gap-2">
                <input type="email" placeholder={t.login.placeholder} className="w-48 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white outline-none" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button onClick={handleSendLink} disabled={authLoading} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50">{authLoading ? t.login.sending : t.login.button}</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-300">{session.user.email}</span>
                <button onClick={handleLogout} className="p-2 rounded-xl bg-slate-800 hover:bg-red-800 text-slate-300 transition-colors duration-200" title="Выйти"><LogOut className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        </div>

        <div className="relative rounded-3xl bg-gradient-to-br from-blue-500/10 via-slate-800/50 to-purple-500/10 p-10 text-center border border-slate-700 shadow-2xl">
          <div className="absolute inset-0 bg-grid-slate-800/[0.05] rounded-3xl" />
          <div className="relative space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{t.hero.title}{' '}<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{t.hero.subtitle}</span></h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">{t.hero.description}</p>
            <div className="flex items-center justify-center gap-6 text-sm text-slate-400"><span className="flex items-center gap-1"><Check className="w-4 h-4 text-blue-400" /> {t.hero.freeScans}</span><span className="flex items-center gap-1"><Zap className="w-4 h-4 text-amber-400" /> {t.hero.aiPowered}</span><span className="flex items-center gap-1"><BarChart3 className="w-4 h-4 text-purple-400" /> {t.hero.history}</span></div>
          </div>
        </div>

        <div className="space-y-4">
          <input type="url" placeholder={t.inputs.url} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 outline-none focus:border-blue-400 transition-colors duration-200" value={url} onChange={(e) => setUrl(e.target.value)} />
          <input type="text" placeholder={t.inputs.keywords} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 outline-none focus:border-blue-400 transition-colors duration-200" value={keywords} onChange={(e) => setKeywords(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleTrack()} />
        </div>

        <button onClick={handleTrack} disabled={loading || !url || !keywords.trim()} className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-black font-bold rounded-xl transition-colors duration-300 disabled:opacity-50 flex items-center justify-center gap-2">{loading ? <><Loader2 className="w-5 h-5 animate-spin" />{t.inputs.checking}</> : <><Search className="w-5 h-5" />{t.inputs.button}</>}</button>

        {error && <div className="text-center text-red-400 bg-red-900/20 p-4 rounded-xl flex items-center justify-center gap-2"><Shield className="w-5 h-5" /> {error}</div>}

        {results && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-400" /> {t.results.title} {url}</h2>
            {results.map((item, i) => (
              <div key={i} className="p-4 bg-slate-800 border border-slate-700 rounded-xl transition-colors duration-200 hover:border-blue-500/50">
                <div className="flex justify-between items-center mb-2"><span className="font-medium">{item.keyword}</span><span className={`px-2 py-1 rounded-full text-xs font-bold ${item.appearing ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>{item.appearing ? t.results.visible : t.results.notVisible}</span></div>
                {item.snippet && <p className="text-sm text-slate-400 italic">«{item.snippet}»</p>}
                {item.position && <p className="text-xs text-slate-500 mt-1">{t.results.position}{item.position}</p>}
              </div>
            ))}
          </div>
        )}

        <div className="text-center pt-8 border-t border-slate-800 space-y-2">
          <p className="text-sm text-slate-500">{t.geoScanLink}</p>
          <a href="/" className="text-blue-400 hover:underline inline-flex items-center gap-1 transition-colors duration-200">{t.tryGeoScan} <ArrowRight className="w-4 h-4" /></a>
          <br />
          <a href="/blog" className="text-blue-400 hover:underline text-sm inline-flex items-center gap-1 transition-colors duration-200">{t.blogLink} <ArrowRight className="w-3 h-3" /></a>
        </div>

        {/* Compare Modal */}
        {compareOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setCompareOpen(false)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Swords className="w-6 h-6 text-amber-400" /> {t.compare.title}</h3>
              <p className="text-sm text-slate-400 mb-4">{t.compare.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {competitorUrls.map((comp, i) => (
                  <input key={i} type="url" placeholder={`Competitor ${i + 1}`} className="flex-1 min-w-[200px] px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white outline-none" value={comp} onChange={e => { const newComps = [...competitorUrls]; newComps[i] = e.target.value; setCompetitorUrls(newComps); }} />
                ))}
              </div>
              <div className="flex gap-2 mb-6">
                <button onClick={handleCompare} disabled={compareLoading} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors duration-300 disabled:opacity-50 flex items-center gap-2">{compareLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}{t.compare.compareButton}</button>
                <button onClick={() => setCompareOpen(false)} className="px-4 py-2 bg-slate-600 rounded-lg">{t.compare.close}</button>
              </div>
              {compareResults && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="border-b border-slate-700"><th className="py-2 px-3">{t.compare.module}</th><th className="py-2 px-3">{t.compare.yourSite}</th>{competitorUrls.filter(u => u.trim()).map(u => <th key={u} className="py-2 px-3">{u}</th>)}</tr></thead>
                    <tbody>
                      {(keywords.split(',').map(k => k.trim()).filter(k => k)).map(kw => (
                        <tr key={kw} className="border-b border-slate-700">
                          <td className="py-2 px-3 font-medium">{kw}</td>
                          {[url, ...competitorUrls.filter(u => u.trim())].map(u => {
                            const siteData = compareResults?.[u];
                            const kwData = siteData?.find(r => r.keyword === kw);
                            return (
                              <td key={u} className="py-2 px-3">
                                {kwData ? (
                                  <span className={`font-bold ${kwData.appearing ? 'text-blue-400' : 'text-red-400'}`}>
                                    {kwData.appearing ? t.results.visible : t.results.notVisible}
                                  </span>
                                ) : t.compare.noData}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}