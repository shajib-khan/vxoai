// /app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import cookie from "cookie";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return NextResponse.json({ error: error?.message || "Login failed" }, { status: 401 });
  }

  const { access_token, refresh_token, expires_at } = data.session;

  const maxAge = expires_at
  ? expires_at - Math.floor(Date.now() / 1000)
  : 3600; // default 1 hour

const isProd = process.env.NEXT_PUBLIC_PROD === "true";

  // Set HttpOnly cookies
  const response = NextResponse.json({ message: "Logged in" });
  response.headers.append(
    "Set-Cookie",
    cookie.serialize("sb-access-token", access_token, {
      httpOnly: true,
      secure: isProd,
      maxAge: maxAge,
      path: "/",
      sameSite: "lax",
    })
  );
  response.headers.append(
    "Set-Cookie",
    cookie.serialize("sb-refresh-token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      sameSite: "lax",
    })
  );

  return response;
}
