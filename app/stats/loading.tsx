export default function StatsLoading() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 h-[52px] border-b border-[#2d2b27] bg-[#1c1b19] shrink-0">
        <div className="h-3.5 w-10 bg-[#252320] rounded animate-pulse" />
      </div>
      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-4 pb-24 sm:pb-4">
        {/* Date range pill */}
        <div className="h-8 w-56 bg-[#252320] rounded-lg animate-pulse" />
        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#1c1b19] border border-[#2d2b27] rounded-xl p-5 animate-pulse" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="h-2.5 w-24 bg-[#252320] rounded mb-3" />
              <div className="h-7 w-12 bg-[#252320] rounded" />
            </div>
          ))}
        </div>
        {/* Chart cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#1c1b19] border border-[#2d2b27] rounded-xl p-5 h-[280px] animate-pulse" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="h-3 w-32 bg-[#252320] rounded mb-4" />
              <div className="h-full bg-[#252320]/40 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
