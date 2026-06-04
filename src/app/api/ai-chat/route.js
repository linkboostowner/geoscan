import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message, context } = await request.json();
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
    
    const systemPrompt = `You are an expert AI assistant specialized in Generative Engine Optimization (GEO). The user just scanned their website and received the following detailed results: ${JSON.stringify(context)}.

Your task:
1. Analyze the results and answer the user's question clearly.
2. **Always provide specific, measurable recommendations with estimated impact.** For example:
   - "Adding an llms.txt file could increase your GEO Score by 20 points and raise citation potential by 15%."
   - "Fixing robots.txt to unblock GPTBot will immediately make your site visible to ChatGPT, potentially recovering 30% of lost AI traffic."
3. Prioritize recommendations by criticality with clear impact estimates:
   - 🔴 Critical (must fix immediately, impact: high)
   - 🟠 Important (fix within a week, impact: medium)
   - 🟢 Recommended (good practice, impact: low)
4. If the user asks about content, evaluate:
   - Natural Language Readiness: how well the content answers typical AI-user questions.
   - Citation Potential: presence of lists, tables, clear definitions that LLMs love to cite.
5. **End with a concrete, actionable checklist** that the user can copy-paste, with each item having a predicted impact on their GEO Score (e.g., "+15 points").
Keep answers concise but actionable. Use the specific scores and details from the scan to make your advice personalized.`;
    
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
        max_tokens: 1200,
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