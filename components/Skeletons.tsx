import React from "react";

export function NewsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Main + Side Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-[#111827] border border-white/5 rounded-[32px] overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-5">
              <div className="lg:col-span-3 aspect-[16/9] bg-white/5 animate-pulse" />
              <div className="lg:col-span-2 p-6 lg:p-8 space-y-4">
                <div className="h-3 bg-white/5 rounded w-1/2 animate-pulse" />
                <div className="h-8 bg-white/5 rounded w-full animate-pulse" />
                <div className="h-4 bg-white/5 rounded w-full animate-pulse" />
                <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse" />
                <div className="h-10 bg-white/5 rounded w-40 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="h-6 bg-white/5 rounded w-1/2 animate-pulse" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 bg-[#111827] border border-white/5 rounded-2xl p-3">
              <div className="h-20 w-28 bg-white/5 rounded-xl animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/5 rounded w-1/3 animate-pulse" />
                <div className="h-4 bg-white/5 rounded w-full animate-pulse" />
                <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Remaining News Skeleton */}
      <div className="space-y-6">
        <div className="h-6 bg-white/5 rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-[#111827] border border-white/5 rounded-[32px] overflow-hidden">
              <div className="aspect-[16/9] bg-white/5 animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-3 bg-white/5 rounded w-1/3 animate-pulse" />
                <div className="h-5 bg-white/5 rounded w-full animate-pulse" />
                <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse" />
                <div className="h-3 bg-white/5 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-[#111827] border border-white/5 rounded-[32px] overflow-hidden">
          <div className="aspect-[16/9] bg-white/5 animate-pulse" />
          <div className="p-6 space-y-3">
            <div className="flex gap-2">
              <div className="h-4 bg-white/5 rounded-full w-16 animate-pulse" />
              <div className="h-4 bg-white/5 rounded-full w-12 animate-pulse" />
            </div>
            <div className="h-5 bg-white/5 rounded w-full animate-pulse" />
            <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse" />
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <div className="flex gap-4">
                <div className="h-3 bg-white/5 rounded w-16 animate-pulse" />
                <div className="h-3 bg-white/5 rounded w-12 animate-pulse" />
              </div>
              <div className="h-3 bg-white/5 rounded w-10 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
