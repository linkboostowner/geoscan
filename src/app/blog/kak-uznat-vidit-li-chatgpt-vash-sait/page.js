export const metadata = {
  title: 'Как узнать, видит ли ChatGPT ваш сайт: чек-лист из 6 шагов | GeoScan',
  description: 'Пошаговое руководство по проверке видимости сайта для AI-поисковиков. Узнайте, какие файлы проверить и как исправить ошибки.',
};

export default function Post() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-16">
      <article className="max-w-3xl mx-auto prose prose-invert">
        <h1 className="text-4xl font-bold mb-4">Как узнать, видит ли ChatGPT ваш сайт: чек-лист из 6 шагов</h1>
        <p className="text-slate-400 mb-8">28 мая 2026 • 8 минут чтения</p>
        
        <div className="space-y-4 text-slate-300">
          <p>
            В 2026 году поисковые системы на базе искусственного интеллекта — ChatGPT, Perplexity, Google AI Overviews — 
            генерируют до <strong>30% органического трафика</strong>. Но есть проблема: большинство сайтов для них просто невидимы.
          </p>
          <p>
            Мы просканировали 100 случайных сайтов и обнаружили, что <strong>85% из них блокируют AI-ботов</strong> в файле robots.txt, 
            даже не подозревая об этом. Ещё у 90% отсутствует файл llms.txt, а structured data не соответствует стандартам.
          </p>
          <p>
            В этом руководстве я покажу, как за 6 шагов проверить, видит ли ChatGPT ваш сайт, и исправить все ошибки.
          </p>

          <h2>Шаг 1. Проверьте файл robots.txt</h2>
          <p>
            Файл robots.txt — это «инструкция по эксплуатации» вашего сайта для ботов. AI-поисковики используют специальных 
            краулеров: <code>GPTBot</code> (OpenAI), <code>PerplexityBot</code>, <code>Google-Extended</code>.
          </p>
          <p>Откройте <code>https://вашсайт.com/robots.txt</code> и проверьте:</p>
          <ul>
            <li>Нет ли строки <code>User-agent: * Disallow: /</code> — она блокирует вообще всех ботов.</li>
            <li>Не заблокированы ли явно <code>GPTBot</code>, <code>PerplexityBot</code> или <code>Google-Extended</code>.</li>
          </ul>
          <p>
            Если вы увидели что-то вроде <code>User-agent: GPTBot Disallow: /</code> — ваш сайт полностью невидим для ChatGPT.
          </p>

          <h2>Шаг 2. Создайте или проверьте файл llms.txt</h2>
          <p>
            llms.txt — это новый стандарт, предложенный для того, чтобы AI-модели могли быстро понять структуру вашего сайта. 
            Это аналог robots.txt, но для больших языковых моделей.
          </p>
          <p>Файл должен содержать краткое описание сайта и ссылки на ключевые разделы. Пример:</p>
          <pre><code># llms.txt for Example SaaS
This is the official website of Example SaaS, a project management tool.
- /about: About our company
- /pricing: Plans and pricing
- /docs: API documentation
          </code></pre>
          <p>
            Проверьте <code>https://вашсайт.com/llms.txt</code>. Если файла нет — вы теряете возможность быть 
            правильно процитированным AI-поисковиками.
          </p>

          <h2>Шаг 3. Проверьте structured data (Schema.org)</h2>
          <p>
            Schema.org — это разметка, которая помогает поисковикам понимать, что именно находится на странице: статья, 
            товар, FAQ, организация. AI-модели используют её для «заземления» ответов в фактах.
          </p>
          <p>
            Проверьте исходный код страницы (<code>Ctrl+U</code>) на наличие тегов 
            <code>&lt;script type="application/ld+json"&gt;</code>. Если их нет — AI-поисковики 
            не получают структурированную информацию о вашем контенте.
          </p>

          <h2>Шаг 4. Оптимизируйте мета-теги и Open Graph</h2>
          <p>
            AI-модели анализируют title, description и Open Graph-теги для формирования сниппетов. Плохие мета-теги = 
            плохие AI-сниппеты = низкий CTR.
          </p>
          <p>Убедитесь, что на каждой странице заполнены:</p>
          <ul>
            <li><code>&lt;title&gt;</code> — уникальный заголовок, до 60 символов.</li>
            <li><code>&lt;meta name="description"&gt;</code> — описание, до 160 символов.</li>
            <li>OG-теги: <code>og:title</code>, <code>og:description</code>, <code>og:image</code> — для красивых превью при шеринге.</li>
          </ul>

          <h2>Шаг 5. Проверьте карту сайта (sitemap.xml)</h2>
          <p>
            Sitemap.xml помогает краулерам находить все страницы сайта. Без него часть контента может остаться 
            не проиндексированной.
          </p>
          <p>Откройте <code>https://вашсайт.com/sitemap.xml</code> — если там есть список URL, всё в порядке.</p>

          <h2>Шаг 6. Используйте GeoScan для автоматической проверки</h2>
          <p>
            Выполнять все эти проверки вручную — долго и можно пропустить важные детали. Мы создали 
            <strong>GeoScan</strong> — бесплатный инструмент, который за 60 секунд сканирует сайт и выдаёт 
            подробный отчёт с оценкой готовности к AI-поиску.
          </p>
          <p>GeoScan проверяет:</p>
          <ul>
            <li>robots.txt — доступ для GPTBot, PerplexityBot, Google-Extended</li>
            <li>llms.txt — наличие и корректность формата</li>
            <li>Sitemap.xml — доступность карты сайта</li>
            <li>Мета-теги и Open Graph</li>
            <li>Structured data (Schema.org JSON-LD)</li>
          </ul>
          <p>
            После сканирования вы получите <strong>GEO Score</strong> — оценку от 0 до 100, а также 
            конкретные инструкции по исправлению ошибок.
          </p>
          <p style={{ marginTop: '2rem', padding: '1.5rem', background: '#1e293b', borderRadius: '0.75rem', border: '1px solid #334155' }}>
            <strong className="text-emerald-400">Готовы проверить свой сайт?</strong><br />
            <a href="/" style={{ color: '#10b981', textDecoration: 'underline' }}>
              Запустите бесплатное сканирование в GeoScan →
            </a>
          </p>
        </div>
      </article>
    </main>
  );
}