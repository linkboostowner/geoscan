import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { urls, keywords } = await request.json();
    if (!urls || !keywords || !Array.isArray(urls) || !Array.isArray(keywords)) {
      return NextResponse.json({ error: 'URLs and keywords arrays required' }, { status: 400 });
    }

    const results = {};
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://georank-tracker.vercel.app';

    for (const url of urls) {
      try {
        const res = await fetch(`${baseUrl}/api/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, keywords }),
        });
        if (res.ok) {
          const data = await res.json();
          results[url] = data.results;
        } else {
          results[url] = null;
        }
      } catch {
        results[url] = null;
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}