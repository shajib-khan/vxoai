import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "VXOAI Chat",
  description: "VXOAI Chat Application using Supabase and Stripe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        {children}
      </body>
    </html>
  );
}
