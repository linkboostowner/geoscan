'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, ArrowRight, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('locale');
    if (saved === 'ru' || saved === 'en') setLocale(saved);
  }, []);

  const t = {
    title: locale === 'ru' ? 'Спасибо за покупку!' : 'Thank You for Your Purchase!',
    subtitle: locale === 'ru' ? 'Ваш аккаунт обновлён.' : 'Your account has been upgraded.',
    whatNext: locale === 'ru' ? 'Что дальше?' : 'What’s next?',
    steps: [
      locale === 'ru' ? 'Вернитесь на главную и войдите, если ещё не вошли.' : 'Go back to the homepage and log in if you haven’t already.',
      locale === 'ru' ? 'Запустите сканирование вашего сайта.' : 'Run a scan of your website.',
      locale === 'ru' ? 'Используйте AI-помощника и генератор исправлений без ограничений.' : 'Use the AI assistant and fixes generator without limits.',
    ],
    backHome: locale === 'ru' ? 'Вернуться на главную' : 'Back to Homepage',
    blog: locale === 'ru' ? 'Почитать блог' : 'Read our Blog',
    support: locale === 'ru' ? 'Если возникли вопросы, просто ответьте на письмо с подтверждением.' : 'If you have any questions, just reply to the confirmation email.',
  };

  return (
    <div className="max-w-md w-full text-center space-y-8">
      <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-10 h-10 text-emerald-400" />
      </div>
      <div>
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-slate-400">{t.subtitle}</p>
        {sessionId && (
          <p className="text-xs text-slate-600 mt-2">ID: {sessionId.slice(0, 12)}...</p>
        )}
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-left space-y-3">
        <h2 className="text-lg font-semibold">{t.whatNext}</h2>
        <ul className="space-y-2">
          {t.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
              <span className="flex-shrink-0 w-5 h-5 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex gap-4 justify-center">
        <a
          href="/"
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-colors flex items-center gap-2"
        >
          {t.backHome} <ArrowRight className="w-4 h-4" />
        </a>
        <a
          href="/blog"
          className="px-5 py-2.5 border border-slate-600 hover:border-slate-400 text-white rounded-xl transition-colors flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" /> {t.blog}
        </a>
      </div>
      <p className="text-xs text-slate-500">{t.support}</p>
    </div>
  );
}

export default function ThankYou() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-16">
      <Suspense fallback={<div className="text-slate-400">Loading...</div>}>
        <ThankYouContent />
      </Suspense>
    </main>
  );
}