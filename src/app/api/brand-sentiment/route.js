import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { url } = await request.json();
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'OpenRouter API key is missing' }, { status: 500 });
    }

    // Получаем текст страницы
    let pageText = '';
    try {
      const pageRes = await fetch(url.startsWith('http') ? url : 'https://' + url, {
        signal: AbortSignal.timeout(5000),
      });
      if (pageRes.ok) {
        const html = await pageRes.text();
        pageText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 3000);
      }
    } catch {
      return NextResponse.json({ error: 'Failed to fetch page content' }, { status: 500 });
    }

    if (!pageText) {
      return NextResponse.json({ error: 'No content found' }, { status: 404 });
    }

    const prompt = `Analyze the sentiment of the following website content. Determine the overall brand sentiment (Positive, Neutral, Negative, or Mixed) and identify specific phrases that contribute to this assessment. Return ONLY a JSON object with this structure:
{
  "overallSentiment": "Positive|Neutral|Negative|Mixed",
  "confidence": "High|Medium|Low",
  "keyPhrases": [
    {"phrase": "text", "sentiment": "positive|negative|neutral", "reason": "brief explanation"}
  ],
  "recommendation": "Brief actionable recommendation to improve brand sentiment for AI search visibility."
}
Content: ${pageText}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://geoscan-a.vercel.app',
        'X-Title': 'GeoScan',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `OpenRouter error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) content = jsonMatch[0];
    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}