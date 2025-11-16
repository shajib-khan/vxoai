import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  // Get user from Supabase Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Create Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID, // Set this in your env
        quantity: 1,
      },
    ],
    customer_email: user.email,
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?canceled=1`,
    metadata: {
      user_id: user.id,
    },
  });

  return NextResponse.json({ url: session.url });
}
