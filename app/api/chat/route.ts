import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import openai from '@/lib/openai'
import { ragRetrieve } from '@/server/rag'

export async function POST(req: Request) {
  const body = await req.json()
  const { userId, message } = body

  // 1. Retrieve RAG documents
  const docs = await ragRetrieve(message)

  // 2. Load recent messages + summary from Supabase (deterministic trim)
  const { data: conv } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .single()

  // create messages to send
  const messages = [
    { role: 'system', content: 'You are a concise quoting assistant...' },
    // add KB excerpts
    ...docs.map(d => ({ role: 'system', content: d.text })),
    // add last N messages
  ]

  // 3. call OpenAI chat completions
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: messages.concat([{ role: 'user', content: message }]),
    max_tokens: 800
  })

  const assistantText = completion.choices[0].message.content

  // 4. persist message back to Supabase
  await supabase.from('messages').insert({ user_id: userId, role: 'user', content: message })
  await supabase.from('messages').insert({ user_id: userId, role: 'assistant', content: assistantText })

  return NextResponse.json({ assistant: assistantText })
}