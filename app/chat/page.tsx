"use client";

import ChatBubble from "@/components/ChatBubble";
import ChatInput from "@/components/ChatInput";
import LoadingDots from "@/components/LoadingDots";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ChatPage() {
  const router = useRouter();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; text: string }>
  >([]);
  const [loadingMessages, setLoadingMessages] = useState(true); 
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom whenever messages change
  useEffect(() => {
  if (scrollRef.current) {
    setTimeout(() => {
      scrollRef.current!.scrollTo({
        top: scrollRef.current!.scrollHeight,
        behavior: "smooth",
      });
    }, 0);
  }
}, [messages,loading]);


  // Load or create messages
  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/signin");
        return;
      }

      // 1) check if conversation exists
      const { data: conv } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let convId = conv?.id;

      // 2) create if not found
      if (!convId) {
        const { data: newConv, error: newErr } = await supabase
          .from("conversations")
          .insert({
            user_id: user.id,
            title: "Chat",
            status: "active",
          })
          .select("*")
          .single();

        if (newErr) {
          console.error("Conversation create error:", newErr);
          return;
        }

        convId = newConv.id;
      }

      setConversationId(convId);

      // 3) load messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (msgs?.length) {
        setMessages(msgs.map((m) => ({ role: m.role, text: m.content })));
      } else {
        // first-time message
        setMessages([
          { role: "assistant", text: "Hello! How can I assist you today?" },
        ]);
      }

      setLoadingMessages(false); // <-- finished loading
    };

    init();
  }, []);

  const onSend = async (text: string) => {
    if (!conversationId) return;
    if (!text.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/signin");
      return;
    }

    // Add user message to UI
    setMessages((p) => [...p, { role: "user", text }]);

    // Store user message in DB
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: text,
    });

    setLoading(true);

    // Call your chat API
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        message: text,
      }),
    });

    const data = await res.json();
    const assistant = data.assistant || "Something went wrong.";

    // Show assistant reply
    setMessages((p) => [...p, { role: "assistant", text: assistant }]);

    // Save assistant reply in DB
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: assistant,
    });

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  if (loadingMessages) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="text-center">
          <LoadingDots />
          <p className="mt-4 text-gray-600">Loading your chat...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <main className="h-screen overflow-hidden bg-background relative">
        <div className="flex justify-between items-center sticky top-0 mx-auto border-b p-3 shadow-sm">
          <h1 className="text-2xl font-bold">VXOAI Chat</h1>
          <Button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-transparent border border-red-600 hover:bg-red-100 text-red-700 px-3 py-2 rounded-full"
          >
            Logout <LogOut />
          </Button>
        </div>

        <div className="pt-6 h-[calc(100vh-65px)] overflow-y-auto"  ref={scrollRef}>
          <div className="w-full max-w-3xl mx-auto flex flex-col justify-between" >
            <div
              
              className="space-y-4 bg-white mb-2 border border-[#eeeeee] rounded-2xl chat-expand shadow-[0px_1px_9px_#dbdbdb54] mx-0.5 transition-all duration-200 ease-in-out overflow-hidden"
            >
              <div className="p-6" >
                <div id="messages" className="space-y-6" >
                  {messages.map((m, i) => (
                    <ChatBubble key={i} role={m.role} text={m.text} />
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 max-w-[85%] p-3 rounded-2xl rounded-bl-none">
                        <LoadingDots />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <ChatInput onSend={onSend} />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
