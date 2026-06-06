import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request) {
  try {
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) return NextResponse.json({ error: 'API key required' }, { status: 401 });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Проверяем API‑ключ и лимиты
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('api_key', apiKey)
      .single();

    if (keyError || !keyData) return NextResponse.json({ error: 'Invalid API key' }, { status: 403 });

    if (keyData.requests_used >= keyData.requests_limit) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { urls } = await request.json();
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'URLs array required' }, { status: 400 });
    }

    const results = {};
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://geoscan-a.vercel.app';

    for (const url of urls) {
      try {
        const scanRes = await fetch(`${baseUrl}/api/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        if (scanRes.ok) {
          results[url] = await scanRes.json();
        } else {
          results[url] = { error: 'Scan failed' };
        }
      } catch {
        results[url] = { error: 'Scan error' };
      }
    }

    // Обновляем счётчик запросов
    await supabase
      .from('api_keys')
      .update({ requests_used: keyData.requests_used + urls.length })
      .eq('id', keyData.id);

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}