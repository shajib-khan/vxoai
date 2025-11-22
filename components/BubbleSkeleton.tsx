function BubbleSkeleton({ isUser }: { isUser: boolean }) {
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={`max-w-[85%] p-3 rounded-2xl bg-gray-100 animate-pulse`}
      >
        <div className="h-3 w-28 bg-gray-300 rounded mb-2"></div>
        <div className="h-3 w-20 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
}

export default BubbleSkeleton