import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Обработка подписки PRO
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    if (session.mode === 'subscription') {
      const userId = session.client_reference_id;
      await supabase.from('profiles').upsert({
        id: userId,
        stripe_customer_id: session.customer,
        subscription_status: 'active',
        updated_at: new Date(),
      });
    } else if (session.mode === 'payment' && session.metadata?.type === 'ai_generation') {
      // Разовая оплата — просто логируем, доступ выдадим через временный токен
      const userId = session.client_reference_id;
      await supabase.from('one_time_purchases').insert({
        user_id: userId,
        session_id: session.id,
        url: session.metadata.url,
        created_at: new Date(),
      });
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', subscription.customer)
      .single();
    if (data) {
      await supabase.from('profiles').update({
        subscription_status: 'inactive',
        updated_at: new Date(),
      }).eq('id', data.id);
    }
  }

  return NextResponse.json({ received: true });
}