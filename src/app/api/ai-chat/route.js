import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message, context } = await request.json();
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
    
    const systemPrompt = `You are an AI assistant specialized in Generative Engine Optimization (GEO). The user just scanned their website and received the following results: ${JSON.stringify(context)}.

Your task:
1. Analyze the results and answer the user's question clearly.
2. Whenever possible, provide **specific, measurable recommendations** with estimated impact (e.g., "Adding this structured data could increase your citation potential by 10–15%").
3. Prioritize recommendations by criticality: 🔴 Critical (must fix immediately), 🟠 Important (fix within a week), 🟢 Recommended (good practice).
4. If the user asks about content, evaluate:
   - Natural Language Readiness: how well the content answers typical AI-user questions.
   - Citation Potential: presence of lists, tables, clear definitions that LLMs love to cite.
5. End with a summary of the top 3 actions the user should take.
Keep answers concise but actionable.`;
    
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