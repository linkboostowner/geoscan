import './globals.css';

export const metadata = {
  title: 'GeoScan – Make Your Site AI-Ready in 60 Seconds',
  description:
    'Scan your website for visibility in AI search engines like ChatGPT and Perplexity. Get a detailed GEO Score, specific fixes, and ready-to-use corrected files.',
  openGraph: {
    title: 'GeoScan – AI Visibility Checker',
    description:
      'Find out if ChatGPT, Perplexity, and other AI search engines can see your site. Free scan in 60 seconds.',
    url: 'https://geoscan-a.vercel.app',
    siteName: 'GeoScan',
    images: [
      {
        url: 'https://geoscan-a.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GeoScan – AI Visibility Report',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GeoScan – AI Visibility Checker',
    description:
      'Find out if ChatGPT, Perplexity, and other AI search engines can see your site. Free scan in 60 seconds.',
    images: ['https://geoscan-a.vercel.app/og-image.png'],
  },
  verification: {
    google: 'cs3tshPb1PAH-E41BcmqwZM3dlB_gGXFFAehaVLsxRE',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white antialiased">{children}</body>
    </html>
  );
}