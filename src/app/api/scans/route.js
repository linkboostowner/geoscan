import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function getUserId(request) {
  const cookie = request.headers.get('cookie');
  if (!cookie) return null;
  const match = cookie.match(/sb-myvrvareozixdmecqjgc-auth-token=([^;]+)/);
  if (!match) return null;
  try {
    const tokenData = JSON.parse(decodeURIComponent(match[1]));
    const accessToken = tokenData.access_token;
    if (!accessToken) return null;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user.id;
  } catch {
    return null;
  }
}

export async function GET(request) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

export async function POST(request) {
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supabase.from('scans').insert({
    user_id: userId,
    url: body.url,
    total_score: body.totalScore,
    robots_score: body.robotsScore,
    llms_score: body.llmsScore,
    sitemap_score: body.sitemapScore,
    meta_score: body.metaScore,
    og_score: body.ogScore,
    schema_score: body.schemaScore,
    details: body.details,
  }).select().single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}