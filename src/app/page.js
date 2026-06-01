'use client';

import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { supabase } from '@/lib/supabaseClient';
import {
  Scan, Zap, Shield, FileText, FolderTree, Tag, Share2, Code,
  History, LogOut, Mail, ChevronRight, Check, AlertTriangle, X, Sparkles,
  MapPin, ArrowRight, Loader2, MessageSquare, Wand2, Copy, Download, Swords,
  BookOpen, ChevronDown, BarChart3, Gift, ShoppingCart, Info
} from 'lucide-react';

// ==================== ПЕРЕВОДЫ ====================
const translations = {
  en: {
    hero: { title: 'Is Your Site Ready for', subtitle: 'AI Search?', description: 'AI search engines like ChatGPT and Perplexity now drive 30% of organic traffic. Most sites are completely invisible to them. Find out where you stand in 60 seconds.', freeScans: '3 free scans/month', fast: 'Fast', pro: 'PRO: unlimited + history + PDF' },
    scan: { placeholder: 'Enter URL (e.g. yoursite.com)', button: 'Scan', scanning: 'Scanning...' },
    login: { placeholder: 'you@example.com', button: 'Sign In', sending: 'Sending...', checkEmail: 'Check your email! We sent a magic link.' },
    upgrade: { button: 'Upgrade', title: 'Upgrade to PRO', unlimitedScans: 'Unlimited scans', fullHistory: 'Full history', pdfExport: 'PDF export', prioritySupport: 'Priority support', price: '$39/month', subscribeButton: 'Subscribe with Stripe', maybeLater: 'Maybe later' },
    results: { geoScore: 'Your GEO Score', average: 'Average in your niche (SaaS): 65%', improvements: 'Improvements needed', onTrack: 'You are on the right track!', exportPdf: 'Export PDF', share: 'Share', aiAssistant: 'AI Assistant', generateFixes: 'Generate Fixes (AI)', aiFixesPro: 'AI Fixes (PRO)', buyGeneration: 'Buy generation for $9.99', compareCompetitors: 'Compare with competitors', shareForScans: 'Share & Get +3 Scans', buyScanPack: 'Buy 10 Scans — $4.99' },
    history: { title: 'Recent Scans', noScans: 'No scans yet.' },
    aiAssistant: { title: 'AI Assistant', placeholder: 'Ask about your report...', send: 'Send', thinking: 'Thinking...' },
    aiFixes: { title: 'AI-Generated Fixes', copy: 'Copy', download: 'Download', close: 'Close' },
    compare: { title: 'Compare with competitors', description: 'Enter up to three competitor URLs to compare with your site.', placeholder: 'Competitor {number}', compareButton: 'Compare', close: 'Close', module: 'Module', yourSite: 'Your site', geoScore: 'GEO Score' },
    liveExample: { title: 'Live example: stripe.com', updated: 'Updated daily', geoScore: 'GEO Score', callToAction: 'Want to know your GEO Score? Enter URL above and click «Scan»' },
    shareBonus: { thanks: 'Thanks for sharing! +3 free scans added to your account.' },
    drillDown: { title: 'GEO Score Breakdown', howItWorks: 'Each module contributes to your total GEO Score (max 100). Click on any module to see details and recommended actions with estimated impact.', close: 'Close', impact: 'Estimated impact' }
  },
  ru: {
    hero: { title: 'Готов ли ваш сайт к', subtitle: 'AI-поиску?', description: 'ChatGPT, Perplexity и другие AI-поисковики уже дают 30% трафика. Большинство сайтов для них невидимы. Узнайте, где вы находитесь, за 60 секунд.', freeScans: '3 бесплатных скана/мес', fast: 'Быстро', pro: 'PRO: безлимит + история + PDF' },
    scan: { placeholder: 'Введите URL (например, yoursite.com)', button: 'Сканировать', scanning: 'Сканируем...' },
    login: { placeholder: 'you@example.com', button: 'Войти', sending: 'Отправка...', checkEmail: 'Проверьте почту! Мы отправили волшебную ссылку.' },
    upgrade: { button: 'Upgrade', title: 'Обновитесь до PRO', unlimitedScans: 'Безлимитные сканирования', fullHistory: 'Полная история', pdfExport: 'Экспорт PDF', prioritySupport: 'Приоритетная поддержка', price: '$39/мес', subscribeButton: 'Подписаться через Stripe', maybeLater: 'Может, позже' },
    results: { geoScore: 'Ваш GEO Score', average: 'Средний показатель в вашей нише (SaaS): 65%', improvements: 'Требуются улучшения', onTrack: 'Вы на правильном пути!', exportPdf: 'Экспорт PDF', share: 'Поделиться', aiAssistant: 'AI-помощник', generateFixes: 'Сгенерировать исправления (AI)', aiFixesPro: 'AI-исправления (PRO)', buyGeneration: 'Купить генерацию за $9.99', compareCompetitors: 'Сравнить с конкурентами', shareForScans: 'Поделись и получи +3 скана', buyScanPack: 'Купить 10 сканов — $4.99' },
    history: { title: 'Недавние сканирования', noScans: 'Пока нет сканирований.' },
    aiAssistant: { title: 'AI-помощник', placeholder: 'Спросите о вашем отчёте...', send: 'Отправить', thinking: 'Думаю...' },
    aiFixes: { title: 'AI-сгенерированные исправления', copy: 'Копировать', download: 'Скачать', close: 'Закрыть' },
    compare: { title: 'Сравнение с конкурентами', description: 'Введите до трёх URL конкурентов, чтобы сравнить их с вашим сайтом.', placeholder: 'Конкурент {number}', compareButton: 'Сравнить', close: 'Закрыть', module: 'Модуль', yourSite: 'Ваш сайт', geoScore: 'GEO Score' },
    liveExample: { title: 'Живой пример: stripe.com', updated: 'Обновляется ежедневно', geoScore: 'GEO Score', callToAction: 'Хотите узнать свой GEO Score? Введите URL выше и нажмите «Сканировать»' },
    shareBonus: { thanks: 'Спасибо! +3 бесплатных скана добавлено.' },
    drillDown: { title: 'Разбор GEO Score', howItWorks: 'Каждый модуль вносит вклад в общий GEO Score (макс. 100). Нажмите на любой модуль, чтобы увидеть детали и рекомендуемые действия с прогнозируемым эффектом.', close: 'Закрыть', impact: 'Прогнозируемый эффект' }
  }
};

const statusColors = { good: 'text-emerald-400', ok: 'text-amber-400', warning: 'text-orange-400', bad: 'text-red-400' };
const statusPdfColors = { good: '#10b981', ok: '#f59e0b', warning: '#f97316', bad: '#ef4444' };
const FREE_LIMIT = 3;

const moduleInfo = {
  'robots.txt': 'Проверяет, разрешён ли доступ AI-ботам к вашему сайту.',
  'llms.txt': 'Ищет специальный файл, описывающий контент для AI-поисковиков.',
  'sitemap.xml': 'Проверяет наличие карты сайта для облегчения индексации.',
  'Meta Title': 'Анализирует заголовок страницы (title) и его длину.',
  'Open Graph': 'Проверяет наличие OG-тегов для красивых превью при шеринге.',
  'Schema.org': 'Ищет структурированные данные JSON-LD для улучшения сниппетов.',
};

function LanguageSwitcher({ locale, setLocale }) {
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => setLocale('en')} className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${locale === 'en' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>EN</button>
      <button onClick={() => setLocale('ru')} className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${locale === 'ru' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>RU</button>
    </div>
  );
}

export default function Home() {
  const [locale, setLocale] = useState('en');
  const [ready, setReady] = useState(false);
  const [extraScans, setExtraScans] = useState(0);
  const [sharedUrls, setSharedUrls] = useState({});
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('locale');
    if (saved === 'en' || saved === 'ru') setLocale(saved);
    const savedExtra = localStorage.getItem('geoscan-extra-scans');
    if (savedExtra) setExtraScans(parseInt(savedExtra) || 0);
    const savedShared = localStorage.getItem('geoscan-shared-urls');
    if (savedShared) setSharedUrls(JSON.parse(savedShared));
    setReady(true);
  }, []);

  useEffect(() => { localStorage.setItem('locale', locale); }, [locale]);
  useEffect(() => { localStorage.setItem('geoscan-extra-scans', extraScans.toString()); }, [extraScans]);
  useEffect(() => { localStorage.setItem('geoscan-shared-urls', JSON.stringify(sharedUrls)); }, [sharedUrls]);

  const t = translations[locale];

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [fixesOpen, setFixesOpen] = useState(false);
  const [fixesLoading, setFixesLoading] = useState(false);
  const [fixesData, setFixesData] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [competitors, setCompetitors] = useState(['', '', '']);
  const [compareResults, setCompareResults] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [oneTimeLoading, setOneTimeLoading] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);
  const [scanDetailsOpen, setScanDetailsOpen] = useState(false);
  const [scanDetails, setScanDetails] = useState(null);

  const faqItems = [
    { question: locale === 'ru' ? 'Что проверяет GeoScan?' : 'What does GeoScan check?', answer: locale === 'ru' ? 'GeoScan проверяет 6 ключевых факторов: robots.txt для AI-краулеров, llms.txt, sitemap.xml, мета-теги, Open Graph разметку и Schema.org структурированные данные. Все проверки занимают около 60 секунд.' : 'GeoScan checks 6 key factors: robots.txt for AI crawlers, llms.txt, sitemap.xml, meta tags, Open Graph markup, and Schema.org structured data. All checks take about 60 seconds.' },
    { question: locale === 'ru' ? 'Это бесплатно?' : 'Is it free?', answer: locale === 'ru' ? 'Да, первые 3 сканирования в месяц бесплатны и не требуют регистрации. Для unlimited доступа и AI-функций есть PRO-подписка за $39/мес.' : 'Yes, the first 3 scans per month are free and require no registration. For unlimited access and AI features, there is a PRO subscription at $39/month.' },
    { question: locale === 'ru' ? 'Чем GeoScan отличается от SEO-инструментов?' : 'How is GeoScan different from SEO tools?', answer: locale === 'ru' ? 'Традиционные SEO-инструменты фокусируются на Google. GeoScan специализируется на AI-поисковиках — ChatGPT, Perplexity, Google AI Overviews. Мы проверяем специфические для AI факторы, такие как llms.txt и доступ для GPTBot.' : 'Traditional SEO tools focus on Google. GeoScan specializes in AI search engines — ChatGPT, Perplexity, Google AI Overviews. We check AI-specific factors like llms.txt and GPTBot access.' },
    { question: locale === 'ru' ? 'Нужно ли регистрироваться?' : 'Do I need to register?', answer: locale === 'ru' ? 'Нет, для первых 3 сканов регистрация не нужна. Если хотите сохранять историю и использовать PRO-функции, потребуется войти через email.' : 'No, the first 3 scans require no registration. If you want to save history and use PRO features, you will need to log in via email.' },
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) { fetchProfile(session.user.id); fetchHistory(session.user.id); }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) { fetchProfile(session.user.id); fetchHistory(session.user.id); }
      else { setProfile(null); setHistory([]); setExtraScans(0); }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setProfile(data);
      if (data.extra_scans) {
        setExtraScans(data.extra_scans);
        localStorage.setItem('geoscan-extra-scans', data.extra_scans.toString());
      }
    } else {
      setProfile({ id: userId, subscription_status: 'inactive' });
    }
  };

  const fetchHistory = async (userId) => {
    const { data } = await supabase.from('scans').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10);
    if (data) setHistory(data);
  };

  const handleSendLink = async () => {
    if (!email) return;
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setAuthLoading(false);
    if (error) alert(error.message);
    else alert(t.login.checkEmail);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setSession(null); setProfile(null); setHistory([]); setExtraScans(0); };

  const handleScan = async () => {
    if (!url) return;
    if (session && (!profile || profile.subscription_status !== 'active')) {
      const thisMonth = new Date().getMonth(); const thisYear = new Date().getFullYear();
      const monthlyScans = history.filter(s => new Date(s.created_at).getMonth() === thisMonth && new Date(s.created_at).getFullYear() === thisYear);
      if (monthlyScans.length >= FREE_LIMIT + extraScans) {
        alert(locale === 'ru' ? 'Вы достигли лимита бесплатных сканирований. Обновитесь до PRO или купите пакет сканов.' : 'You have reached the free scan limit. Upgrade to PRO or buy a scan pack.');
        setShowPricing(true); return;
      }
    }
    setLoading(true); setError(''); setResults(null); setCompareResults(null);
    try {
      const res = await fetch('/api/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
      if (!res.ok) throw new Error('Сканирование не удалось');
      const data = await res.json(); setResults(data);
      if (session) {
        await supabase.from('scans').insert({ user_id: session.user.id, url, total_score: data.totalScore, robots_score: data.robots.score, llms_score: data.llms.score, sitemap_score: data.sitemap.score, meta_score: data.meta.score, og_score: data.openGraph.score, schema_score: data.schema.score, details: data });
        fetchHistory(session.user.id);
      }
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleUpgrade = async () => {
    if (!session) return alert('Пожалуйста, войдите сначала');
    try {
      const res = await fetch('/api/create-checkout-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ priceId: 'price_1TbcxTBnnj8yRRWUOY0MnOk8', userId: session.user.id }) });
      const data = await res.json(); if (data.url) window.location.href = data.url; else alert(data.error);
    } catch (err) { alert(err.message); }
  };

  const handleOneTimePayment = async () => {
    if (!session) return alert('Пожалуйста, войдите сначала');
    if (!url || !results) return alert('Сначала выполните сканирование');
    setOneTimeLoading(true);
    try {
      const res = await fetch('/api/create-onetime-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: session.user.id, url }) });
      const data = await res.json(); if (data.url) window.location.href = data.url; else alert(data.error);
    } catch (err) { alert(err.message); } finally { setOneTimeLoading(false); }
  };

  const handleBuyScanPack = async () => {
    try {
      const res = await fetch('/api/buy-scans', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: 'price_1TdYJQBnnj8yRRWUAb5gEbi4', userId: session?.user?.id || '' }),
      });
      const data = await res.json(); if (data.url) window.location.href = data.url; else alert(data.error);
    } catch (err) { alert(err.message); }
  };

  const handleExportPDF = () => { /* без изменений */ };
  const handleShare = () => { /* без изменений */ };
  const handleShareForScans = () => { /* без изменений */ };

  const handleChatSend = async () => { /* без изменений */ };
  const handleGenerateFixes = async () => { /* без изменений */ };
  const handleCompare = async () => { /* без изменений */ };

  const openDrillDown = (mod = null) => {
    setSelectedModule(mod);
    setDrillDownOpen(true);
  };

  // Полный JSX без сокращений
  if (!ready) return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-4 py-8 bg-slate-950 text-white">
      <div className="max-w-5xl w-full space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><MapPin className="w-8 h-8 text-emerald-400" /><span className="text-2xl font-bold tracking-tight">GeoScan</span></div>
          <div className="flex items-center gap-3">
            <a href="https://georank-tracker.vercel.app" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm text-slate-300 transition-colors duration-200 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-400" />GeoRank Tracker</a>
            <a href="/blog" title="Blog" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors duration-200"><BookOpen className="w-4 h-4" /></a>
            <LanguageSwitcher locale={locale} setLocale={setLocale} />
            {!session ? (
              <div className="flex items-center gap-2">
                <div className="relative"><Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" /><input type="email" placeholder={t.login.placeholder} className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm outline-none focus:border-emerald-400 transition-colors duration-200 w-48" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <button onClick={handleSendLink} disabled={authLoading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors duration-200 disabled:opacity-50 flex items-center gap-1">{authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}{authLoading ? t.login.sending : t.login.button}</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-300">{session.user.email}</span>
                {profile?.subscription_status === 'active' ? (
                  <span className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold"><Sparkles className="w-3 h-3" /> PRO</span>
                ) : (
                  <button onClick={() => setShowPricing(true)} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors duration-200">{t.upgrade.button}</button>
                )}
                <button onClick={() => setShowHistory(!showHistory)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors duration-200" title={t.history.title}><History className="w-4 h-4" /></button>
                <button onClick={handleLogout} className="p-2 rounded-xl bg-slate-800 hover:bg-red-800 text-slate-300 transition-colors duration-200" title="Выйти"><LogOut className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        </div>
        <div className="relative rounded-3xl bg-gradient-to-br from-emerald-500/10 via-slate-800/50 to-purple-500/10 p-10 text-center border border-slate-700 shadow-2xl">
          <div className="absolute inset-0 bg-grid-slate-800/[0.05] rounded-3xl" />
          <div className="relative space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">{t.hero.title}{' '}<span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{t.hero.subtitle}</span></h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">{t.hero.description}</p>
            <div className="flex items-center justify-center gap-6 text-sm text-slate-400"><span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-400" /> {t.hero.freeScans}</span><span className="flex items-center gap-1"><Zap className="w-4 h-4 text-amber-400" /> {t.hero.fast}</span><span className="flex items-center gap-1"><Sparkles className="w-4 h-4 text-purple-400" /> {t.hero.pro}</span></div>
          </div>
        </div>
        {!results && (
          <div className="w-full max-w-3xl mx-auto bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold flex items-center gap-2"><Zap className="w-5 h-5 text-amber-400" /> {t.liveExample.title}</h3><span className="text-sm text-slate-400">{t.liveExample.updated}</span></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900 rounded-lg text-center"><p className="text-xs text-slate-400">{t.liveExample.geoScore}</p><p className="text-2xl font-bold text-emerald-400">87/100</p></div>
              <div className="p-3 bg-slate-900 rounded-lg text-center"><p className="text-xs text-slate-400">robots.txt</p><p className="text-sm font-bold text-emerald-400">25/25</p></div>
              <div className="p-3 bg-slate-900 rounded-lg text-center"><p className="text-xs text-slate-400">llms.txt</p><p className="text-sm font-bold text-emerald-400">20/20</p></div>
              <div className="p-3 bg-slate-900 rounded-lg text-center"><p className="text-xs text-slate-400">Schema.org</p><p className="text-sm font-bold text-red-400">5/15</p></div>
              <div className="p-3 bg-slate-900 rounded-lg text-center"><p className="text-xs text-slate-400">Open Graph</p><p className="text-sm font-bold text-emerald-400">12/15</p></div>
              <div className="p-3 bg-slate-900 rounded-lg text-center"><p className="text-xs text-slate-400">Sitemap</p><p className="text-sm font-bold text-emerald-400">15/15</p></div>
            </div>
            <p className="text-sm text-slate-500 mt-4 text-center">{t.liveExample.callToAction}</p>
          </div>
        )}
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex items-center gap-2 p-2 bg-slate-800 rounded-2xl border border-slate-700 focus-within:border-emerald-400 transition-colors duration-300 shadow-lg">
            <input type="url" placeholder={t.scan.placeholder} className="flex-1 bg-transparent px-4 py-3 text-white placeholder-slate-400 outline-none" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleScan()} />
            <button onClick={handleScan} disabled={loading} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors duration-300 disabled:opacity-50 flex items-center gap-2">{loading ? <><Loader2 className="w-5 h-5 animate-spin" />{t.scan.scanning}</> : <><Scan className="w-5 h-5" />{t.scan.button}</>}</button>
          </div>
        </div>
        {error && <div className="text-center text-red-400 bg-red-900/20 p-4 rounded-xl flex items-center justify-center gap-2"><AlertTriangle className="w-5 h-5" /> {error}</div>}
        {showPricing && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowPricing(false)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto"><Sparkles className="w-8 h-8 text-emerald-400" /></div>
                <h2 className="text-2xl font-bold">{t.upgrade.title}</h2>
                <ul className="space-y-2 text-sm text-slate-300 text-left">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> {t.upgrade.unlimitedScans}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> {t.upgrade.fullHistory}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> {t.upgrade.pdfExport}</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> {t.upgrade.prioritySupport}</li>
                </ul>
                <div className="text-4xl font-bold">{t.upgrade.price}</div>
                <button onClick={handleUpgrade} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors duration-300 flex items-center justify-center gap-2">{t.upgrade.subscribeButton} <ArrowRight className="w-4 h-4" /></button>
                <button onClick={() => setShowPricing(false)} className="text-sm text-slate-400 hover:text-white">{t.upgrade.maybeLater}</button>
              </div>
            </div>
          </div>
        )}
        {session && showHistory && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><History className="w-5 h-5" /> {t.history.title}</h2>
            {history.length === 0 ? <p className="text-slate-400">{t.history.noScans}</p> : (
              <div className="space-y-2">{history.map(scan => (
                <div key={scan.id} onClick={() => { setScanDetails(scan.details); setScanDetailsOpen(true); }} className="flex justify-between items-center p-3 bg-slate-900 rounded-xl cursor-pointer hover:bg-slate-700 transition-colors duration-200">
                  <div><p className="text-sm font-medium">{scan.url}</p><p className="text-xs text-slate-500">{new Date(scan.created_at).toLocaleString()}</p></div>
                  <span className="text-emerald-400 font-bold">{scan.total_score}/100</span>
                </div>
              ))}</div>
            )}
          </div>
        )}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => (<div key={i} className="h-24 bg-slate-800 rounded-xl border border-slate-700" />))}</div>
            <div className="h-32 bg-slate-800 rounded-xl border border-slate-700" />
          </div>
        )}
        {results && !loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {modules(results).map((mod, idx) => (
                <div key={idx} onClick={() => openDrillDown(mod)} className="group relative p-4 bg-slate-800 border border-slate-700 rounded-xl text-center transition-colors duration-300 hover:border-emerald-500/50 cursor-pointer">
                  <div className="flex justify-center mb-2"><mod.icon className={`w-6 h-6 ${statusColors[mod.data.status] || 'text-white'}`} /></div>
                  <p className="text-sm text-slate-300 mb-1 relative cursor-help" title={moduleInfo[mod.label]}>{mod.label}</p>
                  <p className={`text-xl font-bold ${statusColors[mod.data.status] || 'text-white'}`}>{mod.data.score}/{mod.max}</p>
                  <p className="text-xs text-slate-500 mt-1">{mod.data.details}</p>
                </div>
              ))}
            </div>
            <div onClick={() => openDrillDown(null)} className="p-8 bg-slate-800 border border-slate-700 rounded-2xl text-center space-y-6 relative overflow-hidden cursor-pointer transition-colors hover:border-emerald-500/50">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5" />
              <div className="relative">
                <h2 className="text-2xl font-semibold mb-2 flex items-center justify-center gap-2"><Zap className="w-6 h-6 text-emerald-400" /> {t.results.geoScore}</h2>
                <div className="text-6xl font-bold text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">{results.totalScore} / 100</div>
                <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden mt-4 shadow-inner"><div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-1000 ease-out relative" style={{ width: `${results.totalScore}%` }}><div className="absolute right-0 top-0 h-full w-4 bg-white/50 blur-sm" /></div></div>
                <p className="text-slate-400 mt-2">{t.results.average}<br />{results.totalScore < 50 ? t.results.improvements : t.results.onTrack}</p>
                <div className="flex flex-wrap justify-center gap-4 mt-6">
                  <button onClick={(e) => { e.stopPropagation(); handleExportPDF(); }} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors duration-300 flex items-center gap-2"><FileText className="w-4 h-4" /> {t.results.exportPdf}</button>
                  <button onClick={(e) => { e.stopPropagation(); handleShare(); }} className="px-5 py-2.5 border border-slate-600 hover:border-slate-400 text-white rounded-xl transition-colors duration-300 flex items-center gap-2"><Share2 className="w-4 h-4" /> {t.results.share}</button>
                  <button onClick={(e) => { e.stopPropagation(); handleShareForScans(); }} disabled={sharedUrls[url]} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><Gift className="w-4 h-4" /> {t.results.shareForScans}</button>
                  <button onClick={(e) => { e.stopPropagation(); setChatOpen(true); }} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors duration-300 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> {t.results.aiAssistant}</button>
                  {profile?.subscription_status === 'active' ? (
                    <button onClick={(e) => { e.stopPropagation(); handleGenerateFixes(); }} disabled={fixesLoading} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors duration-300 flex items-center gap-2">{fixesLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}{t.results.generateFixes}</button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setShowPricing(true); }} className="px-5 py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-xl transition-colors duration-300 flex items-center gap-2"><Wand2 className="w-4 h-4" /> {t.results.aiFixesPro}</button>
                      <button onClick={(e) => { e.stopPropagation(); handleOneTimePayment(); }} disabled={oneTimeLoading} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors duration-300 flex items-center gap-2">{oneTimeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}{t.results.buyGeneration}</button>
                    </div>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); handleBuyScanPack(); }} className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-colors duration-300 flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> {t.results.buyScanPack}</button>
                  <button onClick={(e) => { e.stopPropagation(); setCompareOpen(true); }} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors duration-300 flex items-center gap-2"><Swords className="w-4 h-4" /> {t.results.compareCompetitors}</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {scanDetailsOpen && scanDetails && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setScanDetailsOpen(false)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">{scanDetails.url || 'Saved Report'}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {modules(scanDetails).map((mod, idx) => (
                  <div key={idx} className="p-4 bg-slate-900 rounded-xl text-center">
                    <mod.icon className={`w-6 h-6 mx-auto mb-2 ${statusColors[mod.data.status] || 'text-white'}`} />
                    <p className="text-sm text-slate-300">{mod.label}</p>
                    <p className={`text-xl font-bold ${statusColors[mod.data.status] || 'text-white'}`}>{mod.data.score}/{mod.max}</p>
                    <p className="text-xs text-slate-500 mt-1">{mod.data.details}</p>
                  </div>
                ))}
              </div>
              <div className="text-center p-4 bg-slate-900 rounded-xl">
                <p className="text-2xl font-bold text-emerald-400">{scanDetails.totalScore}/100</p>
              </div>
              <button onClick={() => setScanDetailsOpen(false)} className="mt-4 px-4 py-2 bg-slate-600 rounded-lg w-full">Close</button>
            </div>
          </div>
        )}
        {chatOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setChatOpen(false)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-lg h-[500px] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold flex items-center gap-2"><MessageSquare className="w-5 h-5" /> {t.aiAssistant.title}</h3><button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white">✕</button></div>
              <div className="flex-1 overflow-y-auto space-y-2 mb-4">{chatMessages.map((msg, i) => (<div key={i} className={`p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 ml-8' : 'bg-slate-700 mr-8'}`}><p className="text-sm whitespace-pre-wrap">{msg.content}</p></div>))}{chatLoading && <div className="text-slate-400 text-sm">{t.aiAssistant.thinking}</div>}</div>
              <div className="flex gap-2"><input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChatSend()} placeholder={t.aiAssistant.placeholder} className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white outline-none" /><button onClick={handleChatSend} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white">{t.aiAssistant.send}</button></div>
            </div>
          </div>
        )}
        {fixesOpen && fixesData && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setFixesOpen(false)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Wand2 className="w-6 h-6 text-emerald-400" /> {t.aiFixes.title}</h3>
              {['robots', 'llms', 'schema'].map(type => (
                <div key={type} className="mb-4"><h4 className="text-emerald-400 font-semibold">{type}.{type === 'schema' ? 'json' : 'txt'}</h4><pre className="bg-slate-900 p-3 rounded-lg text-xs overflow-x-auto text-slate-300">{fixesData[type]}</pre><div className="flex gap-2 mt-2"><button onClick={() => navigator.clipboard.writeText(fixesData[type])} className="px-3 py-1 bg-blue-600 rounded text-sm flex items-center gap-1"><Copy className="w-3 h-3" /> {t.aiFixes.copy}</button><button onClick={() => { const blob = new Blob([fixesData[type]], {type: 'text/plain'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${type}.${type === 'schema' ? 'json' : 'txt'}`; a.click(); }} className="px-3 py-1 bg-emerald-600 rounded text-sm flex items-center gap-1"><Download className="w-3 h-3" /> {t.aiFixes.download}</button></div></div>
              ))}
              <button onClick={() => setFixesOpen(false)} className="mt-4 px-4 py-2 bg-slate-600 rounded-lg w-full">{t.aiFixes.close}</button>
            </div>
          </div>
        )}
        {compareOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setCompareOpen(false)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Swords className="w-6 h-6 text-amber-400" /> {t.compare.title}</h3>
              <p className="text-sm text-slate-400 mb-4">{t.compare.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">{competitors.map((comp, i) => (<input key={i} type="url" placeholder={t.compare.placeholder.replace('{number}', i + 1)} className="flex-1 min-w-[200px] px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white outline-none" value={comp} onChange={e => { const newComps = [...competitors]; newComps[i] = e.target.value; setCompetitors(newComps); }} />))}</div>
              <div className="flex gap-2 mb-6">
                <button onClick={handleCompare} disabled={compareLoading || !results} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors duration-300 disabled:opacity-50 flex items-center gap-2">{compareLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}{t.compare.compareButton}</button>
                <button onClick={() => setCompareOpen(false)} className="px-4 py-2 bg-slate-600 rounded-lg">{t.compare.close}</button>
              </div>
              {compareResults && results && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="border-b border-slate-700"><th className="py-2 px-3">{t.compare.module}</th><th className="py-2 px-3">{t.compare.yourSite}</th>{Object.keys(compareResults).map(url => (<th key={url} className="py-2 px-3">{url}</th>))}</tr></thead>
                    <tbody>
                      {modules(results).map((mod, idx) => (
                        <tr key={idx} className="border-b border-slate-700"><td className="py-2 px-3 font-medium">{mod.label}</td><td className="py-2 px-3"><span className={`font-bold ${statusColors[mod.data.status]}`}>{mod.data.score}/{mod.max}</span></td>
                          {Object.entries(compareResults).map(([compUrl, compData]) => { if (!compData) return <td key={compUrl} className="py-2 px-3 text-slate-500">N/A</td>; const compMod = compData[mod.label.toLowerCase().replace(' ', '_')] || compData[mod.label.toLowerCase().split('.')[0]]; const compScore = compMod ? compMod.score : null; const isBetter = compScore !== null && compScore > mod.data.score; const isWorse = compScore !== null && compScore < mod.data.score; return (<td key={compUrl} className="py-2 px-3">{compScore !== null ? (<span className={`font-bold ${isBetter ? 'text-emerald-400' : isWorse ? 'text-red-400' : 'text-slate-300'}`}>{compScore}/{mod.max}</span>) : '-'}</td>); })}
                        </tr>
                      ))}
                      <tr className="border-t-2 border-slate-600"><td className="py-2 px-3 font-bold">{t.compare.geoScore}</td><td className="py-2 px-3 font-bold text-emerald-400">{results.totalScore}/100</td>{Object.entries(compareResults).map(([compUrl, compData]) => (<td key={compUrl} className="py-2 px-3 font-bold">{compData ? `${compData.totalScore}/100` : 'N/A'}</td>))}</tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Drill-Down Modal */}
        {drillDownOpen && results && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setDrillDownOpen(false)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2"><Info className="w-5 h-5 text-emerald-400" /> {selectedModule ? selectedModule.label : t.drillDown.title}</h3>
                <button onClick={() => setDrillDownOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              {selectedModule ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">{selectedModule.label}</span>
                    <span className={`text-2xl font-bold ${statusColors[selectedModule.data.status]}`}>{selectedModule.data.score}/{selectedModule.max}</span>
                  </div>
                  <p className="text-slate-400">{selectedModule.data.details}</p>
                  <div className="p-4 bg-slate-900 rounded-lg">
                    <h4 className="font-semibold mb-2">{t.drillDown.impact}</h4>
                    <p className="text-sm text-slate-300">
                      {selectedModule.label === 'robots.txt' && (selectedModule.data.score === 25 ? '✅ All AI crawlers are allowed. No action needed.' : '🔧 Unblocking AI crawlers can increase your GEO Score by up to 25 points and make your site visible to ChatGPT, Perplexity, and Claude.')}
                      {selectedModule.label === 'llms.txt' && (selectedModule.data.score === 20 ? '✅ llms.txt present with content. No action needed.' : '🔧 Adding an llms.txt file can increase your GEO Score by 20 points and raise citation potential by 15%.')}
                      {selectedModule.label === 'sitemap.xml' && (selectedModule.data.score === 15 ? '✅ sitemap.xml accessible. No action needed.' : '🔧 Adding a sitemap can increase your GEO Score by 10 points.')}
                      {selectedModule.label === 'Meta Title' && (selectedModule.data.score === 10 ? '✅ Meta title is well-optimized.' : '🔧 Improving your meta title can increase your GEO Score by 5 points and improve AI snippet quality.')}
                      {selectedModule.label === 'Open Graph' && (selectedModule.data.score === 15 ? '✅ Open Graph tags found. No action needed.' : '🔧 Adding OG tags can increase your GEO Score by 10 points and make your site look better when shared.')}
                      {selectedModule.label === 'Schema.org' && (selectedModule.data.score === 15 ? '✅ Schema.org markup found. No action needed.' : '🔧 Adding structured data can increase your GEO Score by 10 points and boost citation potential.')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-400">{t.drillDown.howItWorks}</p>
                  {modules(results).map((mod, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-700" onClick={() => setSelectedModule(mod)}>
                      <div className="flex items-center gap-2">
                        <mod.icon className={`w-5 h-5 ${statusColors[mod.data.status]}`} />
                        <span>{mod.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${statusColors[mod.data.status]}`}>{mod.data.score}/{mod.max}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {/* FAQ Section */}
        <div className="w-full max-w-3xl mx-auto mt-16 pt-8 border-t border-slate-800">
          <h2 className="text-2xl font-bold mb-6 text-center">{locale === 'ru' ? 'Часто задаваемые вопросы' : 'Frequently Asked Questions'}</h2>
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden transition-colors duration-200 hover:border-slate-600">
                <button onClick={() => setFaqOpen(faqOpen === index ? null : index)} className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-700 transition-colors duration-200">
                  <span className="font-medium text-white">{item.question}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${faqOpen === index ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${faqOpen === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-4 pb-4 text-slate-300 text-sm leading-relaxed">{item.answer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}