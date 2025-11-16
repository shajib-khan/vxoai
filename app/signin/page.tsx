"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function SignInPage() {
	const router = useRouter();

	useEffect(() => {
		const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
			if (session) {
				router.replace("/chat");
			}
		});
		return () => {
			listener.subscription.unsubscribe();
		};
	}, [router]);

	return (
		<main className="min-h-screen flex items-center justify-center bg-white">
			<div className="w-full max-w-md rounded-2xl shadow-md bg-white p-6" >
				<h1 className="text-2xl font-bold mb-4 text-center text-textDark">Welcome to VXOAI</h1>
				<h1 className="text-2xl font-bold mb-4 text-center">Sign In</h1>
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
