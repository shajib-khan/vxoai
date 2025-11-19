"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import LoadingDots from '@/components/LoadingDots'
import { Lock, LockKeyhole } from "lucide-react";

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/signin");
        return;
      }
      // Check subscription status in Supabase (assume 'subscriptions' table with 'user_id' and 'active')
      const { data, error } = await supabase
        .from("subscriptions")
        .select("active")
        .eq("user_id", user.id)
        .single();
      if (error || !data) {
        setIsSubscribed(false);
      } else {
        setIsSubscribed(!!data.active);
      }
      setLoading(false);
    };
    checkSubscription();
  }, [router]);

  // If user just returned from checkout, poll until subscription is active
  const params = useSearchParams();
  useEffect(() => {
    const success = params?.get('success') === '1';
    if (!success) return;

    let cancelled = false;
    const poll = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/signin');
        return;
      }

      const start = Date.now();
      const timeout = 60_000; // 60s
      while (!cancelled && Date.now() - start < timeout) {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('active')
          .eq('user_id', user.id)
          .single();
        if (!error && data && data.active) {
          router.replace('/chat');
          return;
        }
        await new Promise(r => setTimeout(r, 2000));
      }
      if (!cancelled) {
        alert('Subscription not activated yet. It may take a few seconds. Please refresh shortly.');
      }
    };
    poll();
    return () => { cancelled = true };
  }, [params, router]);

  const handleStartSubscription = async () => {
    setLoading(true);
    // Call API to create Stripe Checkout session
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        router.replace('/signin');
        return;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      if (!res.ok) {
        const txt = await res.text();
        console.error('Checkout session creation failed', txt);
        setLoading(false);
        return;
      }
      const json = await res.json();
      const url = json?.url;
      if (!url) {
        console.error('No checkout URL returned', json);
        setLoading(false);
        return;
      }
      // redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error('Error creating checkout session', err);
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center bg-primary/5 p-8 w-full h-screen flex items-center justify-center">
    <p className="text-xl">Checking subscription...</p>
    <div className="ml-4"><LoadingDots /></div>
    </div>;

  if (isSubscribed) {
    router.replace("/chat");
    return null;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-primary/5">
      <div className="w-full max-w-lg p-12 rounded-2xl shadow-lg bg-white text-center">
        <div className="flex items-center justify-center bg-primary/10 w-20 h-20 rounded-full mx-auto mb-4">
          <LockKeyhole className="mx-auto text-primary" size={40} />
        </div>
        <h1 className="text-2xl font-bold mb-4">Subscription Required</h1>
        <p className="mb-6 text-gray-600">To unlock the full power of VXOAI, Please start your subscription.</p>
        <button
          className=" w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          onClick={handleStartSubscription}
        >
          Start Subscription
        </button>
      </div>
    </main>
  );
}
