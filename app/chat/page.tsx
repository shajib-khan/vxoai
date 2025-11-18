'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ChatBubble from '@/components/ChatBubble'
import ChatInput from '@/components/ChatInput'
import ProtectedRoute from '@/components/ProtectedRoute'
import LoadingDots from '@/components/LoadingDots'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Hello! How can I assist you today?' },
  ])
  const [loading, setLoading] = useState(false)

  const isEmpty = messages.length === 0 || (messages.length === 1 && messages[0].role === 'assistant' && messages[0].text === '')

  useEffect(() => {
    // placeholder: could load persisted conversation here
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/signin')
  }

  const onSend = async (text: string) => {
    // append user message immediately
    setMessages(prev => [...prev, { role: 'user', text }])
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, message: text }),
      })
      const data = await res.json()
      const assistant = data.assistant || 'Sorry, something went wrong.'
      setMessages(prev => [...prev, { role: 'assistant', text: assistant }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error: failed to get response.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-white  p-6 relative">
       <div className="flex justify-between items-center mb-4 mx-auto">
            <h1 className="text-2xl font-bold">VXOAI Chat</h1>
            <Button variant={'destructive'} 
              onClick={handleLogout}

              className="flex items-center gap-2 bg-white border border-red-600 hover:bg-red-100 text-red-700 px-3 py-2 rounded-full"
            >
              Logout <LogOut/>
            </Button>
          </div> 
          <div className="w-full max-w-2xl mx-auto">
          

          <div className="space-y-4">
            <div className="rounded-2xl p-6 shadow-sm">
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

            <ChatInput centered={isEmpty} onSend={onSend} />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}