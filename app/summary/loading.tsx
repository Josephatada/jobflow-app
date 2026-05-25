export default function SummaryLoading() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 h-[52px] border-b border-[#2d2b27] bg-[#1c1b19] shrink-0">
        <div className="h-3.5 w-16 bg-[#252320] rounded animate-pulse" />
      </div>
      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-3 pb-24 sm:pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#1c1b19] border border-[#2d2b27] rounded-xl p-4 flex items-center gap-3 animate-pulse"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="w-8 h-8 rounded-lg bg-[#252320] shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-3 w-32 bg-[#252320] rounded" />
              <div className="h-2.5 w-20 bg-[#252320] rounded" />
            </div>
            <div className="h-5 w-16 bg-[#252320] rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
