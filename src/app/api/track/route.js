import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { url, keywords } = await request.json();
    if (!url || !keywords || !Array.isArray(keywords)) {
      return NextResponse.json({ error: 'URL and keywords array required' }, { status: 400 });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key is missing');
    }

    const prompt = `For each keyword in the following list: ${JSON.stringify(keywords)}. Determine if the website ${url} would appear in AI-generated search results (like ChatGPT, Perplexity). Return a JSON array of objects with keys: "keyword" (string), "appearing" (boolean), "snippet" (string or null), "position" (number or null). Only respond with the JSON array.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://georank-tracker.vercel.app',
        'X-Title': 'GeoRank Tracker',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `OpenRouter error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const results = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}