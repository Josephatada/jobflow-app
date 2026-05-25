export default function SettingsLoading() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 h-[52px] border-b border-[#2d2b27] bg-[#1c1b19] shrink-0">
        <div className="h-3.5 w-16 bg-[#252320] rounded animate-pulse" />
      </div>
      <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 space-y-3 pb-24 sm:pb-4 max-w-xl">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-[#1c1b19] border border-[#2d2b27] rounded-xl p-5 animate-pulse"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="h-3 w-28 bg-[#252320] rounded mb-2" />
            <div className="h-2.5 w-48 bg-[#252320] rounded mb-4" />
            <div className="h-9 w-full bg-[#252320] rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
