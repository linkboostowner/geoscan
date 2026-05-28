import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { url, results } = await request.json();
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key is missing');
    }
    
    const prompt = `The user scanned ${url} and got these results: ${JSON.stringify(results)}. Based on the issues found, generate the following files:
1. A corrected robots.txt that allows ChatGPT, Perplexity, and Google-Extended.
2. An llms.txt file describing the site (infer content from the URL).
3. A JSON-LD Schema.org snippet for a typical SaaS/website.
Return ONLY a valid JSON object with keys: "robots", "llms", "schema". Each value should be the complete file content as a string. Do not include any markdown or extra text.`;

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
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `OpenRouter error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';
    
    // Извлекаем JSON из возможного текста
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }
    
    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}