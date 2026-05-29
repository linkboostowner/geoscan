import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ru'],
  defaultLocale: 'en',
});

export const config = {
  // Матчер, который обрабатывает все пути, кроме API и статических файлов Next.js
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};