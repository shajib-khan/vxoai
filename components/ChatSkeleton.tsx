function ChatSkeleton() {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 max-w-[85%] p-3 rounded-2xl">
        <div className="h-4 w-32 bg-gray-300 rounded mb-2 animate-pulse"></div>
        <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

export default ChatSkeleton