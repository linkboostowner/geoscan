import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message, context } = await request.json();
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
    
    const systemPrompt = `You are an AI assistant specialized in Generative Engine Optimization (GEO). The user just scanned their website and received the following results: ${JSON.stringify(context)}. Your task is to answer their questions clearly, give specific instructions, and ALWAYS prioritize your recommendations by criticality:
- 🔴 Critical (must fix immediately): issues that completely block AI crawlers or make the site invisible.
- 🟠 Important (fix within a week): issues that significantly reduce visibility or trust.
- 🟢 Recommended (good practice): improvements that enhance AI visibility but are not urgent.
If relevant, provide code snippets. Keep answers concise but actionable. Always end with a summary of the top 3 actions the user should take.`;
    
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
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `OpenRouter error: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'No response generated.';
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}