import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const cookie = request.headers.get('cookie');
    if (!cookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const match = cookie.match(/sb-myvrvareozixdmecqjgc-auth-token=([^;]+)/);
    if (!match) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const tokenData = JSON.parse(decodeURIComponent(match[1]));
    const accessToken = tokenData.access_token;
    if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: yandexSettings, error: yandexError } = await supabase
      .from('yandex_webmaster_props')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (yandexError || !yandexSettings) {
      return NextResponse.json({ message: 'Yandex Webmaster not configured' });
    }

    // Заглушка: Яндекс API требует OAuth, для MVP возвращаем примерные данные
    // В реальной интеграции здесь будет запрос к API Яндекс.Вебмастера
    const demoData = {
      clicks: Math.floor(Math.random() * 500),
      impressions: Math.floor(Math.random() * 5000),
      avgPosition: (Math.random() * 10 + 2).toFixed(1),
      siteUrl: yandexSettings.site_url,
    };

    return NextResponse.json(demoData);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}