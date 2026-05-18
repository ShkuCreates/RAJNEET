export default function DebatesLoading() {
  return (
    <div className="min-h-screen bg-[#050A14]">
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-white/10 rounded-xl"></div>
          <div className="space-y-6">
            {[1,2,3].map(i => (
              <div key={i} className="bg-[#111827] rounded-2xl p-6">
                <div className="h-8 bg-white/10 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-white/5 rounded w-full mb-2"></div>
                <div className="h-4 bg-white/5 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
