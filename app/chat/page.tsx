import ChatBubble from '@/components/ChatBubble'
import ChatInput from '@/components/ChatInput'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function ChatPage() {
  return (
    // <ProtectedRoute>
      <main className="min-h-screen bg-white flex items-start justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="space-y-4">
            <div className="rounded-2xl p-6 shadow-sm">
              <div id="messages" className="space-y-3">
                <ChatBubble role="assistant" text="Hello! How can I assist you today?" />
                <ChatBubble role="user" text="Hi! Can you tell me a joke?" />
                <ChatBubble role="assistant" text="Sure! Why did the scarecrow win an award? Because he was outstanding in his field!" />
              </div>
            </div>
            <ChatInput />
          </div>
        </div>
      </main>
    // </ProtectedRoute>
  )
}