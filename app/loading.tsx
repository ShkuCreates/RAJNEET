export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#050A14] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-white/20 border-t-accent-blue"></div>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}
