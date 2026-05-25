export default function BoardLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-[52px] border-b border-[#2d2b27] bg-[#1c1b19] shrink-0">
        <div className="h-3.5 w-12 bg-[#252320] rounded animate-pulse" />
        <div className="h-7 w-28 bg-[#252320] rounded-full animate-pulse" />
      </div>
      {/* Filter bar */}
      <div className="h-[40px] border-b border-[#2d2b27] bg-[#161614] shrink-0 px-5 flex items-center gap-2">
        <div className="h-6 w-48 bg-[#252320] rounded animate-pulse" />
      </div>
      {/* Columns */}
      <div className="flex gap-4 px-6 pt-5 pb-6 flex-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-[260px] shrink-0 flex flex-col gap-2">
            <div className="h-4 w-20 bg-[#252320] rounded animate-pulse mb-1" />
            <div className="bg-[#181716]/60 ring-1 ring-white/[0.04] rounded-[14px] p-2 flex flex-col gap-2 flex-1">
              {Array.from({ length: i === 0 ? 3 : i === 1 ? 2 : 1 }).map((_, j) => (
                <div key={j} className="bg-[#252320] rounded-[14px] h-[108px] animate-pulse" style={{ animationDelay: `${(i * 3 + j) * 60}ms` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
