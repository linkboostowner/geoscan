import BlogPost from '@/components/BlogPost';

const originalHTML = `
<h1>Что такое GeoScan и зачем он нужен</h1>
<p class="text-slate-400 mb-8">30 мая 2026 • 5 минут чтения</p>
<div class="space-y-4 text-slate-300">
  <p>
    Привычные поисковики вроде Google постепенно уступают место искусственному интеллекту. ChatGPT, Perplexity, Google AI Overviews — это уже не эксперименты, а реальность, которая формирует до <strong>30% трафика</strong> на сайты в 2026 году.
  </p>
  <p>
    Но есть проблема: <strong>большинство сайтов абсолютно невидимы для AI-поисковиков</strong>. Они неправильно настроены, блокируют полезных роботов или не имеют нужной разметки. Владельцы теряют клиентов, даже не догадываясь об этом.
  </p>
  <p>
    <strong>GeoScan</strong> — это бесплатный инструмент, который за 60 секунд сканирует ваш сайт и показывает, насколько он готов к эпохе AI.
  </p>

  <h2>Что такое Generative Engine Optimization (GEO)?</h2>
  <p>
    GEO — это новая область поисковой оптимизации, направленная на то, чтобы ваш сайт был правильно прочитан и процитирован большими языковыми моделями. Если SEO нужно для Google, то GEO нужно для ChatGPT, Perplexity, Claude и других AI-ассистентов.
  </p>

  <h2>Какие проблемы решает GeoScan</h2>
  <p>Мы проверяем шесть ключевых факторов, которые AI-поисковики учитывают при выборе источника информации:</p>
  <ol>
    <li><strong>robots.txt</strong> — не заблокированы ли боты ChatGPT, PerplexityBot, Google-Extended.</li>
    <li><strong>llms.txt</strong> — есть ли специальный файл с описанием вашего сайта для AI.</li>
    <li><strong>sitemap.xml</strong> — могут ли краулеры найти все страницы.</li>
    <li><strong>Мета-теги и Open Graph</strong> — насколько привлекательно ваш сайт выглядит в превью.</li>
    <li><strong>Structured data (Schema.org)</strong> — понимают ли роботы, что именно находится на странице.</li>
    <li><strong>GEO Score</strong> — итоговая оценка от 0 до 100, которая показывает готовность сайта к AI-поиску.</li>
  </ol>

  <h2>Что вы получаете после сканирования</h2>
  <ul>
    <li><strong>Понятный отчёт</strong> с оценкой каждого параметра.</li>
    <li><strong>Конкретные инструкции</strong> по исправлению ошибок.</li>
    <li><strong>Готовые файлы</strong> (robots.txt, llms.txt, JSON-LD), сгенерированные AI специально для вашего сайта.</li>
    <li><strong>AI-помощника</strong>, который ответит на любые вопросы по вашему отчёту.</li>
    <li><strong>Сравнение с конкурентами</strong> — узнайте, почему их сайты видны, а ваш нет.</li>
  </ul>

  <h2>Для кого предназначен GeoScan</h2>
  <ul>
    <li><strong>Владельцы бизнеса</strong> — узнайте, почему ваш сайт не приносит продаж.</li>
    <li><strong>SEO-специалисты</strong> — получите инструмент для аудита и генерации файлов.</li>
    <li><strong>Маркетологи</strong> — проверьте видимость сайта перед запуском рекламы.</li>
    <li><strong>Разработчики</strong> — быстро найдите технические проблемы.</li>
  </ul>

  <h2>Как начать пользоваться</h2>
  <ol>
    <li>Перейдите на <a href="/" style="color: #10b981; text-decoration: underline;">главную страницу GeoScan</a>.</li>
    <li>Введите URL вашего сайта.</li>
    <li>Нажмите «Сканировать».</li>
    <li>Через 60 секунд получите полный отчёт и рекомендации.</li>
  </ol>
  <p>
    Это бесплатно. Никакой регистрации не требуется для первых трёх сканирований.
  </p>
  <p style="margin-top: 2rem; padding: 1.5rem; background: #1e293b; border-radius: 0.75rem; border: 1px solid #334155;">
    <strong class="text-emerald-400">Готовы узнать свой GEO Score?</strong><br />
    <a href="/" style="color: #10b981; text-decoration: underline;">
      Запустите бесплатное сканирование в GeoScan →
    </a>
  </p>
</div>
`;

export default function Post() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-16">
      <BlogPost originalContent={originalHTML} originalLang="ru" />
    </main>
  );
}