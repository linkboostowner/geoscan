'use client';

import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { supabase } from '@/lib/supabaseClient';
import {
  Scan, Zap, Shield, FileText, FolderTree, Tag, Share2, Code,
  History, LogOut, Mail, ChevronRight, Check, AlertTriangle, X, Sparkles,
  MapPin, ArrowRight, Loader2, MessageSquare, Wand2, Copy, Download, Swords
} from 'lucide-react';

const translations = {
  en: {
    hero: { title: 'Is Your Site Ready for', subtitle: 'AI Search?', description: 'AI search engines like ChatGPT and Perplexity now drive 30% of organic traffic. Most sites are completely invisible to them. Find out where you stand in 60 seconds.', freeScans: '3 free scans/month', fast: 'Fast', pro: 'PRO: unlimited + history + PDF' },
    scan: { placeholder: 'Enter URL (e.g. yoursite.com)', button: 'Scan', scanning: 'Scanning...' },
    login: { placeholder: 'you@example.com', button: 'Sign In', sending: 'Sending...', checkEmail: 'Check your email! We sent a magic link.' },
    upgrade: { button: 'Upgrade', title: 'Upgrade to PRO', unlimitedScans: 'Unlimited scans', fullHistory: 'Full history', pdfExport: 'PDF export', prioritySupport: 'Priority support', price: '$39/month', subscribeButton: 'Subscribe with Stripe', maybeLater: 'Maybe later' },
    results: { geoScore: 'Your GEO Score', average: 'Average in your niche (SaaS): 65%', improvements: 'Improvements needed', onTrack: 'You are on the right track!', exportPdf: 'Export PDF', share: 'Share', aiAssistant: 'AI Assistant', generateFixes: 'Generate Fixes (AI)', aiFixesPro: 'AI Fixes (PRO)', buyGeneration: 'Buy generation for $9.99', compareCompetitors: 'Compare with competitors' },
    history: { title: 'Recent Scans', noScans: 'No scans yet.' },
    aiAssistant: { title: 'AI Assistant', placeholder: 'Ask about your report...', send: 'Send', thinking: 'Thinking...' },
    aiFixes: { title: 'AI-Generated Fixes', copy: 'Copy', download: 'Download', close: 'Close' },
    compare: { title: 'Compare with competitors', description: 'Enter up to three competitor URLs to compare with your site.', placeholder: 'Competitor {number}', compareButton: 'Compare', close: 'Close', module: 'Module', yourSite: 'Your site', geoScore: 'GEO Score' },
    liveExample: { title: 'Live example: stripe.com', updated: 'Updated daily', geoScore: 'GEO Score', callToAction: 'Want to know your GEO Score? Enter URL above and click «Scan»' }
  },
  ru: {
    hero: { title: 'Готов ли ваш сайт к', subtitle: 'AI-поиску?', description: 'ChatGPT, Perplexity и другие AI-поисковики уже дают 30% трафика. Большинство сайтов для них невидимы. Узнайте, где вы находитесь, за 60 секунд.', freeScans: '3 бесплатных скана/мес', fast: 'Быстро', pro: 'PRO: безлимит + история + PDF' },
    scan: { placeholder: 'Введите URL (например, yoursite.com)', button: 'Сканировать', scanning: 'Сканируем...' },
    login: { placeholder: 'you@example.com', button: 'Войти', sending: 'Отправка...', checkEmail: 'Проверьте почту! Мы отправили волшебную ссылку.' },
    upgrade: { button: 'Upgrade', title: 'Обновитесь до PRO', unlimitedScans: 'Безлимитные сканирования', fullHistory: 'Полная история', pdfExport: 'Экспорт PDF', prioritySupport: 'Приоритетная поддержка', price: '$39/мес', subscribeButton: 'Подписаться через Stripe', maybeLater: 'Может, позже' },
    results: { geoScore: 'Ваш GEO Score', average: 'Средний показатель в вашей нише (SaaS): 65%', improvements: 'Требуются улучшения', onTrack: 'Вы на правильном пути!', exportPdf: 'Экспорт PDF', share: 'Поделиться', aiAssistant: 'AI-помощник', generateFixes: 'Сгенерировать исправления (AI)', aiFixesPro: 'AI-исправления (PRO)', buyGeneration: 'Купить генерацию за $9.99', compareCompetitors: 'Сравнить с конкурентами' },
    history: { title: 'Недавние сканирования', noScans: 'Пока нет сканирований.' },
    aiAssistant: { title: 'AI-помощник', placeholder: 'Спросите о вашем отчёте...', send: 'Отправить', thinking: 'Думаю...' },
    aiFixes: { title: 'AI-сгенерированные исправления', copy: 'Копировать', download: 'Скачать', close: 'Закрыть' },
    compare: { title: 'Сравнение с конкурентами', description: 'Введите до трёх URL конкурентов, чтобы сравнить их с вашим сайтом.', placeholder: 'Конкурент {number}', compareButton: 'Сравнить', close: 'Закрыть', module: 'Модуль', yourSite: 'Ваш сайт', geoScore: 'GEO Score' },
    liveExample: { title: 'Живой пример: stripe.com', updated: 'Обновляется ежедневно', geoScore: 'GEO Score', callToAction: 'Хотите узнать свой GEO Score? Введите URL выше и нажмите «Сканировать»' }
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
      <button onClick={() => setLocale('en')} className={`px-2 py-1 rounded text-xs font-medium ${locale === 'en' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>EN</button>
      <button onClick={() => setLocale('ru')} className={`px-2 py-1 rounded text-xs font-medium ${locale === 'ru' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>RU</button>
    </div>
  );
}

export default function Home() {
  const [locale, setLocale] = useState('en');
  const t = translations[locale];

  useEffect(() => {
    const saved = localStorage.getItem('locale');
    if (saved && (saved === 'en' || saved === 'ru')) setLocale(saved);
  }, []);
  useEffect(() => { localStorage.setItem('locale', locale); }, [locale]);

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile();
        fetchHistory();
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile();
        fetchHistory();
      } else {
        setProfile(null);
        setHistory([]);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setProfile(data);
    } catch {
      setProfile({ subscription_status: 'inactive' });
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/scans');
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      setHistory(data);
    } catch {
      setHistory([]);
    }
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
    setProfile(null);
    setHistory([]);
  };

  const handleScan = async () => {
    if (!url) return;
    if (session && (!profile || profile.subscription_status !== 'active')) {
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      const monthlyScans = history.filter(
        (s) => new Date(s.created_at).getMonth() === thisMonth && new Date(s.created_at).getFullYear() === thisYear
      );
      if (monthlyScans.length >= FREE_LIMIT) {
        alert('Вы достигли лимита бесплатных сканирований (3/мес). Обновитесь до PRO.');
        setShowPricing(true);
        return;
      }
    }

    setLoading(true);
    setError('');
    setResults(null);
    setCompareResults(null);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error('Сканирование не удалось');
      const data = await res.json();
      setResults(data);

      if (session) {
        await fetch('/api/scans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            totalScore: data.totalScore,
            robotsScore: data.robots.score,
            llmsScore: data.llms.score,
            sitemapScore: data.sitemap.score,
            metaScore: data.meta.score,
            ogScore: data.openGraph.score,
            schemaScore: data.schema.score,
            details: data,
          }),
        });
        fetchHistory();
      }
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleUpgrade = async () => {
    if (!session) return alert('Пожалуйста, войдите сначала');
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: 'price_1TbcxTBnnj8yRRWUOY0MnOk8',
          userId: session.user.id,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error);
    } catch (err) { alert(err.message); }
  };

  const handleOneTimePayment = async () => {
    if (!session) return alert('Пожалуйста, войдите сначала');
    if (!url || !results) return alert('Сначала выполните сканирование');
    setOneTimeLoading(true);
    try {
      const res = await fetch('/api/create-onetime-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, url }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error);
    } catch (err) { alert(err.message); } finally { setOneTimeLoading(false); }
  };

  const handleExportPDF = () => {
    if (!results) return;
    const doc = new jsPDF();
    const primaryColor = '#1e3a5f';
    const accentColor = '#10b981';
    const darkText = '#0f172a';
    const mediumText = '#475569';

    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setFont('times', 'bold');
    doc.setFontSize(24);
    doc.setTextColor('#ffffff');
    doc.text('GeoScan', 15, 22);
    doc.setFontSize(11);
    doc.setFont('times', 'normal');
    doc.text('AI Visibility Report', 15, 30);
    doc.setFontSize(10);
    doc.setTextColor(darkText);
    doc.text(`URL: ${url}`, 15, 42);
    doc.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 15, 49);
    doc.setFillColor('#ffffff');
    doc.setDrawColor('#cbd5e1');
    doc.roundedRect(15, 56, 180, 22, 3, 3, 'FD');
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(primaryColor);
    doc.text(`GEO Score: ${results.totalScore}/100`, 20, 70);
    doc.setFillColor('#e2e8f0');
    doc.roundedRect(100, 63, 80, 6, 3, 3, 'F');
    doc.setFillColor(accentColor);
    const barW = (results.totalScore / 100) * 80;
    if (barW > 0) doc.roundedRect(100, 63, barW, 6, 3, 3, 'F');

    let y = 88;
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.text('Detailed Results', 15, y);
    y += 6;
    const tableTop = y;
    const col1X = 16; const col2X = 90; const col3X = 120; const col4X = 145;
    const rowHeight = 12; const tableWidth = 180;
    doc.setFillColor(primaryColor);
    doc.rect(15, y, tableWidth, rowHeight, 'F');
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.setTextColor('#ffffff');
    doc.text('Module', col1X, y + 8);
    doc.text('Score', col2X, y + 8);
    doc.text('Status', col3X, y + 8);
    doc.text('Comment', col4X, y + 8);
    y += rowHeight;

    const modules = [
      { label: 'robots.txt', data: results.robots, max: 25 },
      { label: 'llms.txt', data: results.llms, max: 20 },
      { label: 'sitemap.xml', data: results.sitemap, max: 15 },
      { label: 'Meta Title', data: results.meta, max: 10 },
      { label: 'Open Graph', data: results.openGraph, max: 15 },
      { label: 'Schema.org', data: results.schema, max: 15 },
    ];
    modules.forEach((mod, index) => {
      if (index % 2 === 0) doc.setFillColor('#f8fafc');
      else doc.setFillColor('#ffffff');
      doc.rect(15, y, tableWidth, rowHeight, 'F');
      doc.setFont('times', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(darkText);
      doc.text(mod.label, col1X, y + 8);
      doc.setFont('times', 'bold');
      doc.setTextColor(accentColor);
      doc.text(`${mod.data.score}/${mod.max}`, col2X, y + 8);
      const statusColor = statusPdfColors[mod.data.status] || '#333';
      doc.setFillColor(statusColor);
      doc.circle(col3X + 4, y + 5, 3, 'F');
      doc.setFont('times', 'normal');
      doc.setTextColor(mediumText);
      const commentLines = doc.splitTextToSize(mod.data.details, 50);
      doc.text(commentLines, col4X, y + 8);
      y += rowHeight;
      if (commentLines.length > 1) y += (commentLines.length - 1) * 5;
    });
    doc.setDrawColor('#cbd5e1');
    doc.rect(15, tableTop, tableWidth, y - tableTop);
    y += 6;
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.text('Recommendations', 15, y);
    y += 6;
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(mediumText);
    const advice = results.totalScore < 50
      ? 'Critical improvements needed. Start by unblocking AI bots and adding structured data.'
      : 'Your site is on the right track. Consider adding llms.txt and optimizing Open Graph tags.';
    const lines = doc.splitTextToSize(advice, 170);
    doc.text(lines, 20, y);
    doc.setFontSize(8);
    doc.setTextColor('#94a3b8');
    doc.text('Generated by GeoScan • geoscan-a.vercel.app', 15, 285);
    doc.save(`geoscan-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleShare = () => {
    if (!results) return;
    const text = `Я только что проверил свой сайт в GeoScan и получил GEO Score ${results.totalScore}/100. Узнай, готов ли твой сайт к AI-поиску: https://geoscan-a.vercel.app`;
    if (navigator.share) navigator.share({ title: 'GeoScan Report', text });
    else window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || !results) return;
    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, context: results }),
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply || data.error }]);
    } catch (err) { setChatMessages(prev => [...prev, { role: 'assistant', content: 'Error: ' + err.message }]); }
    finally { setChatLoading(false); }
  };

  const handleGenerateFixes = async () => {
    setFixesLoading(true);
    try {
      const res = await fetch('/api/ai-fixes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url, results }) });
      const data = await res.json();
      setFixesData(data);
      setFixesOpen(true);
    } catch (err) { alert('Error generating fixes: ' + err.message); }
    finally { setFixesLoading(false); }
  };

  const handleCompare = async () => {
    const validUrls = competitors.filter(c => c.trim() !== '');
    if (validUrls.length === 0) return;
    setCompareLoading(true);
    try {
      const res = await fetch('/api/compare', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ urls: validUrls }) });
      const data = await res.json();
      setCompareResults(data.results);
    } catch (err) { alert('Comparison failed: ' + err.message); }
    finally { setCompareLoading(false); }
  };

  const modules = results ? [
    { label: 'robots.txt', data: results.robots, max: 25, icon: Shield },
    { label: 'llms.txt', data: results.llms, max: 20, icon: FileText },
    { label: 'sitemap.xml', data: results.sitemap, max: 15, icon: FolderTree },
    { label: 'Meta Title', data: results.meta, max: 10, icon: Tag },
    { label: 'Open Graph', data: results.openGraph, max: 15, icon: Share2 },
    { label: 'Schema.org', data: results.schema, max: 15, icon: Code },
  ] : [];

  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-4 py-8 bg-slate-950 text-white">
      <div className="max-w-5xl w-full space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><MapPin className="w-8 h-8 text-emerald-400" /><span className="text-2xl font-bold tracking-tight">GeoScan</span></div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher locale={locale} setLocale={setLocale} />
            {!session ? (
              <div className="flex items-center gap-2">
                <div className="relative"><Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" /><input type="email" placeholder={t.login.placeholder} className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm outline-none focus:border-emerald-400 transition-colors w-48" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <button onClick={handleSendLink} disabled={authLoading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-1">{authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}{authLoading ? t.login.sending : t.login.button}</button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-300">{session.user.email}</span>
                {profile?.subscription_status === 'active' ? (
                  <span className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold"><Sparkles className="w-3 h-3" /> PRO</span>
                ) : (
                  <button onClick={() => setShowPricing(true)} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all">{t.upgrade.button}</button>
                )}
                <button onClick={() => setShowHistory(!showHistory)} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors" title={t.history.title}><History className="w-4 h-4" /></button>
                <button onClick={handleLogout} className="p-2 rounded-xl bg-slate-800 hover:bg-red-800 text-slate-300 transition-colors" title="Выйти"><LogOut className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        </div>

        <div className="relative rounded-3xl bg-gradient-to-br from-emerald-500/10 via-slate-800/50 to-purple-500/10 p-10 text-center border border-slate-700 shadow-2xl">
          <div className="absolute inset-0 bg-grid-slate-800/[0.05] rounded-3xl" />
          <div className="relative space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">{t.hero.title}{' '}<span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{t.hero.subtitle}</span></h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">{t.hero.description}</p>
            <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-400" /> {t.hero.freeScans}</span>
              <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-amber-400" /> {t.hero.fast}</span>
              <span className="flex items-center gap-1"><Sparkles className="w-4 h-4 text-purple-400" /> {t.hero.pro}</span>
            </div>
          </div>
        </div>

        {!results && (
          <div className="w-full max-w-3xl mx-auto bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl animate-in fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Zap className="w-5 h-5 text-amber-400" /> {t.liveExample.title}</h3>
              <span className="text-sm text-slate-400">{t.liveExample.updated}</span>
            </div>
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
          <div className="flex items-center gap-2 p-2 bg-slate-800 rounded-2xl border border-slate-700 focus-within:border-emerald-400 transition-all shadow-lg">
            <input type="url" placeholder={t.scan.placeholder} className="flex-1 bg-transparent px-4 py-3 text-white placeholder-slate-400 outline-none" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleScan()} />
            <button onClick={handleScan} disabled={loading} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" />{t.scan.scanning}</> : <><Scan className="w-5 h-5" />{t.scan.button}</>}
            </button>
          </div>
        </div>

        {error && <div className="text-center text-red-400 bg-red-900/20 p-4 rounded-xl flex items-center justify-center gap-2"><AlertTriangle className="w-5 h-5" /> {error}</div>}

        {showPricing && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowPricing(false)}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in" onClick={e => e.stopPropagation()}>
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
                <button onClick={handleUpgrade} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2">{t.upgrade.subscribeButton} <ArrowRight className="w-4 h-4" /></button>
                <button onClick={() => setShowPricing(false)} className="text-sm text-slate-400 hover:text-white">{t.upgrade.maybeLater}</button>
              </div>
            </div>
          </div>
        )}

        {session && showHistory && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 animate-in fade-in slide-in-from-top">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><History className="w-5 h-5" /> {t.history.title}</h2>
            {history.length === 0 ? <p className="text-slate-400">{t.history.noScans}</p> : (
              <div className="space-y-2">{history.map(scan => (
                <div key={scan.id} className="flex justify-between items-center p-3 bg-slate-900 rounded-xl">
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
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {modules.map(mod => (
                <div key={mod.label} className="group relative p-4 bg-slate-800 border border-slate-700 rounded-xl text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-500/50">
                  <div className="flex justify-center mb-2"><mod.icon className={`w-6 h-6 ${statusColors[mod.data.status] || 'text-white'}`} /></div>
                  <p className="text-sm text-slate-300 mb-1 relative cursor-help" title={moduleInfo[mod.label]}>{mod.label}</p>
                  <p className={`text-xl font-bold ${statusColors[mod.data.status] || 'text-white'}`}>{mod.data.score}/{mod.max}</p>
                  <p className="text-xs text-slate-500 mt-1">{mod.data.details}</p>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              ))}
            </div>

            <div className="p-8 bg-slate-800 border border-slate-700 rounded-2xl text-center space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5" />
              <div className="relative">
                <h2 className="text-2xl font-semibold mb-2 flex items-center justify-center gap-2"><Zap className="w-6 h-6 text-emerald-400" /> {t.results.geoScore}</h2>
                <div className="text-6xl font-bold text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">{results.totalScore} / 100</div>
                <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden mt-4 shadow-inner">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-1000 ease-out relative" style={{ width: `${results.totalScore}%` }}><div className="absolute right-0 top-0 h-full w-4 bg-white/50 blur-sm" /></div>
                </div>
                <p className="text-slate-400 mt-2">{t.results.average}<br />{results.totalScore < 50 ? t.results.improvements : t.results.onTrack}</p>
                <div className="flex flex-wrap justify-center gap-4 mt-6">
                  <button onClick={handleExportPDF} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all flex items-center gap-2"><FileText className="w-4 h-4" /> {t.results.exportPdf}</button>
                  <button onClick={handleShare} className="px-5 py-2.5 border border-slate-600 hover:border-slate-400 text-white rounded-xl transition-all flex items-center gap-2"><Share2 className="w-4 h-4" /> {t.results.share}</button>
                  <button onClick={() => setChatOpen(true)} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all flex items-center gap-2"><MessageSquare className="w-4 h-4" /> {t.results.aiAssistant}</button>
                  {profile?.subscription_status === 'active' ? (
                    <button onClick={handleGenerateFixes} disabled={fixesLoading} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all flex items-center gap-2">{fixesLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}{t.results.generateFixes}</button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setShowPricing(true)} className="px-5 py-2.5 bg-slate-600 hover:bg-slate-500 text-white rounded-xl transition-all flex items-center gap-2"><Wand2 className="w-4 h-4" /> {t.results.aiFixesPro}</button>
                      <button onClick={handleOneTimePayment} disabled={oneTimeLoading} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all flex items-center gap-2">{oneTimeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}{t.results.buyGeneration}</button>
                    </div>
                  )}
                  <button onClick={() => setCompareOpen(true)} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-all flex items-center gap-2"><Swords className="w-4 h-4" /> {t.results.compareCompetitors}</button>
                </div>
              </div>
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
              <button onClick={() => setFixesOpen(false)} className="mt-4 px-4 py-2 bg-slate-600 rounded-lg">{t.aiFixes.close}</button>
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
                <button onClick={handleCompare} disabled={compareLoading || !results} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-2">{compareLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}{t.compare.compareButton}</button>
                <button onClick={() => setCompareOpen(false)} className="px-4 py-2 bg-slate-600 rounded-lg">{t.compare.close}</button>
              </div>
              {compareResults && results && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="border-b border-slate-700"><th className="py-2 px-3">{t.compare.module}</th><th className="py-2 px-3">{t.compare.yourSite}</th>{Object.keys(compareResults).map(url => (<th key={url} className="py-2 px-3">{url}</th>))}</tr></thead>
                    <tbody>
                      {modules.map(mod => (
                        <tr key={mod.label} className="border-b border-slate-700"><td className="py-2 px-3 font-medium">{mod.label}</td><td className="py-2 px-3"><span className={`font-bold ${statusColors[mod.data.status]}`}>{mod.data.score}/{mod.max}</span></td>
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

      </div>
    </main>
  );
}