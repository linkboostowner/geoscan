import BlogPost from '@/components/BlogPost';

const originalHTML = `
<h1>Structured Data для AI-поисковиков: что такое Schema.org и как её добавить</h1>
<p class="text-slate-400 mb-8">30 мая 2026 • 7 минут чтения</p>
<div class="space-y-4 text-slate-300">
  <p>
    Чтобы попасть в ответы ChatGPT, Perplexity или Google AI Overviews, вашему сайту нужна не только 
    правильная настройка robots.txt и наличие llms.txt. Третий важнейший фактор — 
    <strong>структурированные данные (Schema.org)</strong>.
  </p>
  <p>
    Это специальная разметка, которая помогает AI-поисковикам понять, что именно находится на странице: 
    статья, товар, FAQ, организация, рецепт или что-то ещё. Без неё даже самые полезные страницы 
    остаются «невидимками» для больших языковых моделей.
  </p>
  <p>
    В этом руководстве разберём, что такое Schema.org, почему она критически важна для GEO 
    и как добавить её на сайт за 10 минут.
  </p>

  <h2>Что такое Schema.org и зачем она нужна</h2>
  <p>
    Schema.org — это единый словарь структурированных данных, созданный Google, Microsoft, 
    Yahoo и Яндексом в 2011 году. Сегодня он стал стандартом для описания контента в интернете.
  </p>
  <p>Для AI-поисковиков Schema.org выполняет три важные функции:</p>
  <ol>
    <li><strong>«Заземление» ответов.</strong> Когда ChatGPT отвечает на вопрос, он ищет страницы с чёткой структурой, чтобы не придумывать факты. Schema.org даёт ему эту структуру.</li>
    <li><strong>Повышение доверия.</strong> Размеченные данные сигнализируют AI-моделям, что ваш контент структурирован и достоверен.</li>
    <li><strong>Приоритет в сниппетах.</strong> Страницы со Schema.org чаще попадают в расширенные сниппеты (People Also Ask, Featured Snippets) и AI-ответы.</li>
  </ol>

  <h2>Как выглядит разметка Schema.org</h2>
  <p>
    Самый популярный формат — <strong>JSON-LD</strong>. Это обычный JavaScript-объект, который вставляется 
    в секцию <code>&lt;head&gt;</code> или в тело страницы внутри тега <code>&lt;script&gt;</code>.
  </p>
  <p>Пример для статьи:</p>
  <pre><code>&lt;script type="application/ld+json"&gt;
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Как настроить robots.txt для AI-поисковиков",
  "author": {
    "@type": "Person",
    "name": "Имя Автора"
  },
  "datePublished": "2026-05-29",
  "description": "Пошаговая инструкция по настройке robots.txt для ChatGPT и Perplexity."
}
&lt;/script&gt;</code></pre>

  <p>Пример для организации (компании):</p>
  <pre><code>&lt;script type="application/ld+json"&gt;
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Моя компания",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "description": "Краткое описание компании."
}
&lt;/script&gt;</code></pre>

  <h2>Какие типы Schema.org важны для GEO</h2>
  <p>Для AI-поисковиков наиболее ценны следующие типы разметки:</p>
  <ul>
    <li><strong>Article</strong> — для блогов, новостей, руководств. Помогает ChatGPT понять, что это полноценная статья.</li>
    <li><strong>FAQPage</strong> — для страниц с вопросами и ответами. Может напрямую попасть в AI-сниппеты.</li>
    <li><strong>Organization</strong> — для главной страницы компании. Улучшает видимость бренда в AI-ответах.</li>
    <li><strong>Product</strong> — для товаров. AI-ассистенты используют эту разметку при рекомендациях покупок.</li>
    <li><strong>BreadcrumbList</strong> — для навигации. Помогает AI понять структуру сайта.</li>
  </ul>

  <h2>Как добавить Schema.org на сайт за 10 минут</h2>

  <h3>Шаг 1: Определите тип страницы</h3>
  <p>Для каждой страницы выберите подходящий тип Schema.org из списка выше. Для блога — Article, для карточки товара — Product, для главной — Organization.</p>

  <h3>Шаг 2: Сгенерируйте JSON-LD</h3>
  <p>Создайте JSON-объект по примеру выше или используйте генератор (GeoScan может сделать это автоматически).</p>

  <h3>Шаг 3: Вставьте код на страницу</h3>
  <p>Добавьте JSON-LD внутрь тега <code>&lt;script type="application/ld+json"&gt;</code> в секции <code>&lt;head&gt;</code> или в начале <code>&lt;body&gt;</code>.</p>

  <h3>Шаг 4: Проверьте результат</h3>
  <p>Используйте <strong>GeoScan</strong> или <a href="https://search.google.com/test/rich-results" style="color: #10b981; text-decoration: underline;">Google Rich Results Test</a>, чтобы убедиться, что разметка корректна.</p>

  <h2>Как GeoScan помогает со Schema.org</h2>
  <p>
    При сканировании GeoScan проверяет наличие и корректность Schema.org на главной странице сайта. 
    Если разметка отсутствует или содержит ошибки, вы получите конкретные рекомендации.
  </p>
  <p>
    А с помощью AI-генератора вы можете сразу получить готовый JSON-LD, 
    созданный специально для вашего сайта, и вставить его за минуту.
  </p>
  <p style="margin-top: 2rem; padding: 1.5rem; background: #1e293b; border-radius: 0.75rem; border: 1px solid #334155;">
    <strong class="text-emerald-400">Проверьте, есть ли Schema.org на вашем сайте</strong><br />
    <a href="/" style="color: #10b981; text-decoration: underline;">
      Бесплатное сканирование в GeoScan →
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