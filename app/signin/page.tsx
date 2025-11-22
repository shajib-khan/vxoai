"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function SignInPage() {
  const router = useRouter();

  // Create browser Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Redirect if already signed in
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/subscription"); 
      }
    };

    checkSession();

    // Listen for login/logout events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace("/subscription");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-2xl shadow-lg bg-white p-8">
        <h1 className="text-2xl font-bold mb-4 text-center">Welcome to VXOAI</h1>

        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          providers={[]}
        />
      </div>
    </main>
  );
}
