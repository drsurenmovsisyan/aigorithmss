/* eslint-disable react/no-unescaped-entities */
"use client";

import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";
import { ProjectsView } from "@/features/projects/components/projects-view";

/* ─── Force-light wrapper: overrides dark-mode CSS vars completely ─── */
const LightWrapper = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      colorScheme: "light",
      backgroundColor: "#ffffff",
      color: "#111827",
      fontFamily: "inherit",
    }}
    className="w-full"
  >
    {children}
  </div>
);

/* ─── Navbar ─── */
const LandingNavbar = () => {
  const isScrolled = useScroll();
  return (
    <nav
      className={cn(
        "p-4 fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        isScrolled
          ? "border-[#e5e7eb] shadow-sm"
          : "border-transparent"
      )}
      style={{
        backgroundColor: isScrolled ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter: isScrolled ? "blur(8px)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Aigorithm" width={28} height={28} />
          <span style={{ color: "#111827", fontWeight: 700, fontSize: "1.1rem" }}>Aigorithm</span>
        </Link>
        <div className="flex gap-2">
          <SignUpButton>
            <button
              style={{
                border: "1.5px solid #d1d5db",
                background: "#fff",
                color: "#111827",
                padding: "6px 18px",
                borderRadius: "8px",
                fontWeight: 500,
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Sign up
            </button>
          </SignUpButton>
          <SignInButton>
            <button
              style={{
                background: "#111827",
                color: "#fff",
                border: "none",
                padding: "6px 18px",
                borderRadius: "8px",
                fontWeight: 500,
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Sign in
            </button>
          </SignInButton>
        </div>
      </div>
    </nav>
  );
};

/* ─── HERO ─── */
const Hero = () => (
  <section
    style={{
      background: "linear-gradient(135deg, #dbeafe 0%, #ede9fe 40%, #fce7f3 70%, #fed7aa 100%)",
      paddingTop: "8rem",
      paddingBottom: "6rem",
    }}
  >
    <div className="max-w-5xl mx-auto px-4 flex flex-col items-center text-center">
      <Image src="/logo.svg" alt="Aigorithm Logo" width={72} height={72} className="mb-6" />
      <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.75rem)", fontWeight: 800, color: "#111827", lineHeight: 1.15 }}>
        Build something with{" "}
        <span style={{ color: "#16a34a" }}>Aigorithm</span>
      </h1>
      <p style={{ marginTop: "1rem", fontSize: "1.2rem", color: "#374151", maxWidth: "600px" }}>
        Create cross-chain, cross-metaverse apps, games and websites by chatting with AI
      </p>
      <div className="flex gap-4 mt-8 flex-wrap justify-center">
        <SignUpButton>
          <button style={{ background: "#111827", color: "#fff", border: "none", padding: "14px 36px", borderRadius: "10px", fontWeight: 600, cursor: "pointer", fontSize: "1rem" }}>
            Get started free
          </button>
        </SignUpButton>
        <SignInButton>
          <button style={{ background: "#fff", color: "#111827", border: "1.5px solid #d1d5db", padding: "14px 36px", borderRadius: "10px", fontWeight: 600, cursor: "pointer", fontSize: "1rem" }}>
            Sign in
          </button>
        </SignInButton>
      </div>
      <div className="flex flex-col items-center gap-2 mt-10">
        <div className="flex -space-x-2">
          {["/avatar11.png", "/avatar12.png", "/avatar13.png"].map((src, i) => (
            <Image key={i} src={src} alt={`User ${i + 1}`} width={36} height={36} className="rounded-full border-2 border-white" />
          ))}
        </div>
        <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Trusted by 100K+ users</p>
      </div>
    </div>
  </section>
);

/* ─── FEATURE CARDS ─── */
const featureCards = [
  {
    title: "Create at the speed of thought",
    desc: "Use AI to instantly bring your app or website idea to life without writing a single line of code.",
    gradient: "linear-gradient(135deg, #fff7ed, #fce7f3, #dbeafe)",
  },
  {
    title: "The backend's built-in automatically",
    desc: "Aigorithm sets up your backend, database, and APIs instantly, so you can focus on design and functionality.",
    gradient: "linear-gradient(135deg, #d1fae5, #ccfbf1, #dbeafe)",
  },
  {
    title: "Cross-chain & Cross-metaverse",
    desc: "Seamlessly connect and deploy across multiple blockchains and metaverse platforms without extra setup. Aigorithm bridges Web2, Web3, and immersive virtual worlds in one unified workflow.",
    gradient: "linear-gradient(135deg, #dbeafe, #e0e7ff, #ede9fe)",
    wide: true,
  },
  {
    title: "Ready to use, instantly",
    desc: "Deploy your new app or site with a single click — live in seconds, no setup needed.",
    gradient: "linear-gradient(135deg, #ede9fe, #fce7f3, #fef9c3)",
    wide: true,
  },
];

const Features = () => (
  <section style={{ backgroundColor: "#ffffff", padding: "5rem 1rem" }}>
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
      {featureCards.map((f) => (
        <div
          key={f.title}
          style={{ background: f.gradient, padding: "2.5rem", borderRadius: "1.25rem", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}
          className={cn("flex flex-col justify-center hover:scale-[1.02] transition-transform", f.wide && "md:col-span-2")}
        >
          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "0.75rem" }}>{f.title}</h3>
          <p style={{ color: "#374151", lineHeight: 1.7 }}>{f.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

/* ─── TESTIMONIALS ─── */
const testimonials = [
  { name: "Jane Doe", handle: "@janedoe", avatar: "/avatar1.jpg", text: "Built my entire startup MVP in under an hour using Aigorithm. Absolutely wild." },
  { name: "Mark Dev", handle: "@markdev", avatar: "/avatar3.jpg", text: "No code, no stress — just shipped my SaaS app in a day. Mind blown 🤯" },
  { name: "Sarah Build", handle: "@sarahbuilds", avatar: "/avatar2.jpg", text: "From idea to live site in minutes. This changes everything for indie hackers." },
];

const Testimonials = () => (
  <section style={{ background: "linear-gradient(135deg, #d1fae5, #fef9c3, #ffffff)", padding: "5rem 1rem" }}>
    <div className="max-w-6xl mx-auto text-center">
      <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", fontWeight: 800, color: "#111827", marginBottom: "3rem" }}>
        "Okay, Aigorithm has <span style={{ color: "#ea580c" }}>blown my mind</span>"
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <div
            key={t.handle}
            style={{ background: "#fff", padding: "1.75rem", borderRadius: "1rem", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", textAlign: "left" }}
            className="hover:scale-105 transition-transform flex flex-col"
          >
            <div className="flex items-center gap-4 mb-4">
              <Image src={t.avatar} alt={t.name} width={52} height={52} className="rounded-full" />
              <div>
                <h4 style={{ fontWeight: 600, color: "#111827" }}>{t.name}</h4>
                <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>{t.handle}</p>
              </div>
            </div>
            <p style={{ color: "#374151", lineHeight: 1.7 }}>{t.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── PRICING ─── */
const Pricing = () => (
  <section style={{ background: "#0d1b2a", padding: "5rem 1rem" }}>
    <div className="max-w-6xl mx-auto text-center">
      <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)", fontWeight: 800, color: "#ffffff", marginBottom: "3rem" }}>
        Pricing plans for every need
      </h2>
      <div className="grid gap-8 md:grid-cols-2">
        {[
          { title: "Start for free", text: "All core features, built-in templates, backend integration, and more.", button: "Start building" },
          { title: "Paid plans from $20/mo", text: "Unlock unlimited apps, more templates, and premium support.", button: "Subscribe" },
        ].map((p) => (
          <div
            key={p.title}
            style={{ background: "#ffffff", borderRadius: "1.25rem", padding: "2.5rem", boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}
            className="hover:scale-105 transition-transform flex flex-col items-center"
          >
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "1rem" }}>{p.title}</h3>
            <p style={{ color: "#4b5563", marginBottom: "1.5rem", textAlign: "center" }}>{p.text}</p>
            <SignUpButton>
              <button style={{ background: "#111827", color: "#fff", border: "none", padding: "12px 28px", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "1rem" }}>
                {p.button}
              </button>
            </SignUpButton>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── AS FEATURED ON ─── */
const featuredOn = [
  { name: "Featured on NAS Daily Show", logo: "/nasdaily.png", alt: "Nas Daily" },
  { name: "Copenhagen Business School articles and citations in 45+ countries", logo: "/copenhagen.png", alt: "CBS" },
  { name: 'Columbia University "Start Me Up" Bootcamp featured top startup', logo: "/columbia.png", alt: "Columbia" },
  { name: "Hosted Emporio Armani's first ever Milan VR Fashion Show inside Aigorithm Metaverse", logo: "/armani.png", alt: "Armani" },
  { name: "ETH Global Finalist", logo: "/ethglobal.png", alt: "ETH Global" },
  { name: "Featured inside Istituto Marangoni Milan Masters Thesis", logo: "/marangoni.png", alt: "Marangoni" },
  { name: "Solana Academy A+ Graduate and OG", logo: "/solana.png", alt: "Solana" },
  { name: "Solana Buildspace Finalist", logo: "/buildspace.png", alt: "Buildspace" },
  { name: "Advisory at Ignyte by Dubai Government", logo: "/ignyte.png", alt: "Ignyte" },
  { name: "Startup Mentor at MENA's first Ripple XRPL Scale-up Accelerator", logo: "/ripple.png", alt: "Ripple" },
  { name: "Advisory at Dubai International Financial Centre", logo: "/difc.png", alt: "DIFC" },
  { name: "Advisory and Regional Partnership with Startup World Cup Silicon Valley", logo: "/swc.png", alt: "Startup World Cup" },
];

const FeaturedOn = () => (
  <section style={{ backgroundColor: "#ffffff", padding: "5rem 1rem" }}>
    <div className="max-w-6xl mx-auto text-center">
      <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#111827", marginBottom: "3rem" }}>As Featured On</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {featuredOn.map((company) => (
          <div key={company.alt} className="flex flex-col items-center">
            <div style={{ width: "100%", aspectRatio: "1", background: "#f9fafb", borderRadius: "0.75rem", padding: "1rem", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
              <Image src={company.logo} alt={company.alt} fill className="object-contain p-2" />
            </div>
            <p style={{ fontWeight: 500, marginTop: "0.75rem", color: "#111827", fontSize: "0.8rem", padding: "0 0.5rem" }}>{company.name}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── MEWS PRIZE ─── */
const MewsPrize = () => (
  <section style={{ backgroundColor: "#f9fafb", padding: "5rem 1rem" }}>
    <div className="max-w-6xl mx-auto text-center">
      <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#111827", marginBottom: "3rem" }}>Won MEWS Prize</h2>
      <div className="flex justify-center">
        <div style={{ maxWidth: "520px", width: "100%" }}>
          <div style={{ aspectRatio: "1", background: "#fff", borderRadius: "1rem", overflow: "hidden", position: "relative", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <Image src="/mewsprize.png" alt="MEWS Prize" fill className="object-contain p-4" />
          </div>
          <p style={{ marginTop: "1rem", color: "#374151", fontWeight: 500, lineHeight: 1.6 }}>
            Won MEWS Prize with Mark Zuckerberg, Jensen Huang, Sam Altman under the Patronage of Prince Albert II of Monaco
          </p>
        </div>
      </div>
    </div>
  </section>
);

/* ─── AWARDS ─── */
const awards = [
  { src: "/davoswef.jpg", alt: "Davos WEF", caption: "Competed for the Davos World Economic Forum Innovation Prize in Davos, Switzerland with global leaders" },
  { src: "/nbxprize.jpg", alt: "NBX Prize", caption: "Competed for the NBX Prize at the Nobel Prize Award Ceremony in Stockholm, with Elon Musk, Jeff Bezos, Larry Page, Sergey Brin and others" },
  { src: "/dsceu.png", alt: "DSCEU", caption: "Featured in the Data Science Conference — the EU's largest AI & Data Science Conference AI Prize category" },
  { src: "/btcnyc.png", alt: "Bitcoin Center NYC", caption: "Created the VR Metaverse twin of Bitcoin Center NYC, world's first physical Bitcoin exchange, featured on Netflix with Vitalik Buterin and others" },
];

const Awards = () => (
  <section style={{ backgroundColor: "#ffffff", padding: "5rem 1rem" }}>
    <div className="max-w-6xl mx-auto text-center">
      <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#111827", marginBottom: "3rem" }}>Awards & Recognitions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {awards.map((item) => (
          <div key={item.alt} className="flex flex-col items-center">
            <div style={{ width: "100%", aspectRatio: "4/3", background: "#f9fafb", borderRadius: "1rem", overflow: "hidden", position: "relative", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
              <Image src={item.src} alt={item.alt} fill className="object-contain p-4" />
            </div>
            <p style={{ fontWeight: 500, marginTop: "1rem", color: "#374151", lineHeight: 1.6, padding: "0 1rem" }}>{item.caption}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── FAQ ─── */
const faqs = [
  { q: "What is Aigorithm?", a: "Aigorithm is the world's first cross-chain, cross-metaverse agentic AI IDE. It lets you create powerful Web2 and Web3 applications, scalable cross-chain dApps, and immersive VR experiences—without needing to code." },
  { q: "Do I need coding experience?", a: "No. Simply describe what you want in plain language, and our AI agents will handle the technical side." },
  { q: "What types of apps can I build?", a: "From personal productivity tools to blockchain-based marketplaces, NFT platforms, DeFi dashboards, and VR Metaverse experiences." },
  { q: "What integrations are supported?", a: "Popular APIs, blockchain networks, payment gateways, data sources, and communication tools. Plus 1000+ built-in AI automation agents." },
  { q: "How is deployment handled?", a: "Aigorithm comes with built-in hosting and blockchain deployment. Your app is instantly live — no manual deployment needed." },
  { q: "How does the app creation process work?", a: "Just type your idea in plain language. Aigorithm interprets your request, generates the code, and deploys it. Test, refine, and scale by continuing the conversation." },
  { q: "Do I own the apps I create?", a: "Absolutely. Everything you build — code, content, and deployed apps — is 100% yours with no restrictions." },
];

const FAQ = () => (
  <section style={{ backgroundColor: "#f9fafb", padding: "5rem 1rem" }}>
    <div className="max-w-4xl mx-auto">
      <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#111827", textAlign: "center", marginBottom: "2.5rem" }}>Frequently Asked Questions</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {faqs.map((item) => (
          <details key={item.q} style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "1rem" }} className="group">
            <summary style={{ fontWeight: 600, cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0", color: "#111827" }}>
              {item.q}
              <span style={{ color: "#9ca3af", fontSize: "1.5rem", marginLeft: "1rem", transition: "transform 0.2s" }} className="group-open:rotate-45 inline-block">+</span>
            </summary>
            <p style={{ color: "#4b5563", lineHeight: 1.7, paddingBottom: "0.5rem" }}>{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);

/* ─── FOOTER ─── */
const socials = [
  { href: "https://www.facebook.com/AIgorithms", src: "/facebook-logo.svg", alt: "Facebook" },
  { href: "https://www.instagram.com/aigorithms/", src: "/instagram-logo.svg", alt: "Instagram" },
  { href: "https://www.tiktok.com/@aigorithms", src: "/tiktok-logo.svg", alt: "TikTok" },
  { href: "https://www.linkedin.com/company/aigorithms", src: "/linkedin-logo.svg", alt: "LinkedIn" },
  { href: "https://x.com/ai__gorithm", src: "/twitter-logo.svg", alt: "X/Twitter" },
  { href: "https://discord.gg/Kf7KFbW7K2", src: "/discord-logo.svg", alt: "Discord" },
  { href: "https://t.me/ai_gorithm", src: "/telegram-logo.svg", alt: "Telegram" },
];

const Footer = () => (
  <footer style={{ background: "linear-gradient(135deg, #f3f4f6, #ede9fe, #fff7ed)", padding: "4rem 1rem 2rem" }}>
    <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
      <div>
        <Image src="/logo.svg" alt="Aigorithm" width={48} height={48} />
        <p style={{ marginTop: "1rem", color: "#374151", lineHeight: 1.7 }}>
          Aigorithm is the easiest way to create powerful apps and websites with AI — no coding needed.
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          {socials.map((s) => (
            <a key={s.alt} href={s.href} target="_blank" rel="noopener noreferrer">
              <Image src={s.src} alt={s.alt} width={36} height={36} className="rounded-full" />
            </a>
          ))}
        </div>
      </div>
      <div>
        <h4 style={{ fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>Product</h4>
        <a href="https://www.youtube.com/@ai_gorithm" target="_blank" rel="noopener noreferrer" style={{ color: "#4b5563", display: "block", marginBottom: "0.5rem" }} className="hover:text-blue-600">Tutorials</a>
        <a href="https://www.aigorithm.site/pricing" target="_blank" rel="noopener noreferrer" style={{ color: "#4b5563", display: "block" }} className="hover:text-blue-600">Pricing</a>
      </div>
      <div>
        <h4 style={{ fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>Resources</h4>
        <a href="https://medium.com/@aigorithms" target="_blank" rel="noopener noreferrer" style={{ color: "#4b5563" }} className="hover:text-blue-600">Blog</a>
      </div>
      <div>
        <h4 style={{ fontWeight: 600, color: "#111827", marginBottom: "1rem" }}>Legal</h4>
        <p style={{ color: "#4b5563", marginBottom: "0.5rem" }}>Privacy Policy</p>
        <p style={{ color: "#4b5563" }}>Terms of Service</p>
      </div>
    </div>
    <p style={{ textAlign: "center", color: "#6b7280", fontSize: "0.85rem", marginTop: "3rem" }}>
      © {new Date().getFullYear()} Aigorithm. All rights reserved.
    </p>
  </footer>
);

/* ─── Full landing page ─── */
const LandingPage = () => (
  <LightWrapper>
    <LandingNavbar />
    <Hero />
    <Features />
    <Testimonials />
    <Pricing />
    <FeaturedOn />
    <MewsPrize />
    <Awards />
    <FAQ />
    <Footer />
  </LightWrapper>
);

/* ─── Root page ─── */
export default function Home() {
  return (
    <>
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>
        <ProjectsView />
      </SignedIn>
    </>
  );
}
