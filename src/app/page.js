'use client';

import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { supabase } from '@/lib/supabaseClient';
import {
  Scan, Zap, Shield, FileText, FolderTree, Tag, Share2, Code,
  History, LogOut, Mail, ChevronRight, Check, AlertTriangle, X, Sparkles,
  MapPin, ArrowRight, Loader2, MessageSquare, Wand2, Copy, Download, Swords
} from 'lucide-react';

// ==================== ПЕРЕВОДЫ ====================
const translations = {
  en: {
    hero: {
      title: 'Is Your Site Ready for',
      subtitle: 'AI Search?',
      description: 'AI search engines like ChatGPT and Perplexity now drive 30% of organic traffic. Most sites are completely invisible to them. Find out where you stand in 60 seconds.',
      freeScans: '3 free scans/month',
      fast: 'Fast',
      pro: 'PRO: unlimited + history + PDF'
    },
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
    hero: {
      title: 'Готов ли ваш сайт к',
      subtitle: 'AI-поиску?',
      description: 'ChatGPT, Perplexity и другие AI-поисковики уже дают 30% трафика. Большинство сайтов для них невидимы. Узнайте, где вы находитесь, за 60 секунд.',
      freeScans: '3 бесплатных скана/мес',
      fast: 'Быстро',
      pro: 'PRO: безлимит + история + PDF'
    },
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

// ==================== ОСТАЛЬНОЙ КОД ====================
// (далее идёт весь твой текущий page.js, но с использованием t() из этого объекта)

const statusColors = {
  good: 'text-emerald-400',
  ok: 'text-amber-400',
  warning: 'text-orange-400',
  bad: 'text-red-400',
};

const statusPdfColors = {
  good: '#10b981',
  ok: '#f59e0b',
  warning: '#f97316',
  bad: '#ef4444',
};

const FREE_LIMIT = 3;

const moduleInfo = {
  'robots.txt': 'Проверяет, разрешён ли доступ AI-ботам к вашему сайту.',
  'llms.txt': 'Ищет специальный файл, описывающий контент для AI-поисковиков.',
  'sitemap.xml': 'Проверяет наличие карты сайта для облегчения индексации.',
  'Meta Title': 'Анализирует заголовок страницы (title) и его длину.',
  'Open Graph': 'Проверяет наличие OG-тегов для красивых превью при шеринге.',
  'Schema.org': 'Ищет структурированные данные JSON-LD для улучшения сниппетов.',
};

export default function Home() {
  const [locale, setLocale] = useState('en');
  const t = translations[locale];

  useEffect(() => {
    const saved = localStorage.getItem('locale') || 'en';
    if (saved !== locale) setLocale(saved);
  }, []);

  const switchLanguage = (newLocale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  // Остальные состояния и функции остаются твоими, только везде используй t() вместо строк.
  const [url, setUrl] = useState('');
  // ... (вставь сюда весь остальной код из полной версии page.js, заменив все текстовые строки на t('путь.к.строке'))

  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-4 py-8 bg-slate-950 text-white">
      <div className="max-w-5xl w-full space-y-8">
        {/* Header с переключателем */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-8 h-8 text-emerald-400" />
            <span className="text-2xl font-bold tracking-tight">GeoScan</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => switchLanguage('en')}
                className={`px-2 py-1 rounded text-xs font-medium ${locale === 'en' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >EN</button>
              <button
                onClick={() => switchLanguage('ru')}
                className={`px-2 py-1 rounded text-xs font-medium ${locale === 'ru' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >RU</button>
            </div>
            {/* Остальная шапка (логин/аут) */}
            {/* ... */}
          </div>
        </div>

        {/* Далее все секции с использованием t() */}
        {/* ... */}
      </div>
    </main>
  );
}