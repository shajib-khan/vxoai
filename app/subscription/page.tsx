"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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

  const handleStartSubscription = async () => {
    setLoading(true);
    // Call API to create Stripe Checkout session
    const res = await fetch("/api/stripe/checkout", { method: "POST" });
    const { url } = await res.json();
    window.location.href = url;
  };

  if (loading) return <div className="text-center p-8">Checking subscription...</div>;

  if (isSubscribed) {
    router.replace("/chat");
    return null;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-6 rounded-2xl shadow-md bg-white text-center">
        <h1 className="text-2xl font-bold mb-4">Subscription Required</h1>
        <p className="mb-6">To use the AI assistant, please start a subscription.</p>
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700"
          onClick={handleStartSubscription}
        >
          Start Subscription
        </button>
      </div>
    </main>
  );
}
