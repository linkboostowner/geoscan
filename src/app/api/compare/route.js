import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { urls } = await request.json();
    // Функция для одного сканирования (вызывает наш же scan API)
    const scanSingle = async (url) => {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) return null;
      return await res.json();
    };

    const results = {};
    for (const url of urls) {
      results[url] = await scanSingle(url);
    }
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}