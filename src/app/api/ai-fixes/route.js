import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { url, results } = await request.json();
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
    
    const prompt = `You are an expert in Generative Engine Optimization. The user scanned ${url} and got these results: ${JSON.stringify(results)}.

Your task:
1. Generate the following corrected files:
   - robots.txt (allows ChatGPT, Perplexity, Google-Extended)
   - llms.txt (infers content from the URL)
   - JSON-LD Schema.org snippet for a typical SaaS/website.

2. Analyze the issues and provide a prioritized action plan with three levels:
   - 🔴 Critical (must fix immediately)
   - 🟠 Important (fix within a week)
   - 🟢 Recommended (good practice)

Return ONLY a valid JSON object with this exact structure:
{
  "robots": "corrected robots.txt content",
  "llms": "generated llms.txt content",
  "schema": "generated JSON-LD schema",
  "priorities": {
    "critical": ["Action 1", "Action 2"],
    "important": ["Action 3"],
    "recommended": ["Action 4", "Action 5"]
  }
}
Do not include any markdown or extra text. The response must be pure JSON.`;

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
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
        max_tokens: 2000,
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