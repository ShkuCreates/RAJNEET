import { Suspense } from "react";
import HomeClient from "@/components/HomeClient";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <Loader2 size={18} className="animate-spin" />
          Loading latest news...
        </div>
      </div>
    }>
      <HomeClient />
    </Suspense>
  );
}
