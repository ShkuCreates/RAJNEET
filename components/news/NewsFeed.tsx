"use client";

import NewsCard from "./NewsCard";

export default function NewsFeed({ initialNews, currentUser }: { initialNews: any[], currentUser: any }) {
  if (initialNews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-border border-dashed rounded-lg bg-card text-muted-foreground mt-4">
        <p className="mb-2">No news found for this filter.</p>
        <p className="text-sm">Be the first to know when something happens in your area.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {initialNews.map((news) => (
        <NewsCard key={news.id} news={news} currentUser={currentUser} />
      ))}
    </div>
  );
}
