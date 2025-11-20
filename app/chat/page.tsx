"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatBubble from "@/components/ChatBubble";
import ChatInput from "@/components/ChatInput";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingDots from "@/components/LoadingDots";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; text: string }>
  >([{ role: "assistant", text: "Hello! How can I assist you today?" }]);
  const [loading, setLoading] = useState(false);

  const isEmpty =
    messages.length === 0 ||
    (messages.length === 1 &&
      messages[0].role === "assistant" &&
      messages[0].text === "");

  useEffect(() => {
    // placeholder: could load persisted conversation here
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  const onSend = async (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("No user in onSend:", userError);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Session expired. Please sign in again.",
          },
        ]);
        setLoading(false);
        router.replace("/signin");
        return;
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, message: text }),
      });

      if (!res.ok) {
        console.error("Chat API error:", await res.text());
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Sorry, something went wrong talking to the agent.",
          },
        ]);
        return;
      }

      const data = await res.json();
      const assistant = data.assistant || "Sorry, something went wrong.";
      setMessages((prev) => [...prev, { role: "assistant", text: assistant }]);
    } catch (err) {
      console.error("Chat send error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Error: failed to get response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="h-screen overflow-hidden bg-background relative">
        <div className="flex justify-between items-center sticky top-0  mx-auto border-b p-3 shadow-sm [box-shadow:inset_2px_3px_20px_2px_#0000001a]">
          <h1 className="text-2xl font-bold">VXOAI Chat</h1>
          <Button
            variant={"destructive"}
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white border border-red-600 hover:bg-red-100 text-red-700 px-3 py-2 rounded-full"
          >
            Logout <LogOut />
          </Button>
        </div>
        <div className="pt-6 h-[calc(100vh-65px)] overflow-auto relative">
          <div className="w-full max-w-3xl mx-auto flex flex-col justify-between">
            <div className="space-y-4 bg-white mb-2 rounded-2xl shadow-md mx-[2px] overflow-hidden">
              <div className="p-6">
                <div id="messages" className="space-y-3">
                  {messages.map((m, i) => (
                    <ChatBubble key={i} role={m.role as any} text={m.text} />
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-textDark max-w-[85%] p-3 rounded-2xl">
                        <LoadingDots />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <ChatInput centered={isEmpty} onSend={onSend} />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
