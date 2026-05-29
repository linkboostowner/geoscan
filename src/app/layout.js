import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';

export const metadata = {
  title: 'GeoScan – Make Your Site AI-Ready in 60 Seconds',
  description: 'Scan your website for visibility in AI search engines like ChatGPT and Perplexity. Get a detailed GEO Score and actionable fixes.',
};

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="bg-slate-950 text-white antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}