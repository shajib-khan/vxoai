import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import openai from '@/lib/openai'
import { ragRetrieve } from '@/server/rag'

export async function POST(req: Request) {
  const body = await req.json()
  const { userId, message } = body

  if (!userId || !message) {
    return NextResponse.json({ error: 'Missing userId or message' }, { status: 400 })
  }

  try {
    // 1. Retrieve RAG documents
    const docs = await ragRetrieve(message)

    // 2. Load recent messages from Supabase
    const { data: messages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(10)

    // 3. Build messages for OpenAI
    const conversationMessages = [
      { role: 'system' as const, content: 'You are a helpful AI assistant. Be concise and helpful.' },
      // Add KB excerpts as context
      ...docs.map(d => ({ role: 'system' as const, content: `Knowledge Base: ${d.text}` })),
      // Add recent conversation
      ...(messages || []).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      // Add current user message
      { role: 'user' as const, content: message },
    ]

    // 4. Call OpenAI chat completions
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14", 
      messages: conversationMessages,
      max_tokens: 800,
    })

    const assistantText = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    // 5. Persist messages to Supabase
    await supabase.from('messages').insert({
      user_id: userId,
      role: 'user',
      content: message,
    })
    await supabase.from('messages').insert({
      user_id: userId,
      role: 'assistant',
      content: assistantText,
    })

    return NextResponse.json({ assistant: assistantText })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: 'Failed to process chat', detail: String(err) }, { status: 500 })
  }
}