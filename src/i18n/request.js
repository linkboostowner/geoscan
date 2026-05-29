import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  // Если локаль не определена (например, на странице 404), используем 'en'
  const safeLocale = locale || 'en';
  return {
    messages: (await import(`../../messages/${safeLocale}.json`)).default,
  };
});