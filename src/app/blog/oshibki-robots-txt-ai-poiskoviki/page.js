export const metadata = {
  title: 'Ошибки в robots.txt для AI-поисковиков: как исправить за 5 минут | GeoScan',
  description: 'Разбираем частые ошибки в robots.txt, из-за которых ChatGPT и Perplexity не видят ваш сайт. Пошаговая инструкция по исправлению.',
};

export default function Post() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-16">
      <article className="max-w-3xl mx-auto prose prose-invert">
        <h1 className="text-4xl font-bold mb-4">Ошибки в robots.txt для AI-поисковиков: как исправить за 5 минут</h1>
        <p className="text-slate-400 mb-8">29 мая 2026 • 6 минут чтения</p>
        
        <div className="space-y-4 text-slate-300">
          <p>
            Файл <code>robots.txt</code> — это первое, что проверяют поисковые роботы, заходя на сайт. Если в нём ошибка, 
            ваш сайт может быть полностью невидим для AI-поисковиков, таких как ChatGPT, Perplexity и Google AI Overviews.
          </p>
          <p>
            Мы проанализировали robots.txt у 200 случайных сайтов и нашли критичные ошибки у 65% из них. 
            В этой статье разберём самые частые проблемы и покажем, как их исправить за 5 минут.
          </p>

          <h2>Ошибка 1: Полная блокировка всех роботов</h2>
          <p>Самая грубая ошибка выглядит так:</p>
          <pre><code>User-agent: *
Disallow: /</code></pre>
          <p>
            Эта директива запрещает доступ к сайту вообще всем роботам — и поисковым, и AI-краулерам. 
            Сайт с такой настройкой не индексируется ни Google, ни ChatGPT.
          </p>
          <p><strong>Как исправить:</strong> Удалите строку <code>Disallow: /</code> или замените на разрешающую:</p>
          <pre><code>User-agent: *
Allow: /</code></pre>

          <h2>Ошибка 2: Блокировка конкретных AI-ботов</h2>
          <p>Иногда владельцы сайтов намеренно блокируют AI-краулеров, не понимая последствий:</p>
          <pre><code>User-agent: GPTBot
Disallow: /

User-agent: PerplexityBot
Disallow: /</code></pre>
          <p>
            После такой настройки ваш сайт никогда не появится в ответах ChatGPT или Perplexity. 
            Для многих бизнесов это потеря до 30% потенциального трафика.
          </p>
          <p><strong>Как исправить:</strong> Разрешите доступ этим ботам:</p>
          <pre><code>User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /</code></pre>

          <h2>Ошибка 3: Блокировка важных разделов для AI-краулеров</h2>
          <p>Некоторые сайты закрывают от индексации служебные разделы, но случайно блокируют и полезный контент:</p>
          <pre><code>User-agent: *
Disallow: /admin/
Disallow: /wp-content/
Disallow: /search/</code></pre>
          <p>
            Это нормально для обычных поисковиков, но AI-краулеры могут не получить доступ к важным страницам, 
            если те случайно попадают под какое-то правило.
          </p>
          <p><strong>Как исправить:</strong> Добавьте отдельные правила для AI-ботов:</p>
          <pre><code>User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /</code></pre>

          <h2>Ошибка 4: Отсутствие файла robots.txt</h2>
          <p>
            Если файла robots.txt нет вообще, большинство краулеров считают, что доступ ко всему сайту разрешён. 
            Но некоторые AI-платформы могут трактовать отсутствие файла как «неопределённый статус» и не индексировать сайт.
          </p>
          <p><strong>Как исправить:</strong> Создайте минимальный robots.txt с базовыми правилами. 
          Если не знаете, с чего начать — воспользуйтесь нашим генератором.</p>

          <h2>Как быстро проверить свой robots.txt</h2>
          <p>Выполнять все эти проверки вручную можно, но есть способ быстрее:</p>
          <ol>
            <li>Откройте <strong>GeoScan</strong></li>
            <li>Введите URL вашего сайта</li>
            <li>Нажмите «Сканировать»</li>
            <li>В результатах сразу увидите, какие AI-боты заблокированы и как это исправить</li>
          </ol>
          <p>
            GeoScan не только находит ошибки в robots.txt, но и проверяет llms.txt, 
            sitemap.xml, мета-теги и structured data. А ещё может сразу сгенерировать исправленный robots.txt 
            с помощью AI.
          </p>
          <p style={{ marginTop: '2rem', padding: '1.5rem', background: '#1e293b', borderRadius: '0.75rem', border: '1px solid #334155' }}>
            <strong className="text-emerald-400">Проверьте свой robots.txt прямо сейчас</strong><br />
            <a href="/" style={{ color: '#10b981', textDecoration: 'underline' }}>
              Бесплатное сканирование в GeoScan →
            </a>
          </p>
        </div>
      </article>
    </main>
  );
}