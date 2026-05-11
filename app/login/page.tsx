"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Link from "next/link";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      toast.error("Failed to login with Google");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight relative flex items-center justify-center p-6">
      {/* Newspaper Background Overlay */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.08] grayscale blur-[2px]"
        style={{ 
          backgroundImage: 'url("/images/newspaper-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content (Desktop only) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="hidden lg:block space-y-8"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-6xl font-extrabold text-accent-amber tracking-tight">RAJNEET</h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-white"
            >
              Your Voice. Your Democracy.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">🗞️</span>
                <p className="text-white/80">Real political news updated every 30 minutes</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚖️</span>
                <p className="text-white/80">Debate and share your stance on every issue</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🏛️</span>
                <p className="text-white/80">Track Parliament, bills, and your local MP</p>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-white/60 italic"
            >
              Protected under Article 19(1)(a) of the Indian Constitution
            </motion.p>
          </motion.div>

          {/* Vertical Divider (Desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

          {/* Right Side - Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md mx-auto lg:mx-0"
          >
            <div 
              className="p-12 rounded-2xl relative overflow-hidden"
              style={{
                backgroundColor: 'rgba(13, 27, 62, 0.85)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}
            >
              {/* Parliament Icon */}
              <div className="flex justify-center mb-6">
                <span className="text-5xl">🏛️</span>
              </div>

              {/* Heading */}
              <h2 className="text-2xl font-bold text-white text-center mb-2">
                Sign in to RAJNEET
              </h2>
              <p className="text-sm text-white/60 text-center mb-6">
                Join thousands of Indians debating real politics
              </p>

              {/* Divider */}
              <div className="h-px bg-white/10 mb-6" />

              {/* Google Login Button */}
              <motion.button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-[52px] bg-white rounded-[10px] flex items-center justify-center gap-3 text-gray-900 font-medium hover:shadow-lg hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 relative overflow-hidden"
                animate={{
                  boxShadow: isLoading ? 'none' : [
                    '0 0 0 0 rgba(59, 130, 246, 0)',
                    '0 0 0 2px rgba(59, 130, 246, 0.1)',
                    '0 0 0 0 rgba(59, 130, 246, 0)',
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 0,
                }}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin h-5 w-5 border-2 border-gray-900 border-t-transparent rounded-full" />
                    <span className="text-gray-900">Redirecting to Google...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    <span>Continue with Google</span>
                  </>
                )}
              </motion.button>

              {/* Free forever text */}
              <p className="text-xs text-white/50 text-center mt-4">
                Free forever. No credit card required.
              </p>

              {/* Terms and Privacy */}
              <p className="text-xs text-white/40 text-center mt-6">
                By continuing you agree to our{' '}
                <Link href="/terms" className="text-accent-blue hover:underline">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-accent-blue hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
