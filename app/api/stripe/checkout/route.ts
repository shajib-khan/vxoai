
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch (e) {
    body = {};
  }

  const userId = body?.userId;
  const email = body?.email;

  if (!userId || !email) {
    return NextResponse.json(
      { error: 'missing_user_info' },
      { status: 400 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription?canceled=1`,
      metadata: {
        user_id: userId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout creation error:', err);
    return NextResponse.json(
      { error: 'stripe_error', detail: String(err) },
      { status: 500 }
    );
  }
}
