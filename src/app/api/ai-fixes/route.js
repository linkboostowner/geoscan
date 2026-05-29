import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { url, results } = await request.json();
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key is missing');
    }
    
    const prompt = `You are an expert in Generative Engine Optimization. The user scanned ${url} and got these results:
${JSON.stringify(results, null, 2)}

Based on the issues found, generate the following files.
1. A corrected robots.txt that allows ChatGPT, Perplexity, and Google-Extended.
2. An llms.txt file describing the site (infer content from the URL).
3. A JSON-LD Schema.org snippet for a typical SaaS/website.

Return ONLY a valid JSON object with keys: "robots", "llms", "schema". Each value must be the complete file content as a string.
Do not include any markdown formatting or extra text. The response must be pure JSON.`;

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
        max_tokens: 2000, // увеличенный лимит, чтобы влезли все три файла
        temperature: 0.3, // снижаем креативность для точности JSON
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', errorText);
      return NextResponse.json({ error: `OpenRouter error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';

    console.log('Raw AI Fixes content:', content);

    // Удаляем возможную markdown-обёртку и извлекаем JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    } else {
      throw new Error('No JSON object found in response');
    }

    const parsed = JSON.parse(content);
    
    // Проверяем, что все три ключа присутствуют
    if (!parsed.robots || !parsed.llms || !parsed.schema) {
      // Если какого-то ключа нет, пытаемся заполнить его из текста
      return NextResponse.json({
        robots: parsed.robots || 'User-agent: *\nDisallow: /',
        llms: parsed.llms || 'No llms.txt generated.',
        schema: parsed.schema || '{}',
      });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('AI Fixes error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}