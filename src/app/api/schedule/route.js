import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request) {
  try {
    const { url, email, frequency } = await request.json();
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

    const { data, error } = await supabase.from('scheduled_reports').insert({
      user_id: user.id,
      url,
      email: email || null,
      frequency: frequency || 'weekly',
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ success: true, report: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}