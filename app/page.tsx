"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Crown, ChevronDown, UserPlus, Users, Trophy, MessageSquare, Landmark, Zap, Star, ArrowRight } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

export default function LandingPage() {
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ["rgba(10,10,10,0.85)", "rgba(10,10,10,0.95)"]);
  const navShadow = useTransform(scrollY, [0, 80], ["none", "0 4px 20px rgba(212,175,55,0.1)"]);

  const [particles, setParticles] = useState<Array<{ id: number; left: string; delay: string; duration: string }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 70 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${8 + Math.random() * 4}s`,
    }));
    setParticles(newParticles);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Navbar */}
      <motion.nav
        style={{ backgroundColor: navBg, boxShadow: navShadow }}
        className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-[rgba(212,175,55,0.2)] backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image
              src="/images/rajneet-logo.png"
              alt="RAJNEET"
              width={36}
              height={36}
              priority
              className="hidden md:block"
            />
            <Image
              src="/images/rajneet-logo.png"
              alt="RAJNEET"
              width={32}
              height={32}
              priority
              className="md:hidden"
            />
            <span className="text-2xl font-cinzel text-gold-gradient hidden md:block">RAJNEET</span>
          </div>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-text-secondary hover:text-gold-primary transition-colors font-inter text-sm"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("roles")}
              className="text-text-secondary hover:text-gold-primary transition-colors font-inter text-sm"
            >
              Roles
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-text-secondary hover:text-gold-primary transition-colors font-inter text-sm"
            >
              Features
            </button>
          </div>

          {/* CTA Button */}
          <Button variant="primary" onClick={() => window.location.href = "/login"}>
            Enter the Arena →
          </Button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Gold Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-gold-primary rounded-full opacity-40"
            style={{
              left: particle.left,
              bottom: "-10px",
              animation: `float ${particle.duration} ease-in-out infinite`,
              animationDelay: particle.delay,
            }}
          />
        ))}

        {/* Radial Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(212,175,55,0.12),transparent)]" />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <Image
              src="/images/rajneet-logo.png"
              alt="RAJNEET"
              width={90}
              height={90}
              priority
              className="mx-auto logo-float"
              style={{
                filter: "drop-shadow(0 0 24px rgba(212,175,55,0.4))",
              }}
            />
          </motion.div>

          {/* Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-block mb-8"
          >
            <div className="px-4 py-2 rounded-full border border-gold-primary bg-bg-tertiary">
              <span className="text-gold-primary text-sm font-inter font-medium">
                ⚡ India&apos;s First Political Social MMO
              </span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <div className="text-5xl md:text-8xl font-cinzel font-bold leading-tight">
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-white"
              >
                WHERE INFLUENCE
              </motion.div>
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="text-gold-gradient"
                style={{ textShadow: "0 0 40px rgba(212,175,55,0.3)" }}
              >
                IS POWER
              </motion.div>
            </div>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-text-secondary text-lg md:text-xl font-inter mb-12"
          >
            Debate. Campaign. Win Elections. Rule Districts.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <Button
              variant="primary"
              className="px-8 py-4 text-lg rounded-xl"
              onClick={() => window.location.href = "/login"}
            >
              Enter the Arena →
            </Button>
            <Button
              variant="secondary"
              className="px-8 py-4 text-lg rounded-xl"
              onClick={() => scrollToSection("how-it-works")}
            >
              Watch How It Works
            </Button>
          </motion.div>

          {/* Social Proof Strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex flex-wrap justify-center gap-6 text-gold-dim text-sm font-inter"
          >
            <span>👑 1,200+ Citizens</span>
            <span>·</span>
            <span>🗳️ 48 Active Districts</span>
            <span>·</span>
            <span>🏛️ 120 Political Parties</span>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-gold-primary"
          >
            <ChevronDown size={32} />
          </motion.div>
        </motion.div>
      </section>

      {/* What is RAJNEET Section */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <SectionReveal>
              <div className="mb-4">
                <span className="text-gold-primary text-xs font-inter tracking-widest uppercase">
                  THE PLATFORM
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-cinzel text-white mb-6">
                A Political Arena Built for the Digital Age
              </h2>
              <p className="text-text-secondary text-lg font-inter mb-6">
                RAJNEET is a gamified political social platform where citizens compete for influence, win elections, manage district governments, and shape public opinion — all inside a fictionalized India.
              </p>
              <p className="text-text-secondary text-lg font-inter mb-8">
                Whether you&apos;re a Meme Creator spreading propaganda or an MP managing a district treasury — every action has political consequences.
              </p>
              <ul className="space-y-4">
                {[
                  "Gain followers. Unlock political power.",
                  "Join parties. Debate rivals. Win votes.",
                  "Rule districts. Control the narrative.",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ x: -30, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3 text-white font-inter"
                  >
                    <span className="text-gold-primary mt-1">●</span>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </SectionReveal>

            {/* Right Column - Mock Profile Card */}
            <SectionReveal>
              <motion.div
                initial={{ rotate: -2 }}
                whileInView={{ rotate: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-bg-secondary border border-[rgba(212,175,55,0.3)] rounded-2xl p-6 shadow-[0_0_40px_rgba(212,175,55,0.2)]"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gold-gradient flex items-center justify-center">
                    <Crown className="text-black" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-cinzel text-lg">@RajNeeta_MP</h3>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full bg-gold-gradient text-black text-xs font-bold">
                        MP
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <CountUp end={847} />
                    <p className="text-text-secondary text-xs font-inter">Followers</p>
                  </div>
                  <div className="text-center">
                    <CountUp end={212} />
                    <p className="text-text-secondary text-xs font-inter">Following</p>
                  </div>
                  <div className="text-center">
                    <CountUp end={134} />
                    <p className="text-text-secondary text-xs font-inter">Posts</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Party:</span>
                    <span className="text-white">🔶 Bharatiya Janta Dal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">District:</span>
                    <span className="text-white">Lucknow Central</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Approval Rating:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                        <div className="h-full bg-gold-gradient" style={{ width: "84%" }} />
                      </div>
                      <span className="text-white">84%</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="primary" className="flex-1">Follow</Button>
                  <Button variant="secondary" className="flex-1">View Profile</Button>
                </div>
              </motion.div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-bg-primary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-gold-primary text-xs font-inter tracking-widest uppercase">
              THE JOURNEY
            </span>
            <h2 className="text-4xl md:text-5xl font-cinzel text-white mt-4">
              From Citizen to Ruler — in 3 Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                icon: UserPlus,
                title: "Join & Choose Your Role",
                description: "Sign up, pick your citizen role — Journalist, Influencer, Activist, and more. Start building your presence.",
              },
              {
                number: "02",
                icon: Users,
                title: "Gain Followers & Influence",
                description: "Post, debate, and engage. Every follower you earn increases your political influence and unlocks new roles.",
              },
              {
                number: "03",
                icon: Crown,
                title: "Claim Power. Rule Districts.",
                description: "Reach 10 followers and become an MP. Win elections, manage treasury, and lead your district to dominance.",
              },
            ].map((step, index) => (
              <SectionReveal key={index} delay={index * 0.15}>
                <div className="bg-bg-secondary border border-[rgba(212,175,55,0.25)] rounded-2xl p-8 relative">
                  <div className="text-8xl font-cinzel text-gold-dim opacity-30 absolute -top-4 -left-2">
                    {step.number}
                  </div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-full bg-gold-glow flex items-center justify-center mb-6">
                      <step.icon className="text-gold-primary" size={32} />
                    </div>
                    <h3 className="text-2xl font-cinzel text-white mb-4">{step.title}</h3>
                    <p className="text-text-secondary font-inter">{step.description}</p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Showcase Section */}
      <section id="roles" className="py-24 px-6 bg-gradient-to-b from-bg-primary to-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-gold-primary text-xs font-inter tracking-widest uppercase">
              WHO WILL YOU BECOME?
            </span>
            <h2 className="text-4xl md:text-5xl font-cinzel text-white mt-4">
              8 Citizen Roles. Unlimited Ambition.
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { emoji: "🏛️", name: "Citizen", description: "The foundation of democracy" },
              { emoji: "📰", name: "Journalist", description: "Break news. Shape narratives." },
              { emoji: "⚖️", name: "Lawyer", description: "Challenge power with law" },
              { emoji: "📱", name: "Influencer", description: "Followers are your weapon" },
              { emoji: "✊", name: "Activist", description: "Lead protests. Drive change." },
              { emoji: "🎭", name: "Meme Creator", description: "Propaganda through humor" },
              { emoji: "👨‍⚖️", name: "Judge", description: "Arbitrate. Decide. Rule." },
              { emoji: "🚔", name: "Police Officer", description: "Enforce order. Hold power." },
            ].map((role, index) => (
              <SectionReveal key={index} delay={index * 0.05}>
                <motion.div
                  whileHover={{ translateY: -6, borderColor: "rgba(212,175,55,0.5)" }}
                  className="bg-bg-secondary border border-[rgba(212,175,55,0.2)] rounded-xl p-6 cursor-pointer transition-all"
                >
                  <div className="text-4xl mb-3">{role.emoji}</div>
                  <h3 className="text-lg font-cinzel text-white mb-2">{role.name}</h3>
                  <p className="text-text-secondary text-sm font-inter mb-3">{role.description}</p>
                  <span className="inline-block px-2 py-1 rounded-full bg-gold-glow text-gold-dim text-xs font-medium">
                    Citizen Tier
                  </span>
                </motion.div>
              </SectionReveal>
            ))}
          </div>

          {/* Political Roles Teaser */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-[rgba(212,175,55,0.05)] border-l-4 border-gold-primary rounded-r-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div>
              <h3 className="text-2xl font-cinzel text-white mb-2">
                👑 Ready to go further?
              </h3>
              <p className="text-text-secondary font-inter">
                Unlock MP, MLA, Chief Secretary & more through gameplay — starting at just 10 followers
              </p>
            </div>
            <Button variant="primary" onClick={() => window.location.href = "/login"}>
              Start Your Journey →
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-24 px-6 bg-bg-primary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-gold-primary text-xs font-inter tracking-widest uppercase">
              BUILT FOR POWER
            </span>
            <h2 className="text-4xl md:text-5xl font-cinzel text-white mt-4">
              Everything a Political Powerhouse Needs
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: "Follower-Based Power", description: "Your followers ARE your political influence. Grow them to unlock roles." },
              { icon: Trophy, title: "District Elections", description: "Campaign, debate, and win votes to control district governments." },
              { icon: MessageSquare, title: "Public Debates", description: "Challenge rivals in open debates. Win public opinion in real time." },
              { icon: Landmark, title: "Treasury Management", description: "Elected MPs manage public funds and spend on community events." },
              { icon: Zap, title: "Live Events", description: "Political scandals, meme wars, protests — the arena never sleeps." },
              { icon: Star, title: "Reputation System", description: "Approval ratings, corruption scores, and public trust — all tracked." },
            ].map((feature, index) => (
              <SectionReveal key={index} delay={index * 0.05}>
                <motion.div
                  whileHover={{ translateY: -6, borderColor: "rgba(212,175,55,0.5)" }}
                  className="bg-bg-secondary border border-[rgba(212,175,55,0.2)] rounded-xl p-6 cursor-pointer transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-gold-glow flex items-center justify-center mb-4">
                    <feature.icon className="text-gold-primary" size={24} />
                  </div>
                  <h3 className="text-lg font-cinzel text-white mb-2">{feature.title}</h3>
                  <p className="text-text-secondary font-inter">{feature.description}</p>
                </motion.div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-6 bg-[radial-gradient(ellipse_at_50%_50%,rgba(212,175,55,0.08),#0a0a0a)]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-cinzel text-white mb-6"
          >
            The Arena is Waiting.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-text-secondary text-lg font-inter mb-12"
          >
            Join thousands of citizens already fighting for influence, power, and glory inside RAJNEET.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <Button
              variant="primary"
              className="px-12 py-5 text-xl rounded-xl"
              onClick={() => window.location.href = "/login"}
            >
              Enter the Arena →
            </Button>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-gold-dim text-sm font-inter"
          >
            Free to play. No downloads. Just politics.
          </motion.p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[rgba(212,175,55,0.15)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo + Tagline */}
            <div className="flex items-center gap-2">
              <Crown className="text-gold-primary" size={16} />
              <span className="text-lg font-cinzel text-gold-gradient">RAJNEET</span>
              <span className="text-text-secondary text-sm font-inter ml-2">
                Where Influence is Power
              </span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-text-secondary hover:text-gold-primary transition-colors font-inter text-sm"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("roles")}
                className="text-text-secondary hover:text-gold-primary transition-colors font-inter text-sm"
              >
                Roles
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="text-text-secondary hover:text-gold-primary transition-colors font-inter text-sm"
              >
                Features
              </button>
              <button
                onClick={() => window.location.href = "/login"}
                className="text-text-secondary hover:text-gold-primary transition-colors font-inter text-sm"
              >
                Login
              </button>
            </div>

            {/* Copyright */}
            <p className="text-text-secondary text-sm font-inter">
              © 2025 RAJNEET. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Custom CSS for particles animation */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.4;
          }
          90% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }

        .float {
          animation: float linear infinite;
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

function SectionReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ end }: { end: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, end]);

  return (
    <div ref={null} className="text-2xl font-cinzel text-white">
      {count}
    </div>
  );
}
