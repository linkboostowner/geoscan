import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(request) {
  try {
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

    // Ищем сохранённые настройки GSC для пользователя
    const { data: gscSettings, error: gscError } = await supabase
      .from('gsc_properties')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (gscError || !gscSettings) {
      return NextResponse.json({ message: 'GSC not configured' });
    }

    // Запрашиваем данные из Google Search Console API (последние 30 дней)
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const gscResponse = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(gscSettings.property_url)}/searchAnalytics/query?key=${gscSettings.api_key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: thirtyDaysAgo,
          endDate: today,
          dimensions: ['date'],
          rowLimit: 31,
        }),
      }
    );

    if (!gscResponse.ok) {
      const errText = await gscResponse.text();
      return NextResponse.json({ error: `GSC API error: ${errText}` }, { status: 500 });
    }

    const gscData = await gscResponse.json();
    const metrics = { clicks: 0, impressions: 0, avgPosition: 0, days: [] };

    if (gscData.rows) {
      let totalClicks = 0;
      let totalImpressions = 0;
      let totalPosition = 0;
      let count = 0;

      gscData.rows.forEach(row => {
        const clicks = row.clicks || 0;
        const impressions = row.impressions || 0;
        const position = row.position || 0;
        totalClicks += clicks;
        totalImpressions += impressions;
        totalPosition += position * impressions;
        count += impressions;

        metrics.days.push({
          date: row.keys[0],
          clicks,
          impressions,
          position: row.position || 0,
        });
      });

      metrics.clicks = totalClicks;
      metrics.impressions = totalImpressions;
      metrics.avgPosition = count > 0 ? (totalPosition / count).toFixed(1) : 0;
    }

    return NextResponse.json(metrics);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}