import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { url, results } = await request.json();
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
    
    const prompt = `You are an expert in Generative Engine Optimization. The user scanned ${url} and got these results: ${JSON.stringify(results)}.

Your task:
1. Generate the following corrected files:
   - robots.txt (allows ChatGPT, Perplexity, Google-Extended, Claude-Web)
   - llms.txt (infers content from the URL)
   - JSON-LD Schema.org snippet for a typical SaaS/website.

2. Analyze the issues and provide a prioritized action plan with three levels:
   - 🔴 Critical (must fix immediately)
   - 🟠 Important (fix within a week)
   - 🟢 Recommended (good practice)
   For each action, estimate the potential impact on AI visibility (e.g., "+10–15% citation potential").

3. Evaluate the content's Natural Language Readiness:
   - Does the main heading (H1) answer a typical AI-user question?
   - Are there lists, tables, or clear definitions that LLMs can cite?
   - Suggest specific improvements to increase citation potential.

Return ONLY a valid JSON object with this exact structure:
{
  "robots": "corrected robots.txt content",
  "llms": "generated llms.txt content",
  "schema": "generated JSON-LD schema",
  "priorities": {
    "critical": ["Action 1 – estimated impact X%"],
    "important": ["Action 2 – estimated impact Y%"],
    "recommended": ["Action 3 – estimated impact Z%"]
  },
  "contentTips": "Summary of content improvements to boost natural language readiness and citation potential."
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