import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";
import openai from "@/lib/openai";
import { ragRetrieve } from "@/server/rag";

type MessageRow = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    //  Get Supabase client (not async!)
    const supabase = createSupabaseServer();

    //Parse request body
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    // Get user session automatically from cookies
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Retrieve RAG docs
    const docs = await ragRetrieve(message);

    //  Fetch recent messages (typed)
    const { data: messages, error: messagesError } = await supabase
      .from<MessageRow>("messages")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(10);

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
    }

    //  Build conversation
    const conversationMessages = [
      { role: "system", content: "You are a helpful AI assistant." },
      ...docs.map((d) => ({ role: "system", content: `KB: ${d.text}` })),
      ...(messages || []).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    //  Call OpenAI (standard completion)
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14",
      messages: conversationMessages,
    });

    const assistantText =
      completion.choices[0]?.message?.content ??
      "Sorry, I couldn't generate a response.";

    //  Store conversation in Supabase
    await supabase.from("messages").insert([
      { user_id: user.id, role: "user", content: message },
      { user_id: user.id, role: "assistant", content: assistantText },
    ]);

    //  Return assistant response
    return NextResponse.json({ assistant: assistantText });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Server error", detail: `${err}` });
  }
}
