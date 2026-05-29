import './globals.css';

export const metadata = {
  title: 'GeoScan – Make Your Site AI-Ready in 60 Seconds',
  description: 'Scan your website for visibility in AI search engines like ChatGPT and Perplexity.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}