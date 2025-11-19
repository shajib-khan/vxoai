export default function ChatBubble({ role, text }: { role: 'user'|'assistant'; text: string }) {
  const isUser = role === 'user'

  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          `
          ${isUser ? "bg-primary text-white" : "bg-gray-100 text-text-dark"}
          max-w-[85%] p-3 rounded-2xl
          ${isUser ? "rounded-br-none" : "rounded-bl-none"}
          `
        }
      >
        <div className="whitespace-pre-wrap">{text}</div>
      </div>
    </div>
  )
}
