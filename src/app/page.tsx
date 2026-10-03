/* eslint-disable react/no-unescaped-entities */
"use client";

import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { ProjectsView } from "@/features/projects/components/projects-view";

/* ─── Navbar (visible only on landing / signed-out) ─── */
const LandingNavbar = () => {
  const isScrolled = useScroll();
  return (
    <nav
      className={cn(
        "p-4 bg-transparent fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b border-transparent",
        isScrolled && "bg-white/90 backdrop-blur border-gray-200 shadow-sm"
      )}
    >
      <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Aigorithm" width={28} height={28} />
          <span className="font-bold text-lg">Aigorithm</span>
        </Link>
        <div className="flex gap-2">
          <SignUpButton>
            <Button variant="outline" size="sm">Sign up</Button>
          </SignUpButton>
          <SignInButton>
            <Button size="sm">Sign in</Button>
          </SignInButton>
        </div>
      </div>
    </nav>
  );
};

/* ─── Full public landing page ─── */
const LandingPage = () => (
  <div className="flex flex-col w-full bg-white">
    <LandingNavbar />

    {/* HERO */}
    <section className="relative bg-gradient-to-br from-blue-100 via-purple-100 to-orange-100 pt-32 pb-24 px-4">
      <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
        <Image
          src="/logo.svg"
          alt="Aigorithm Logo"
          width={70}
          height={70}
          className="mb-6"
        />
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Build something with <span className="text-green-500">Aigorithm</span>
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-700 max-w-2xl">
          Create cross-chain, cross-metaverse apps, games and websites by chatting with AI
        </p>
        <div className="mt-8 flex gap-4">
          <SignUpButton>
            <Button size="lg" className="px-8 text-base">Get started free</Button>
          </SignUpButton>
          <SignInButton>
            <Button size="lg" variant="outline" className="px-8 text-base">Sign in</Button>
          </SignInButton>
        </div>
        {/* Trusted avatars */}
        <div className="mt-10 flex flex-col items-center gap-2">
          <div className="flex -space-x-2">
            {["/avatar11.png", "/avatar12.png", "/avatar13.png"].map((src, i) => (
              <Image
                key={i}
                src={src}
                alt={`User ${i + 1}`}
                width={34}
                height={34}
                className="rounded-full border-2 border-white"
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">Trusted by 100K+ users</p>
        </div>
      </div>
    </section>

    {/* FEATURE CARDS */}
    <section className="max-w-6xl mx-auto px-4 py-24 grid md:grid-cols-2 gap-8">
      {[
        {
          title: "Create at the speed of thought",
          desc: "Use AI to instantly bring your app or website idea to life without writing a single line of code.",
          gradient: "from-orange-50 via-pink-50 to-blue-50",
        },
        {
          title: "The backend's built-in automatically",
          desc: "Aigorithm sets up your backend, database, and APIs instantly, so you can focus on design and functionality.",
          gradient: "from-green-50 via-teal-50 to-blue-50",
        },
        {
          title: "Cross-chain & Cross-metaverse",
          desc: "Seamlessly connect and deploy across multiple blockchains and metaverse platforms without extra setup. Aigorithm bridges Web2, Web3, and immersive virtual worlds in one unified workflow.",
          gradient: "from-blue-50 via-indigo-50 to-purple-50",
          wide: true,
        },
        {
          title: "Ready to use, instantly",
          desc: "Deploy your new app or site with a single click — live in seconds, no setup needed.",
          gradient: "from-purple-50 via-pink-50 to-yellow-50",
          wide: true,
        },
      ].map((f) => (
        <div
          key={f.title}
          className={cn(
            `bg-gradient-to-tr ${f.gradient} p-8 rounded-2xl shadow-lg flex flex-col justify-center hover:scale-[1.02] transition-transform`,
            f.wide && "md:col-span-2"
          )}
        >
          <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
          <p className="text-gray-600">{f.desc}</p>
        </div>
      ))}
    </section>

    {/* TESTIMONIALS */}
    <section className="bg-gradient-to-br from-green-50 via-yellow-50 to-white py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-12">
          &ldquo;Okay, Aigorithm has <span className="text-orange-500">blown my mind</span>&rdquo;
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { name: "Jane Doe", handle: "@janedoe", avatar: "/avatar1.jpg", text: "Built my entire startup MVP in under an hour using Aigorithm. Absolutely wild.", link: "https://twitter.com/janedoe/status/1234567890" },
            { name: "Mark Dev", handle: "@markdev", avatar: "/avatar3.jpg", text: "No code, no stress — just shipped my SaaS app in a day. Mind blown 🤯", link: "https://twitter.com/markdev/status/987654321" },
            { name: "Sarah Build", handle: "@sarahbuilds", avatar: "/avatar2.jpg", text: "From idea to live site in minutes. This changes everything for indie hackers.", link: "https://twitter.com/sarahbuilds/status/192837465" },
          ].map((t) => (
            <a
              key={t.handle}
              href={t.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-6 rounded-xl shadow-md text-left hover:shadow-xl hover:scale-105 transition-transform flex flex-col"
            >
              <div className="flex items-center gap-4 mb-4">
                <Image src={t.avatar} alt={t.name} width={50} height={50} className="rounded-full" />
                <div>
                  <h4 className="font-semibold">{t.name}</h4>
                  <p className="text-sm text-gray-500">{t.handle}</p>
                </div>
              </div>
              <p className="text-gray-600">{t.text}</p>
            </a>
          ))}
        </div>
      </div>
    </section>

    {/* PRICING */}
    <section className="bg-[#0d1b2a] py-20 px-4 text-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-12">Pricing plans for every need</h2>
        <div className="grid gap-8 md:grid-cols-2">
          {[
            { title: "Start for free", text: "All core features, built-in templates, backend integration, and more.", button: "Start building" },
            { title: "Paid plans from $20/mo", text: "Unlock unlimited apps, more templates, and premium support.", button: "Subscribe" },
          ].map((p) => (
            <div key={p.title} className="bg-white text-gray-900 rounded-2xl shadow-lg p-8 hover:scale-105 transition-transform flex flex-col items-center">
              <h3 className="text-2xl font-bold mb-4">{p.title}</h3>
              <p className="mb-6 text-center text-gray-600">{p.text}</p>
              <SignUpButton>
                <button className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                  {p.button}
                </button>
              </SignUpButton>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* AS FEATURED ON */}
    <section className="bg-white py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">As Featured On</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: "Featured on NAS Daily Show", logo: "/nasdaily.png", alt: "Nas Daily" },
            { name: "Copenhagen Business School articles and citations in 45+ countries", logo: "/copenhagen.png", alt: "CBS" },
            { name: 'Columbia University "Start Me Up" Bootcamp featured top startup', logo: "/columbia.png", alt: "Columbia" },
            { name: "Hosted Emporio Armani's first ever Milan VR Fashion Show inside Aigorithm Metaverse", logo: "/armani.png", alt: "Armani" },
            { name: "ETH Global Finalist", logo: "/ethglobal.png", alt: "ETH Global" },
            { name: "Featured inside Istituto Marangoni Milan Masters Thesis", logo: "/marangoni.png", alt: "Marangoni" },
            { name: "Solana Academy A+ Graduate and OG", logo: "/solana.png", alt: "Solana" },
            { name: "Solana Buildspace Finalist", logo: "/buildspace.png", alt: "Buildspace" },
            { name: "Advisory at Ignyte by Dubai Government", logo: "/ignyte.png", alt: "Ignyte" },
            { name: "Startup Mentor and Advisor at MENA's first ever Ripple XRPL Scale-up Accelerator", logo: "/ripple.png", alt: "Ripple" },
            { name: "Advisory at Dubai International Financial Centre", logo: "/difc.png", alt: "DIFC" },
            { name: "Advisory and Regional Partnership with Startup World Cup Silicon Valley", logo: "/swc.png", alt: "Startup World Cup" },
          ].map((company) => (
            <div key={company.name} className="flex flex-col items-center">
              <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden p-4 flex items-center justify-center relative">
                <Image src={company.logo} alt={company.alt} fill className="object-contain" />
              </div>
              <h3 className="font-semibold mt-3 text-gray-800 text-sm px-2">{company.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* MEWS PRIZE */}
    <section className="bg-white py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">Won MEWS Prize</h2>
        <div className="flex justify-center">
          <div className="max-w-2xl w-full">
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden p-4 flex items-center justify-center relative">
              <Image src="/mewsprize.png" alt="MEWS Prize" fill className="object-contain" />
            </div>
            <h3 className="font-medium mt-4 text-gray-800">
              Won MEWS Prize with Mark Zuckerberg, Jensen Huang, Sam Altman under the Patronage of Prince Albert II of Monaco
            </h3>
          </div>
        </div>
      </div>
    </section>

    {/* AWARDS & RECOGNITIONS */}
    <section className="bg-white py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">Awards & Recognitions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { src: "/davoswef.jpg", alt: "Davos WEF", caption: "Competed for the NBX Prize at the Nobel Prize Award Ceremony in Stockholm, with Elon Musk, Jeff Bezos, Larry Page, Sergey Brin and others" },
            { src: "/nbxprize.jpg", alt: "NBX Prize", caption: "Competed for the Davos World Economic Forum Innovation Prize in Davos, Switzerland with global leaders" },
            { src: "/dsceu.png", alt: "DSCEU", caption: "Aigorithm was featured in the Data Science Conference, the EU's largest AI and Data Science Conference AI Prize category" },
            { src: "/btcnyc.png", alt: "Bitcoin Center NYC", caption: 'Created the VR Metaverse twin of Bitcoin Center NYC, the world\'s first physical commodity exchange of Bitcoin, 100-feet from the New York Stock Exchange featured on Netflix "Banking on Bitcoin" Movie with Facebook co-founders, Vitalik Buterin and others' },
          ].map((item) => (
            <div key={item.alt} className="flex flex-col items-center">
              <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden p-4 flex items-center justify-center relative">
                <Image src={item.src} alt={item.alt} fill className="object-contain" />
              </div>
              <h3 className="font-medium mt-4 text-gray-800 px-4">{item.caption}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* FAQ */}
    <section className="max-w-4xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {[
          { q: "What is Aigorithm?", a: "Aigorithm is the world's first cross-chain, cross-metaverse agentic AI IDE. It lets you create powerful Web2 and Web3 applications, scalable cross-chain dApps, and immersive VR experiences—without needing to code. The platform integrates its own social media network, 1000+ n8n AI automation agents, a learning academy, and a VR Metaverse." },
          { q: "Do I need coding experience?", a: "No. Simply describe what you want in plain language, and our AI agents will handle the technical side. Whether you're building a simple tool or a complex cross-chain application, you can focus on your idea while Aigorithm takes care of the implementation." },
          { q: "What types of apps can I build?", a: "You can build almost anything—from personal productivity tools and enterprise back-office systems to blockchain-based marketplaces, NFT platforms, DeFi dashboards, and VR Metaverse experiences. Aigorithm is designed for both rapid prototyping and large-scale production." },
          { q: "What kind of integrations are supported?", a: "We support native integrations with popular APIs, blockchain networks, payment gateways, data sources, and communication tools. You can also connect to any external API, send emails, SMS, trigger on-chain actions, and automate workflows using our 1000+ built-in AI automation agents." },
          { q: "How is deployment handled?", a: "Aigorithm comes with built-in hosting and blockchain deployment tools. Whether your app is Web2, Web3, or both, it's instantly live across your chosen networks—no manual deployment needed." },
          { q: "How does the app creation process work?", a: "Just type your idea in conversational language. Aigorithm's AI interprets your request, generates the necessary code and architecture, and then deploys it. You can test, refine, and scale your app by continuing the conversation with the AI." },
          { q: "Do I own the apps I create?", a: "Absolutely. Everything you build with Aigorithm—code, content, and deployed applications—is 100% yours. You can use, modify, monetize, or sell your creations without restriction." },
        ].map((item) => (
          <details key={item.q} className="border-b pb-4 group">
            <summary className="font-semibold cursor-pointer list-none flex justify-between items-center py-2">
              {item.q}
              <span className="ml-4 text-gray-400 group-open:rotate-45 transition-transform inline-block text-xl">+</span>
            </summary>
            <p className="mt-2 text-gray-600">{item.a}</p>
          </details>
        ))}
      </div>
    </section>

    {/* FOOTER */}
    <footer className="bg-gradient-to-br from-gray-100 via-purple-50 to-orange-50 py-12 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
        <div>
          <Image src="/logo.svg" alt="Aigorithm" width={50} height={50} />
          <p className="mt-4 text-gray-600">
            Aigorithm is the easiest way to create powerful apps and websites with AI — no coding needed.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            {[
              { href: "https://www.facebook.com/AIgorithms", src: "/facebook-logo.svg", alt: "Facebook" },
              { href: "https://www.instagram.com/aigorithms/", src: "/instagram-logo.svg", alt: "Instagram" },
              { href: "https://www.tiktok.com/@aigorithms", src: "/tiktok-logo.svg", alt: "TikTok" },
              { href: "https://www.linkedin.com/company/aigorithms", src: "/linkedin-logo.svg", alt: "LinkedIn" },
              { href: "https://x.com/ai__gorithm", src: "/twitter-logo.svg", alt: "X/Twitter" },
              { href: "https://discord.gg/Kf7KFbW7K2", src: "/discord-logo.svg", alt: "Discord" },
              { href: "https://t.me/ai_gorithm", src: "/telegram-logo.svg", alt: "Telegram" },
            ].map((s) => (
              <a key={s.alt} href={s.href} target="_blank" rel="noopener noreferrer">
                <Image src={s.src} alt={s.alt} width={36} height={36} className="rounded-full" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Product</h4>
          <a href="https://www.youtube.com/@ai_gorithm" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 block mb-2">Tutorials</a>
          <a href="https://www.aigorithm.site/pricing" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 block">Pricing</a>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Resources</h4>
          <a href="https://medium.com/@aigorithms" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 block">Blog</a>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Legal</h4>
          <p className="text-gray-600 mb-1">Privacy Policy</p>
          <p className="text-gray-600">Terms of Service</p>
        </div>
      </div>
      <div className="mt-8 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Aigorithm. All rights reserved.
      </div>
    </footer>
  </div>
);

/* ─── Root Page: Landing for visitors, Dashboard for logged-in users ─── */
const Home = () => {
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
};

export default Home;
