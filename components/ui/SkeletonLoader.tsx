export default function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-4">
      {/* News Card Skeleton */}
      <div className="rounded-[28px] border border-white/5 bg-[#111827] shadow-2xl">
        <div className="aspect-video bg-gray-700 animate-pulse" />
        <div className="p-6 space-y-3">
          <div className="h-4 bg-gray-600 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-600 rounded animate-pulse w-1/2" />
          <div className="h-4 bg-gray-600 rounded animate-pulse w-2/3" />
        </div>
      </div>
    </div>
  );
}
