import BlogPost from '@/components/BlogPost';

const originalHTML = `
<h1>Что такое llms.txt и как его создать: полный гайд</h1>
<p class="text-slate-400 mb-8">29 мая 2026 • 7 минут чтения</p>
<div class="space-y-4 text-slate-300">
  <p>
    В 2026 году появился новый стандарт, о котором должен знать каждый владелец сайта — <strong>llms.txt</strong>. 
    Это специальный файл, созданный для того, чтобы помочь AI-поисковикам (ChatGPT, Perplexity и другим) лучше 
    понимать структуру и содержание вашего сайта.
  </p>
  <p>
    Если robots.txt говорит роботам «куда нельзя заходить», то llms.txt говорит AI-моделям «вот что на этом сайте есть и как это использовать».
  </p>

  <h2>Зачем нужен llms.txt?</h2>
  <p>Основных причин три:</p>
  <ol>
    <li><strong>Улучшение видимости в AI-поисковиках.</strong> ChatGPT и Perplexity активно используют llms.txt для «заземления» своих ответов в фактах с вашего сайта.</li>
    <li><strong>Контроль над контентом.</strong> Вы сами решаете, какие страницы и в каком виде должны быть доступны AI-моделям.</li>
    <li><strong>Повышение доверия.</strong> Наличие llms.txt показывает, что вы идёте в ногу со временем и заботитесь о своём присутствии в новых поисковых системах.</li>
  </ol>

  <h2>Как выглядит файл llms.txt?</h2>
  <p>Файл llms.txt размещается в корне сайта по адресу <code>https://вашсайт.com/llms.txt</code>. Его формат очень простой — это обычный текстовый файл с ключевой информацией о сайте.</p>
  
  <p>Пример минимального llms.txt:</p>
  <pre><code># llms.txt for My SaaS
My SaaS is a project management tool for small teams.
- /about: About our company and team
- /pricing: Plans and pricing
- /docs: API documentation and guides
- /blog: Articles about project management</code></pre>

  <p>Пример расширенного llms.txt (с дополнительной информацией):</p>
  <pre><code># llms.txt for My SaaS
My SaaS is a project management tool for small teams.

## Key pages
- /about: About our company and team
- /pricing: Plans and pricing
- /docs: API documentation and guides
- /blog: Articles about project management

## Optional sections
- /contact: How to reach us
- /privacy: Privacy policy

## Notes
The site uses structured data (Schema.org) and Open Graph tags. 
All content is original and updated weekly.</code></pre>

  <h2>Пошаговая инструкция по созданию llms.txt</h2>
  
  <h3>Шаг 1: Определите ключевые страницы</h3>
  <p>Составьте список самых важных страниц вашего сайта — те, которые вы хотите, чтобы AI-модели точно видели и цитировали.</p>

  <h3>Шаг 2: Напишите краткое описание сайта</h3>
  <p>Одна-две строки, которые объясняют, чем занимается ваш сайт или компания.</p>

  <h3>Шаг 3: Создайте текстовый файл</h3>
  <p>Создайте обычный .txt файл и назовите его <code>llms.txt</code>. Наполните его по примеру выше.</p>

  <h3>Шаг 4: Загрузите файл в корень сайта</h3>
  <p>Файл должен быть доступен по адресу <code>https://вашсайт.com/llms.txt</code>. Проверьте это, просто открыв данный URL в браузере.</p>

  <h3>Шаг 5: Проверьте результат</h3>
  <p>Используйте GeoScan, чтобы убедиться, что llms.txt корректно определяется и не содержит ошибок.</p>

  <h2>Частые ошибки при создании llms.txt</h2>
  <ul>
    <li><strong>Файл не в корне.</strong> llms.txt должен лежать строго в корне сайта, иначе AI-краулеры его не найдут.</li>
    <li><strong>Некорректный формат.</strong> Файл должен быть в кодировке UTF-8, иначе символы могут отображаться неверно.</li>
    <li><strong>Отсутствие описания.</strong> Первая строка должна содержать краткое описание сайта — это самый важный элемент.</li>
    <li><strong>Битые ссылки.</strong> Проверяйте, что все указанные в llms.txt страницы действительно существуют.</li>
  </ul>

  <h2>Как GeoScan помогает с llms.txt</h2>
  <p>
    GeoScan автоматически проверяет наличие и корректность файла llms.txt при сканировании сайта. 
    Если файл отсутствует или содержит ошибки, вы сразу увидите это в отчёте и получите 
    конкретные рекомендации по исправлению.
  </p>
  <p>
    А с помощью AI-генератора вы можете сразу получить готовый llms.txt, 
    созданный специально для вашего сайта на основе его содержимого.
  </p>
  <p style="margin-top: 2rem; padding: 1.5rem; background: #1e293b; border-radius: 0.75rem; border: 1px solid #334155;">
    <strong class="text-emerald-400">Проверьте, есть ли у вашего сайта llms.txt прямо сейчас</strong><br />
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