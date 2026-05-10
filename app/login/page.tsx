"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function LoginPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Canvas particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{ x: number; y: number; radius: number; speedY: number; speedX: number; opacity: number }> = [];

    // Create 80 particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 0.4 + Math.random() * 1.8,
        speedY: 0.3 + Math.random() * 0.7,
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: 0.2 + Math.random() * 0.2,
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw radial glow
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.5
      );
      gradient.addColorStop(0, "rgba(212, 175, 55, 0.06)");
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      particles.forEach((particle) => {
        particle.y -= particle.speedY;
        particle.x += particle.speedX;

        // Reset particle when it goes off screen
        if (particle.y < -10) {
          particle.y = canvas.height + 10;
          particle.x = Math.random() * canvas.width;
        }
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${particle.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: "#0a0a0a" }}>
      {/* Canvas Particle Field */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Top Badge */}
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-6 left-1/2 transform -translate-x-1/2 z-20"
      >
        <div className="px-4 py-2 rounded-full flex items-center gap-2" style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.25)" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#D4AF37", animation: "pulse 2s ease-in-out infinite" }} />
          <span className="text-xs font-medium tracking-wide" style={{ color: "#D4AF37" }}>
            ⚡ India&apos;s First Political Social MMO
          </span>
        </div>
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-10 w-full max-w-[420px] px-4"
      >
        <div
          className="relative p-10 pb-8"
          style={{
            background: "rgba(16,14,10,0.95)",
            border: "1px solid rgba(212,175,55,0.2)",
            borderRadius: "20px",
            boxShadow: "0 0 60px rgba(212,175,55,0.07), 0 0 120px rgba(0,0,0,0.8)",
            borderTop: "1px solid rgba(212,175,55,0.3)",
          }}
        >
          {/* Inner top highlight */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ boxShadow: "inset 0 1px 0 rgba(212,175,55,0.12)" }} />

          {/* Top glow line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[60%] h-[1px]"
            style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)" }}
          />

          {/* RAJNEET Logo Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center mb-2"
          >
            <Image
              src="/images/rajneet-logo.png"
              alt="RAJNEET"
              width={110}
              height={110}
              priority
              className="logo-float"
              style={{
                filter: "drop-shadow(0 0 18px rgba(212,175,55,0.35))",
              }}
            />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="text-center mb-7 font-inter text-[12px] italic tracking-[0.2em] uppercase"
            style={{ color: "#6B5E2A" }}
          >
            Where Influence is Power
          </motion.p>

          {/* Gold Diamond Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center gap-3 mb-7"
          >
            <div className="flex-1 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)" }} />
            <div className="w-[6px] h-[6px] transform rotate-45" style={{ background: "#D4AF37", opacity: 0.6 }} />
            <div className="flex-1 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)" }} />
          </motion.div>

          {/* Google Button */}
          <motion.button
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
            className="w-full relative overflow-hidden rounded-xl px-4 py-3 mb-3 flex items-center justify-center gap-3 transition-all duration-200"
            style={{
              background: "#0d0d0d",
              border: "1px solid rgba(212,175,55,0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(212,175,55,0.08)";
              e.currentTarget.style.borderColor = "rgba(212,175,55,0.6)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(212,175,55,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#0d0d0d";
              e.currentTarget.style.borderColor = "rgba(212,175,55,0.3)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Google Logo SVG */}
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.252-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.715H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.159 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
            <span className="text-sm font-medium" style={{ color: "#E8D27A" }}>Continue with Google</span>
          </motion.button>

          {/* OR Separator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="flex items-center gap-3 mb-3"
          >
            <div className="flex-1 h-[1px]" style={{ background: "rgba(212,175,55,0.1)" }} />
            <span className="text-[11px] uppercase tracking-wider" style={{ color: "#3D3520" }}>OR</span>
            <div className="flex-1 h-[1px]" style={{ background: "rgba(212,175,55,0.1)" }} />
          </motion.div>

          {/* Discord Button */}
          <motion.button
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signIn("discord", { callbackUrl: "/onboarding" })}
            className="w-full relative overflow-hidden rounded-xl px-4 py-3 mb-6 flex items-center justify-center gap-3 transition-all duration-200"
            style={{
              background: "#0d0d0d",
              border: "1px solid rgba(88,101,242,0.4)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(88,101,242,0.08)";
              e.currentTarget.style.borderColor = "rgba(88,101,242,0.7)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(88,101,242,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#0d0d0d";
              e.currentTarget.style.borderColor = "rgba(88,101,242,0.4)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Discord Logo SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#5865F2" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span className="text-sm font-medium" style={{ color: "#9BA6FF" }}>Continue with Discord</span>
          </motion.button>

          {/* Footer Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            className="text-center mt-6 space-y-1"
          >
            <p className="text-[11px]" style={{ color: "#2E2814" }}>
              By continuing, you enter the political arena.
            </p>
            <p className="text-[11px]" style={{ color: "#5A4E25" }}>
              No downloads. No installs. Just politics.
            </p>
          </motion.div>
        </div>

        {/* Stats Strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex mt-4 rounded-xl overflow-hidden"
          style={{ background: "rgba(212,175,55,0.03)", border: "1px solid rgba(212,175,55,0.08)" }}
        >
          <div className="flex-1 px-4 py-3 text-center" style={{ borderRadius: "10px 0 0 10px" }}>
            <div className="text-[15px] font-cinzel" style={{ color: "#D4AF37" }}>1,248</div>
            <div className="text-[10px] uppercase tracking-[0.08em]" style={{ color: "#3D3520" }}>Citizens</div>
          </div>
          <div className="flex-1 px-4 py-3 text-center border-l border-r" style={{ borderColor: "rgba(212,175,55,0.08)" }}>
            <div className="text-[15px] font-cinzel" style={{ color: "#D4AF37" }}>48</div>
            <div className="text-[10px] uppercase tracking-[0.08em]" style={{ color: "#3D3520" }}>Districts</div>
          </div>
          <div className="flex-1 px-4 py-3 text-center" style={{ borderRadius: "0 10px 10px 0" }}>
            <div className="text-[15px] font-cinzel" style={{ color: "#D4AF37" }}>120</div>
            <div className="text-[10px] uppercase tracking-[0.08em]" style={{ color: "#3D3520" }}>Parties</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Custom CSS animations */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        .logo-float {
          animation: logoFloat 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
