import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text, targetLang } = await request.json();
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key is missing');
    }

    const prompt = `Translate the following text to ${targetLang === 'en' ? 'English' : 'Russian'}. Keep all HTML tags, code blocks, and formatting unchanged. Translate only the natural language parts. Return ONLY the translated text, no explanations.\n\n${text}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://geoscan-alpha.vercel.app',
        'X-Title': 'GeoScan',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `OpenRouter error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    const translated = data.choices?.[0]?.message?.content || text;
    return NextResponse.json({ translated });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}