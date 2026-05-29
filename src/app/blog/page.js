export default function Blog() {
  const posts = [
    {
      slug: 'kak-uznat-vidit-li-chatgpt-vash-sait',
      title: 'Как узнать, видит ли ChatGPT ваш сайт: чек-лист из 6 шагов',
      date: '2026-05-28',
      excerpt: 'Пошаговое руководство по проверке видимости сайта для AI-поисковиков.',
    },
    {
      slug: 'oshibki-robots-txt-ai-poiskoviki',
      title: 'Ошибки в robots.txt для AI-поисковиков: как исправить за 5 минут',
      date: '2026-05-29',
      excerpt: 'Разбираем частые ошибки в robots.txt, из-за которых ChatGPT и Perplexity не видят ваш сайт.',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Блог GeoScan</h1>
        <div className="space-y-6">
          {posts.map(post => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block p-6 bg-slate-800 border border-slate-700 rounded-xl hover:border-emerald-400 transition-colors"
            >
              <h2 className="text-xl font-semibold text-emerald-400 mb-2">{post.title}</h2>
              <p className="text-slate-400 text-sm mb-2">{post.date}</p>
              <p className="text-slate-300">{post.excerpt}</p>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}