import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request) {
  try {
    const { competitorUrls } = await request.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Получаем пользователя из куки
    const cookie = request.headers.get('cookie');
    if (!cookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const match = cookie.match(/sb-myvrvareozixdmecqjgc-auth-token=([^;]+)/);
    if (!match) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const tokenData = JSON.parse(decodeURIComponent(match[1]));
    const accessToken = tokenData.access_token;
    if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const results = {};
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://geoscan-a.vercel.app';

    for (const competitorUrl of competitorUrls) {
      try {
        const scanRes = await fetch(`${baseUrl}/api/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: competitorUrl }),
        });

        if (scanRes.ok) {
          const data = await scanRes.json();
          // Сохраняем в Supabase
          await supabase.from('competitor_monitoring').insert({
            user_id: user.id,
            competitor_url: competitorUrl,
            total_score: data.totalScore,
            robots_score: data.robots.score,
            llms_score: data.llms.score,
            sitemap_score: data.sitemap.score,
            meta_score: data.meta.score,
            og_score: data.openGraph.score,
            schema_score: data.schema.score,
            details: data,
          });
          results[competitorUrl] = data;
        } else {
          results[competitorUrl] = { error: 'Scan failed' };
        }
      } catch {
        results[competitorUrl] = { error: 'Scan error' };
      }
    }

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}