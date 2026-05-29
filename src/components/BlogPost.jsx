'use client';

import { useState, useEffect } from 'react';

export default function BlogPost({ originalContent, originalLang = 'ru' }) {
  const [targetLang, setTargetLang] = useState('ru');
  const [translatedContent, setTranslatedContent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Загружаем сохранённый язык блога
  useEffect(() => {
    const saved = localStorage.getItem('blogLocale') || 'ru';
    setTargetLang(saved);
  }, []);

  // Функция переключения языка
  const switchLang = (lang) => {
    setTargetLang(lang);
    localStorage.setItem('blogLocale', lang);
  };

  // При изменении языка запускаем перевод, если нужно
  useEffect(() => {
    if (targetLang === originalLang) {
      setTranslatedContent(null);
      return;
    }

    // Проверяем кэш в localStorage
    const cacheKey = `translation_${originalLang}_${targetLang}_${window.location.pathname}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setTranslatedContent(cached);
      return;
    }

    setLoading(true);
    fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: originalContent, targetLang }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.translated) {
          setTranslatedContent(data.translated);
          localStorage.setItem(cacheKey, data.translated);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [targetLang, originalLang, originalContent]);

  const displayContent = translatedContent || originalContent;

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-slate-400">Язык статьи:</span>
        <button
          onClick={() => switchLang('ru')}
          className={`px-2 py-1 rounded text-xs font-medium ${targetLang === 'ru' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
        >
          RU
        </button>
        <button
          onClick={() => switchLang('en')}
          className={`px-2 py-1 rounded text-xs font-medium ${targetLang === 'en' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
        >
          EN
        </button>
        {loading && <span className="text-sm text-slate-400 ml-2">Перевод...</span>}
      </div>
      <article className="max-w-3xl mx-auto prose prose-invert" dangerouslySetInnerHTML={{ __html: displayContent }} />
    </div>
  );
}