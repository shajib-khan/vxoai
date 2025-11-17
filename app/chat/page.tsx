import ChatBubble from '@/components/ChatBubble'
import ChatInput from '@/components/ChatInput'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function ChatPage() {
  // messages would normally be loaded from Supabase; for layout demo we keep a local array
  const messages = [
    { role: 'assistant', text: 'Hello! How can I assist you today?' },
    { role: 'user', text: 'Hi! Can you tell me a joke?' },
    { role: 'assistant', text: 'Sure! Why did the scarecrow win an award? Because he was outstanding in his field!' },
  ];

  const isEmpty = messages.length === 0;

  return (
    // <ProtectedRoute>
      <main className="min-h-screen bg-white flex items-start justify-center p-6 relative">
        <div className="w-full max-w-2xl">
          <div className="space-y-4">
            <div className="rounded-2xl p-6 shadow-sm">
              <div id="messages" className="space-y-3">
                {messages.map((m, i) => (
                  <ChatBubble key={i} role={m.role as any} text={m.text} />
                ))}
              </div>
            </div>
            <ChatInput centered={isEmpty} />
          </div>
        </div>
      </main>
    // </ProtectedRoute>
  )
}