import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  // Prefer user info from request body (client will send userId/email).
  // This avoids relying on server-side cookie/session state which may not be available.
  let body: any = {}
  try {
    body = await req.json();
  } catch (e) {
    body = {};
  }

  const userIdFromBody = body?.userId;
  const userEmailFromBody = body?.email;

  // If no user info in body, try server-side getUser (best-effort)
  let serverUser: any = null;
  if (!userIdFromBody) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      serverUser = user;
    } catch (e) {
      serverUser = null;
    }
  }
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // Set this in your env
          quantity: 1,
        },
      ],
      customer_email: userEmailFromBody || serverUser?.email || undefined,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?canceled=1`,
      metadata: {
        user_id: userIdFromBody || serverUser?.id || null,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout creation error:', err);
    return NextResponse.json({ error: 'stripe_error', detail: String(err) }, { status: 500 });
  }
}
