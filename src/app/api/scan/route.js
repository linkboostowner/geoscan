export async function POST(request) {
  try {
    const { url: rawUrl } = await request.json();
    const url = rawUrl.startsWith('http') ? rawUrl : 'https://' + rawUrl;
    const baseUrl = new URL(url).origin;

    // Вспомогательная функция для fetch с таймаутом
    const fetchWithTimeout = (url, timeout = 5000) =>
      fetch(url, { signal: AbortSignal.timeout(timeout) });

    const results = {
      robots: { score: 0, details: '', status: 'pending' },
      llms: { score: 0, details: '', status: 'pending' },
      sitemap: { score: 0, details: '', status: 'pending' },
      meta: { score: 0, details: '', status: 'pending' },
      openGraph: { score: 0, details: '', status: 'pending' },
      schema: { score: 0, details: '', status: 'pending' },
      totalScore: 0,
    };

    // --- 1. robots.txt ---
    try {
      const res = await fetchWithTimeout(`${baseUrl}/robots.txt`);
      if (res.ok) {
        const text = await res.text();
        const lines = text.split(/\r?\n/);
        let currentAgent = '';
        let aiBlocked = false;
        let aiAllowed = false;
        let allBlocked = false;

        for (let line of lines) {
          line = line.trim().toLowerCase();
          if (line.startsWith('user-agent:')) {
            currentAgent = line.slice(11).trim();
          } else if (line.startsWith('disallow:') && currentAgent) {
            const path = line.slice(9).trim();
            if (path === '/' && (currentAgent === '*' || currentAgent.includes('gptbot') || currentAgent.includes('google-extended') || currentAgent.includes('perplexity'))) {
              aiBlocked = true;
            }
            if (path === '/' && currentAgent === '*') {
              allBlocked = true;
            }
          } else if (line.startsWith('allow:') && currentAgent) {
            if (currentAgent.includes('gptbot') || currentAgent.includes('google-extended')) {
              aiAllowed = true;
            }
          }
        }

        if (allBlocked && !aiAllowed) {
          results.robots = { score: 10, details: 'Site blocks all robots (Disallow: /)', status: 'warning' };
        } else if (aiBlocked) {
          results.robots = { score: 15, details: 'AI bots are explicitly blocked', status: 'warning' };
        } else if (aiAllowed) {
          results.robots = { score: 25, details: 'AI bots are allowed', status: 'good' };
        } else {
          results.robots = { score: 20, details: 'No specific AI bot rules found', status: 'ok' };
        }
      } else {
        results.robots = { score: 5, details: 'robots.txt not found (404)', status: 'bad' };
      }
    } catch {
      results.robots = { score: 5, details: 'robots.txt fetch error', status: 'bad' };
    }

    // --- 2. llms.txt ---
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

    // --- 3. sitemap.xml ---
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

    // --- 4. HTML main page: title, meta, open graph, schema ---
    try {
      const res = await fetchWithTimeout(url);
      if (res.ok) {
        const html = await res.text();

        // Title
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : '';
        results.meta = { score: title.length > 10 ? 10 : 5, details: title ? `Title: "${title.slice(0, 80)}"` : 'Missing title', status: title ? 'good' : 'bad' };

        // Open Graph
        const ogTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]*)"/i);
        const ogDesc = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]*)"/i);
        const ogImage = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]*)"/i);
        const hasOg = ogTitle || ogDesc || ogImage;
        results.openGraph = {
          score: hasOg ? 15 : 5,
          details: hasOg ? 'Open Graph tags found' : 'No Open Graph tags detected',
          status: hasOg ? 'good' : 'bad',
        };

        // Schema.org (JSON-LD)
        const schemaMatch = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>(.*?)<\/script>/i);
        results.schema = {
          score: schemaMatch ? 15 : 5,
          details: schemaMatch ? 'Schema.org markup found' : 'No JSON-LD schema detected',
          status: schemaMatch ? 'good' : 'bad',
        };
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

    // --- Total score (max 100) ---
    results.totalScore =
      results.robots.score +
      results.llms.score +
      results.sitemap.score +
      results.meta.score +
      results.openGraph.score +
      results.schema.score;

    return Response.json(results);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}