export default function NewsLoading() {
  return (
    <div className="min-h-screen bg-[#050A14]">
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-white/10 rounded-xl w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-[#111827] rounded-2xl overflow-hidden">
                <div className="h-48 bg-white/5"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-white/10 rounded w-3/4"></div>
                  <div className="h-4 bg-white/5 rounded w-full"></div>
                  <div className="h-4 bg-white/5 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
