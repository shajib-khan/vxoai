import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabase } from '@/lib/supabaseClient';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed.' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    // session may include subscription and customer ids
    const userId = session.metadata?.user_id;
    const stripeSubscriptionId = (session.subscription as string) || undefined;
    const stripeCustomerId = (session.customer as string) || undefined;

    if (userId) {
      await supabase
        .from('subscriptions')
        .upsert([
          {
            user_id: userId,
            active: true,
            stripe_subscription_id: stripeSubscriptionId || null,
            stripe_customer_id: stripeCustomerId || null,
          },
        ], { onConflict: 'user_id' });
    }
  }

  // When a subscription is created/updated directly in Stripe
  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' || event.type === 'invoice.payment_succeeded') {
    const payload = event.data.object as any;
    // invoice.payment_succeeded payload may contain subscription and customer
    const subscriptionId = payload.id || payload.subscription || payload.lines?.data?.[0]?.subscription;
    const customerId = payload.customer || payload.customer_id;

    try {
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
        const userId = subscription.metadata?.user_id;
        const status = subscription.status;
        const active = status === 'active' || status === 'trialing' || status === 'past_due';
        if (userId) {
          await supabase.from('subscriptions').upsert([
            {
              user_id: userId,
              active,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: subscription.customer as string,
            },
          ], { onConflict: 'user_id' });
        }
      } else if (customerId) {
        // if we only have customer id, try to find subscription via list
        const subs = await stripe.subscriptions.list({ customer: customerId as string, limit: 1 });
        const subscription = subs.data[0];
        if (subscription) {
          const userId = subscription.metadata?.user_id;
          const status = subscription.status;
          const active = status === 'active' || status === 'trialing' || status === 'past_due';
          if (userId) {
            await supabase.from('subscriptions').upsert([
              {
                user_id: userId,
                active,
                stripe_subscription_id: subscription.id,
                stripe_customer_id: subscription.customer as string,
              },
            ], { onConflict: 'user_id' });
          }
        }
      }
    } catch (err) {
      console.error('Error handling subscription event:', err);
    }
  }

  // Handle subscription cancellations
  if (event.type === 'customer.subscription.deleted' || event.type === 'invoice.payment_failed') {
    const payload = event.data.object as any;
    const subscriptionId = payload.id || payload.subscription;
    try {
      let userId: string | null = null;
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
        userId = subscription.metadata?.user_id || null;
      }
      if (!userId && payload.customer) {
        const subs = await stripe.subscriptions.list({ customer: payload.customer as string, limit: 1 });
        userId = subs.data[0]?.metadata?.user_id || null;
      }
      if (userId) {
        await supabase.from('subscriptions').upsert([
          { user_id: userId, active: false, stripe_subscription_id: subscriptionId || null },
        ], { onConflict: 'user_id' });
      }
    } catch (err) {
      console.error('Error handling cancellation event:', err);
    }
  }

  return NextResponse.json({ received: true });
}
