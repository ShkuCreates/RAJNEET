import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monetization Program - RAJNEET",
  description: "Earn from your articles on RAJNEET through our revenue share program",
};

export default function MonetizationPage() {
  return (
    <div className="min-h-screen bg-[#050A14] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Monetization Program</h1>
          <p className="text-gray-400 text-lg">Earn from your articles on RAJNEET</p>
        </div>

        <div className="space-y-8">
          {/* Requirements */}
          <div className="p-8 bg-white/[0.03] border border-white/10 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Requirements</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-sm font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <span className="text-gray-300">Articles must have 1000+ views to qualify</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-sm font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <span className="text-gray-300">Original content only - no plagiarism</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-sm font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <span className="text-gray-300">Verified user account</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-sm font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <span className="text-gray-300">Minimum 800 words per article</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-sm font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <span className="text-gray-300">Article must be approved by admin</span>
              </li>
            </ul>
          </div>

          {/* Revenue Source */}
          <div className="p-8 bg-white/[0.03] border border-white/10 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Revenue Source</h2>
            <p className="text-gray-300 mb-4">
              Revenue comes from platform ad revenue and sponsorships. Qualified writers receive a percentage of the revenue generated from their articles.
            </p>
            <p className="text-gray-300">
              Payments are made monthly via UPI directly to your registered UPI ID.
            </p>
          </div>

          {/* Application Form */}
          <div className="p-8 bg-white/[0.03] border border-white/10 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Apply to Join</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">UPI ID</label>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Number of Published Articles</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-accent-blue hover:bg-accent-blue/90 text-white font-semibold rounded-xl transition-colors"
              >
                Submit Application
              </button>
            </form>
          </div>

          {/* FAQ */}
          <div className="p-8 bg-white/[0.03] border border-white/10 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">How do I track my earnings?</h3>
                <p className="text-gray-400">
                  Visit your Writer Dashboard at /my-articles to view your article performance, view counts, and estimated earnings.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">When do I get paid?</h3>
                <p className="text-gray-400">
                  Payments are processed monthly. You'll receive your earnings directly to your UPI ID.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Can I accept tips from readers?</h3>
                <p className="text-gray-400">
                  Yes! Add your UPI ID in your profile settings to enable the "Support this writer" button on your articles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
