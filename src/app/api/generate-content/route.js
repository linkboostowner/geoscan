import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { url, contentTypes } = await request.json();
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'OpenRouter API key is missing' }, { status: 500 });
    }

    // Сначала получим текст главной страницы
    let pageText = '';
    try {
      const pageRes = await fetch(url.startsWith('http') ? url : 'https://' + url, {
        signal: AbortSignal.timeout(5000),
      });
      if (pageRes.ok) {
        const html = await pageRes.text();
        pageText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 3000);
      }
    } catch {}

    const requestedTypes = contentTypes || ['faq', 'definitions', 'summary'];
    
    const prompt = `You are an expert in Generative Engine Optimization (GEO). A website (${url}) needs content that will be easily cited by AI search engines like ChatGPT and Perplexity.

${pageText ? `The current page content starts with: "${pageText.slice(0, 1000)}"` : 'No page content available.'}

Generate the following content types that will increase the site's AI visibility and citation potential:
${requestedTypes.includes('faq') ? '- FAQ section: 5 questions and answers that AI models would likely cite' : ''}
${requestedTypes.includes('definitions') ? '- Key definitions: 3-4 clear, concise definitions of important terms related to the site' : ''}
${requestedTypes.includes('summary') ? '- Executive summary: a 3-4 sentence summary optimized for AI extraction' : ''}
${requestedTypes.includes('lists') ? '- Structured list: a bulleted list of key features, benefits, or steps that LLMs love to cite' : ''}

For each generated block, estimate the potential impact on GEO Score (e.g., "+5-10 points") and citation potential (e.g., "High", "Medium").

Return ONLY a valid JSON object with this exact structure:
{
  "blocks": [
    {
      "type": "faq",
      "title": "Frequently Asked Questions",
      "content": "<h3>FAQ</h3><p>...</p>",
      "impact": "Adds 8-12 GEO Score points. High citation potential for question-based queries."
    },
    ...
  ]
}

The "content" field should contain ready-to-use HTML. Do not include any markdown or extra text. The response must be pure JSON.`;

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