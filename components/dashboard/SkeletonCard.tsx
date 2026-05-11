export function SkeletonCard() {
  return (
    <div className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden shadow-sm animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-video bg-white/[0.03] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full animate-shimmer" />
      </div>
      
      <div className="p-5 space-y-4">
        {/* Category Badge Skeleton */}
        <div className="w-20 h-4 bg-white/[0.05] rounded-md" />
        
        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="w-full h-6 bg-white/[0.08] rounded-md" />
          <div className="w-3/4 h-6 bg-white/[0.08] rounded-md" />
        </div>
        
        {/* Meta Skeleton */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/[0.05]" />
          <div className="w-24 h-3 bg-white/[0.05] rounded-md" />
        </div>
        
        {/* Stance Bar Skeleton */}
        <div className="pt-4 border-t border-white/5 flex gap-2">
          <div className="flex-1 h-8 bg-white/[0.03] rounded-lg" />
          <div className="flex-1 h-8 bg-white/[0.03] rounded-lg" />
          <div className="flex-1 h-8 bg-white/[0.03] rounded-lg" />
        </div>
      </div>
    </div>
  );
}
