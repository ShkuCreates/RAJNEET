import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6">
      <div className="max-w-3xl space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
          <span className="text-primary">RAJNEET</span>
        </h1>
        <p className="text-2xl font-medium text-secondary-foreground bg-secondary inline-block px-4 py-1 rounded">
          Your Voice. Your Democracy.
        </p>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Protected under Article 19(1)(a) of the Indian Constitution. A serious civic tool to shape public opinion, track bills, and debate issues that matter.
        </p>
        <div className="pt-8">
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Enter RAJNEET
          </Link>
        </div>
      </div>
    </div>
  );
}
