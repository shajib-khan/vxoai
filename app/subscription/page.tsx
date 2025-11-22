"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import LoadingDots from "@/components/LoadingDots";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const router = useRouter();
  const params = useSearchParams();

  // Treat these statuses as "allowed into app"
  const isActiveStatus = (status: string | null | undefined) =>
    status === "active" || status === "trial" || status === "past_due";

  // 1) Initial subscription check
  useEffect(() => {
    const checkSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/signin");
        return;
      }

      const { data, error } = await supabase
        .from("entitlements")
        .select("status")
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setIsSubscribed(false);
      } else {
        setIsSubscribed(isActiveStatus(data.status));
      }

      setLoading(false);
    };

    checkSubscription();
  }, [router]);

  // 2) Poll after returning from Stripe (?success=1)
  useEffect(() => {
    const success = params?.get("success") === "1";
    if (!success) return;

    let cancelled = false;

    const poll = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/signin");
        return;
      }

      const start = Date.now();
      const timeout = 60_000; // 60s

      while (!cancelled && Date.now() - start < timeout) {
        const { data, error } = await supabase
          .from("entitlements")
          .select("status")
          .eq("user_id", user.id)
          .single();

        if (!error && data && isActiveStatus(data.status)) {
          router.replace("/chat");
          return;
        }

        await new Promise((r) => setTimeout(r, 2000));
      }

      if (!cancelled) {
        alert(
          "Subscription not activated yet. It may take a few seconds. Please refresh shortly."
        );
      }
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [params, router]);

  useEffect(() => {
    if (!loading && isSubscribed) {
      router.replace("/chat");
    }
  }, [loading, isSubscribed, router]);

  if (loading) {
    return (
      <div className="text-center bg-background p-8 w-full h-screen flex items-center justify-center">
        <p className="text-xl">Checking subscription...</p>
        <div className="ml-4">
          <LoadingDots />
        </div>
      </div>
    );
  }

  const handleStartSubscription = async () => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        router.replace("/signin");
        return;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Checkout session creation failed", txt);
        setLoading(false);
        return;
      }

      const json = await res.json();
      const url = json?.url;

      if (!url) {
        console.error("No checkout URL returned", json);
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error("Error creating checkout session", err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center bg-background p-8 w-full h-screen flex items-center justify-center">
        <p className="text-xl">Checking subscription...</p>
        <div className="ml-4">
          <LoadingDots />
        </div>
      </div>
    );
  }

  if (!loading && isSubscribed) {
    return null;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-lg p-12 rounded-2xl shadow-lg bg-white text-center">
        <div className="flex items-center justify-center bg-primary/10 w-20 h-20 rounded-full mx-auto mb-4">
          <LockKeyhole className="mx-auto text-primary" size={40} />
        </div>
        <h1 className="text-2xl font-bold mb-4">Subscription Required</h1>
        <p className="mb-6 text-gray-600">
          To unlock the full power of VXOAI, please start your subscription.
        </p>
        <Button
          className="w-full p-7 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700"
          onClick={handleStartSubscription}
        >
          Start Subscription
        </Button>
      </div>
    </main>
  );
}
