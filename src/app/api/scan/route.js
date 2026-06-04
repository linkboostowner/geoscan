import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { url: rawUrl } = await request.json();
    const url = rawUrl.startsWith('http') ? rawUrl : 'https://' + rawUrl;
    const baseUrl = new URL(url).origin;

    const fetchWithTimeout = (url, timeout = 5000) =>
      fetch(url, { signal: AbortSignal.timeout(timeout) });

    const results = {
      robots: { score: 0, details: '', status: 'pending', crawlers: {} },
      llms: { score: 0, details: '', status: 'pending' },
      sitemap: { score: 0, details: '', status: 'pending' },
      meta: { score: 0, details: '', status: 'pending' },
      openGraph: { score: 0, details: '', status: 'pending' },
      schema: { score: 0, details: '', status: 'pending' },
      totalScore: 0,
      entityAnalysis: null,
    };

    const aiCrawlers = {
      'GPTBot': 'ChatGPT (OpenAI)',
      'PerplexityBot': 'Perplexity',
      'Google-Extended': 'Google AI Overviews',
      'Claude-Web': 'Claude (Anthropic)',
    };

    for (const bot of Object.keys(aiCrawlers)) {
      results.robots.crawlers[bot] = { status: 'unknown', label: aiCrawlers[bot] };
    }

    // --- robots.txt ---
    try {
      const res = await fetchWithTimeout(`${baseUrl}/robots.txt`);
      if (res.ok) {
        const text = await res.text();
        const lines = text.split(/\r?\n/);
        let currentAgent = '';
        for (let line of lines) {
          line = line.trim().toLowerCase();
          if (line.startsWith('user-agent:')) {
            currentAgent = line.slice(11).trim();
          } else if (line.startsWith('disallow:') && currentAgent) {
            const path = line.slice(9).trim();
            if (path === '/') {
              for (const bot of Object.keys(aiCrawlers)) {
                if (currentAgent === bot.toLowerCase()) {
                  results.robots.crawlers[bot].status = 'blocked';
                }
              }
              if (currentAgent === '*') {
                for (const bot of Object.keys(aiCrawlers)) {
                  if (results.robots.crawlers[bot].status === 'unknown') {
                    results.robots.crawlers[bot].status = 'blocked';
                  }
                }
              }
            }
          } else if (line.startsWith('allow:') && currentAgent) {
            const path = line.slice(6).trim();
            if (path === '/') {
              for (const bot of Object.keys(aiCrawlers)) {
                if (currentAgent === bot.toLowerCase()) {
                  results.robots.crawlers[bot].status = 'allowed';
                }
              }
            }
          }
        }
        for (const bot of Object.keys(aiCrawlers)) {
          if (results.robots.crawlers[bot].status === 'unknown') {
            results.robots.crawlers[bot].status = 'allowed';
          }
        }
        const blockedBots = Object.values(results.robots.crawlers).filter(c => c.status === 'blocked').length;
        if (blockedBots === 0) {
          results.robots.score = 25;
          results.robots.details = 'All AI crawlers are allowed';
          results.robots.status = 'good';
        } else if (blockedBots < 2) {
          results.robots.score = 15;
          results.robots.details = `${blockedBots} AI crawler(s) blocked`;
          results.robots.status = 'warning';
        } else {
          results.robots.score = 5;
          results.robots.details = `${blockedBots} AI crawlers blocked — site is mostly invisible`;
          results.robots.status = 'bad';
        }
      } else {
        results.robots.score = 5;
        results.robots.details = 'robots.txt not found (404)';
        results.robots.status = 'bad';
      }
    } catch {
      results.robots.score = 5;
      results.robots.details = 'robots.txt fetch error';
      results.robots.status = 'bad';
    }

    // --- llms.txt ---
    try {
      const res = await fetchWithTimeout(`${baseUrl}/llms.txt`);
      if (res.ok) {
        const text = await res.text();
        if (text.trim().length > 20) {
          results.llms = { score: 20, details: 'llms.txt present with content', status: 'good' };
        } else {
          results.llms = { score: 10, details: 'llms.txt exists but empty or minimal', status: 'ok' };
        }
      } else {
        results.llms = { score: 5, details: 'llms.txt not found', status: 'bad' };
      }
    } catch {
      results.llms = { score: 5, details: 'llms.txt fetch error', status: 'bad' };
    }

    // --- sitemap.xml ---
    try {
      const res = await fetchWithTimeout(`${baseUrl}/sitemap.xml`);
      if (res.ok) {
        results.sitemap = { score: 15, details: 'sitemap.xml accessible', status: 'good' };
      } else {
        results.sitemap = { score: 5, details: 'sitemap.xml not found', status: 'bad' };
      }
    } catch {
      results.sitemap = { score: 5, details: 'sitemap.xml fetch error', status: 'bad' };
    }

    // --- HTML main page (title, meta, open graph, schema, entity analysis) ---
    try {
      const res = await fetchWithTimeout(url);
      if (res.ok) {
        const html = await res.text();

        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : '';
        results.meta = {
          score: title.length > 10 ? 10 : 5,
          details: title ? `Title: "${title.slice(0, 80)}"` : 'Missing title',
          status: title ? 'good' : 'bad',
        };

        const ogTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]*)"/i);
        const ogDesc = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]*)"/i);
        const ogImage = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]*)"/i);
        const hasOg = ogTitle || ogDesc || ogImage;
        results.openGraph = {
          score: hasOg ? 15 : 5,
          details: hasOg ? 'Open Graph tags found' : 'No Open Graph tags detected',
          status: hasOg ? 'good' : 'bad',
        };

        const schemaMatch = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>(.*?)<\/script>/i);
        results.schema = {
          score: schemaMatch ? 15 : 5,
          details: schemaMatch ? 'Schema.org markup found' : 'No JSON-LD schema detected',
          status: schemaMatch ? 'good' : 'bad',
        };

        // --- Entity Analysis ---
        try {
          const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
          if (OPENROUTER_API_KEY) {
            const bodyText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 2000);
            const entityPrompt = `Extract the 5 most important entities (people, companies, products, technologies, concepts) from this page content. For each entity, assess its authority and relevance for AI search engines (Low/Medium/High). Return ONLY a JSON array like [{"entity": "...", "authority": "High", "relevance": "High"}]. Content: ${bodyText}`;

            const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://geoscan-a.vercel.app',
                'X-Title': 'GeoScan',
              },
              body: JSON.stringify({
                model: 'openrouter/free',
                messages: [{ role: 'user', content: entityPrompt }],
                max_tokens: 400,
              }),
            });

            if (aiRes.ok) {
              const aiData = await aiRes.json();
              const content = aiData.choices?.[0]?.message?.content || '[]';
              const jsonMatch = content.match(/\[[\s\S]*\]/);
              if (jsonMatch) {
                results.entityAnalysis = JSON.parse(jsonMatch[0]);
              }
            }
          }
        } catch {}
      } else {
        results.meta = { score: 5, details: 'Page not accessible', status: 'bad' };
        results.openGraph = { score: 5, details: 'Page not accessible', status: 'bad' };
        results.schema = { score: 5, details: 'Page not accessible', status: 'bad' };
      }
    } catch {
      results.meta = { score: 5, details: 'Main page fetch error', status: 'bad' };
      results.openGraph = { score: 5, details: 'Main page fetch error', status: 'bad' };
      results.schema = { score: 5, details: 'Main page fetch error', status: 'bad' };
    }

    results.totalScore =
      results.robots.score + results.llms.score + results.sitemap.score +
      results.meta.score + results.openGraph.score + results.schema.score;

    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}