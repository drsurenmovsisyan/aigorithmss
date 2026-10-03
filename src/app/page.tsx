/* eslint-disable react/no-unescaped-entities */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SignedIn, SignUpButton } from "@clerk/nextjs";

import { Navbar } from "@/modules/home/ui/components/navbar";
import { ProjectForm } from "@/modules/home/ui/components/project-form";
import { ProjectsList } from "@/modules/home/ui/components/projects-list";
import { ProjectsCommandDialog } from "@/features/projects/components/projects-command-dialog";
import { ImportGithubDialog } from "@/features/projects/components/import-github-dialog";
import { NewProjectDialog } from "@/features/projects/components/new-project-dialog";

export default function Page() {
  const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "k") {
          e.preventDefault();
          setCommandDialogOpen(true);
        }
        if (e.key === "i") {
          e.preventDefault();
          setImportDialogOpen(true);
        }
        if (e.key === "j") {
          e.preventDefault();
          setNewProjectDialogOpen(true);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      style={{
        colorScheme: "light",
        backgroundColor: "#ffffff",
        color: "#111827",
        fontFamily: "inherit",
      }}
      className="flex flex-col w-full min-h-screen text-gray-900 bg-white"
    >
      <Navbar />

      <SignedIn>
        <ProjectsCommandDialog
          open={commandDialogOpen}
          onOpenChange={setCommandDialogOpen}
        />
        <ImportGithubDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
        />
        <NewProjectDialog
          open={newProjectDialogOpen}
          onOpenChange={setNewProjectDialogOpen}
        />
      </SignedIn>

      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-blue-100 via-purple-100 to-orange-100 pt-28 pb-20 md:py-24 px-4">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          <Image
            src="/logo.svg"
            alt="Aigorithm Logo"
            width={60}
            height={60}
            className="mb-6 animate-fadeIn"
          />
          <h1 className="text-4xl md:text-6xl font-bold leading-tight animate-fadeIn text-gray-900">
            Build something with <span className="text-green-500">Aigorithm</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-700 animate-fadeIn delay-200">
            Create cross-chain, cross-metaverse apps, games and websites by chatting with AI
          </p>
          <div className="mt-8 max-w-3xl mx-auto w-full animate-fadeIn delay-300">
            <ProjectForm />
          </div>
          <SignedIn>
            <div className="mt-8 w-full animate-fadeIn delay-300 overflow-x-auto">
              <ProjectsList />
            </div>
          </SignedIn>

          {/* COMBINED TRUSTED BY USERS SECTION INTO HERO SECTION */}
          <div className="mt-8">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Image
                src="/avatar11.png"
                alt="User Avatar 1"
                width={30}
                height={30}
                className="rounded-full border-2 border-white"
              />
              <Image
                src="/avatar12.png"
                alt="User Avatar 2"
                width={30}
                height={30}
                className="rounded-full border-2 border-white"
              />
              <Image
                src="/avatar13.png"
                alt="User Avatar 3"
                width={30}
                height={30}
                className="rounded-full border-2 border-white"
              />
            </div>
            <p className="text-sm text-gray-700">Trusted by 100K+ users</p>
          </div>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="max-w-6xl mx-auto px-4 py-24 grid md:grid-cols-2 gap-12">
        <div className="bg-gradient-to-tr from-orange-50 via-pink-50 to-blue-50 p-8 rounded-2xl shadow-lg flex flex-col justify-center hover:scale-105 transition-transform">
          <h3 className="text-2xl font-bold mb-4 text-gray-900">Create at the speed of thought</h3>
          <p className="text-gray-600">
            Use AI to instantly bring your app or website idea to life without writing a single line of code.
          </p>
        </div>
        <div className="bg-gradient-to-tr from-green-50 via-teal-50 to-blue-50 p-8 rounded-2xl shadow-lg flex flex-col justify-center hover:scale-105 transition-transform">
          <h3 className="text-2xl font-bold mb-4 text-gray-900">The backend's built-in automatically</h3>
          <p className="text-gray-600">
            Aigorithm sets up your backend, database, and APIs instantly, so you can focus on design and functionality.
          </p>
        </div>
        <div className="bg-gradient-to-tr from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-2xl shadow-lg flex flex-col justify-center md:col-span-2 hover:scale-105 transition-transform">
          <h3 className="text-2xl font-bold mb-4 text-gray-900">Cross-chain & Cross-metaverse</h3>
          <p className="text-gray-600">
            Seamlessly connect and deploy across multiple blockchains and metaverse platforms without extra setup. Aigorithm bridges Web2, Web3, and immersive virtual worlds in one unified workflow.
          </p>
        </div>
        <div className="bg-gradient-to-tr from-purple-50 via-pink-50 to-yellow-50 p-8 rounded-2xl shadow-lg flex flex-col justify-center md:col-span-2 hover:scale-105 transition-transform">
          <h3 className="text-2xl font-bold mb-4 text-gray-900">Ready to use, instantly</h3>
          <p className="text-gray-600">
            Deploy your new app or site with a single click — live in seconds, no setup needed.
          </p>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-gradient-to-br from-green-50 via-yellow-50 to-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-12 text-gray-900">
            &ldquo;Okay, Aigorithm has <span className="text-orange-500">blown my mind</span>&rdquo;
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Jane Doe",
                handle: "@janedoe",
                avatar: "/avatar1.jpg",
                text: "Built my entire startup MVP in under an hour using Aigorithm. Absolutely wild.",
                link: "https://twitter.com/janedoe/status/1234567890",
              },
              {
                name: "Mark Dev",
                handle: "@markdev",
                avatar: "/avatar3.jpg",
                text: "No code, no stress — just shipped my SaaS app in a day. Mind blown 🤯",
                link: "https://twitter.com/markdev/status/987654321",
              },
              {
                name: "Sarah Build",
                handle: "@sarahbuilds",
                avatar: "/avatar2.jpg",
                text: "From idea to live site in minutes. This changes everything for indie hackers.",
                link: "https://twitter.com/sarahbuilds/status/192837465",
              },
            ].map((t) => (
              <a
                key={t.handle}
                href={t.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-6 rounded-xl shadow-md text-left hover:shadow-xl hover:scale-105 transition-transform flex flex-col"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{t.name}</h4>
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
      <section className="bg-[#0d1b2a] py-20 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-12">
            Pricing plans for every need
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                title: "Start for free",
                text: "All core features, built-in templates, backend integration, and more.",
                button: "Start building",
              },
              {
                title: "Paid plans from $20/mo",
                text: "Unlock unlimited apps, more templates, and premium support.",
                button: "Subscribe",
              },
            ].map((p) => (
              <div
                key={p.title}
                className="bg-white text-gray-900 rounded-2xl shadow-lg p-8 hover:scale-105 transition-transform flex flex-col items-center"
              >
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">
                  {p.title}
                </h3>
                <p className="mb-6 text-center text-gray-600">{p.text}</p>
                <SignUpButton>
                  <button className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer">
                    {p.button}
                  </button>
                </SignUpButton>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED ON */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 text-gray-900">As Featured On</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                name: "Featured on NAS Daily Show",
                logo: "/nasdaily.png",
                alt: "Nas Daily Logo",
              },
              {
                name: "Copenhagen Business School articles and citations in 45+ countries",
                logo: "/copenhagen.png",
                alt: "CBS News Logo",
              },
              {
                name: 'Columbia University New York "Start Me Up" Bootcamp featured top startup',
                logo: "/columbia.png",
                alt: "Columbia University Logo",
              },
              {
                name: "Hosted Emporio Armani's first ever Milan VR Fashion Show inside Aigorithm Metaverse",
                logo: "/armani.png",
                alt: "Armani Logo",
              },
              {
                name: "ETH Global Finalist",
                logo: "/ethglobal.png",
                alt: "ETH Global Logo",
              },
              {
                name: "Featured inside Istituto Marangoni Milan Masters Thesis",
                logo: "/marangoni.png",
                alt: "Istituto Marangoni Logo",
              },
              {
                name: "Solana Academy A+ Graduate and OG",
                logo: "/solana.png",
                alt: "Solana Logo",
              },
              {
                name: "Solana Buildspace Finalist",
                logo: "/buildspace.png",
                alt: "Buildspace Logo",
              },
              {
                name: "Advisory at Ignyte by Dubai Government",
                logo: "/ignyte.png",
                alt: "Ignyte Logo",
              },
              {
                name: "Agentic AI Ambassador at Swiss Finance + Technology Association",
                logo: "/sfta.png",
                alt: "Swiss Finance + Technology Association Logo",
              },
              {
                name: "Startup Mentor and Advisor at MENA's first ever Ripple's XRPL Scale-up Accelerator Programme",
                logo: "/ripple.png",
                alt: "Ripple Logo",
              },
              {
                name: "Advisory at Dubai International Financial Centre",
                logo: "/difc.png",
                alt: "DIFC Logo",
              },
              {
                name: "Advisory and Regional Partnership with Startup World Cup Silicon Valley, the world's largest world cup competition",
                logo: "/swc.png",
                alt: "Startup World Cup Logo",
              },
            ].map((company) => (
              <div key={company.name} className="flex flex-col items-center">
                <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden p-4 flex items-center justify-center relative">
                  <Image
                    src={company.logo}
                    alt={company.alt}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="font-semibold mt-4 text-gray-800 text-sm px-2">
                  {company.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRIZE ON */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 text-gray-900">Won MEWS Prize</h2>
          <div className="flex justify-center">
            <div className="max-w-2xl">
              <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden p-4 flex items-center justify-center relative">
                <Image
                  src="/mewsprize.png"
                  alt="MEWS Prize"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-medium mt-4 text-gray-800">
                Won MEWS Prize with Mark Zuckerberg, Jensen Huang, Sam Altman under the Patronage of Prince Albert II of Monaco
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* COMPETING FOR PRIZE ON */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 text-gray-900">Awards & Recognitions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Davos Innovation Week */}
            <div className="flex flex-col items-center">
              <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden p-4 flex items-center justify-center relative">
                <Image
                  src="/davoswef.jpg"
                  alt="Davos Innovation Week Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-medium mt-4 text-gray-800 px-4">
                Davos Innovation Week AI and Web3 Innovation Prize Nominee
              </h3>
            </div>

            {/* Next Block Expo */}
            <div className="flex flex-col items-center">
              <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden p-4 flex items-center justify-center relative">
                <Image
                  src="/nbxprize.jpg"
                  alt="Next Block Expo Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-medium mt-4 text-gray-800 px-4">
                Next Block Expo Finalist
              </h3>
            </div>

            {/* Data Science Conference */}
            <div className="flex flex-col items-center">
              <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden p-4 flex items-center justify-center relative">
                <Image
                  src="/dsceu.png"
                  alt="Data Science Conference Europe Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-medium mt-4 text-gray-800 px-4">
                Aigorithm was featured in the Data Science Conference, the EU's largest AI and Data Science Conference AI Prize category
              </h3>
            </div>

            {/* Bitcoin Center NYC */}
            <div className="flex flex-col items-center">
              <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden p-4 flex items-center justify-center relative">
                <Image
                  src="/btcnyc.png"
                  alt="Bitcoin Center NYC Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="font-medium mt-4 text-gray-800 px-4">
                Created the VR Metaverse twin of Bitcoin Center NYC, the world's first physical commodity exchange of Bitcoin, 100-feet from the New York Stock Exchange featured on Netflix "Banking on Bitcoin" Movie with Facebook co-founders, Vitalik Buterin and others
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {[
            {
              q: "What is Aigorithm?",
              a: "Aigorithm is the world's first cross-chain, cross-metaverse agentic AI IDE. It lets you create powerful Web2 and Web3 applications, scalable cross-chain dApps, and immersive VR experiences—without needing to code. The platform integrates its own social media network, 1000+ n8n AI automation agents, a learning academy, and a VR Metaverse.",
            },
            {
              q: "Do I need coding experience?",
              a: "No. Simply describe what you want in plain language, and our AI agents will handle the technical side. Whether you're building a simple tool or a complex cross-chain application, you can focus on your idea while Aigorithm takes care of the implementation.",
            },
            {
              q: "What types of apps can I build?",
              a: "You can build almost anything—from personal productivity tools and enterprise back-office systems to blockchain-based marketplaces, NFT platforms, DeFi dashboards, and VR Metaverse experiences. Aigorithm is designed for both rapid prototyping and large-scale production.",
            },
            {
              q: "What kind of integrations are supported?",
              a: "We support native integrations with popular APIs, blockchain networks, payment gateways, data sources, and communication tools. You can also connect to any external API, send emails, SMS, trigger on-chain actions, and automate workflows using our 1000+ built-in AI automation agents.",
            },
            {
              q: "How is deployment handled?",
              a: "Aigorithm comes with built-in hosting and blockchain deployment tools. Whether your app is Web2, Web3, or both, it's instantly live across your chosen networks—no manual deployment needed.",
            },
            {
              q: "How does the app creation process work?",
              a: "Just type your idea in conversational language. Aigorithm's AI interprets your request, generates the necessary code and architecture, and then deploys it. You can test, refine, and scale your app by continuing the conversation with the AI.",
            },
            {
              q: "Do I own the apps I create?",
              a: "Absolutely. Everything you build with Aigorithm—code, content, and deployed applications—is 100% yours. You can use, modify, monetize, or sell your creations without restriction.",
            },
          ].map((item) => (
            <details key={item.q} className="border-b border-gray-200 pb-4">
              <summary className="font-semibold cursor-pointer text-gray-900 py-2">
                {item.q}
              </summary>
              <p className="mt-2 text-gray-600 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gradient-to-br from-gray-100 via-purple-50 to-orange-50 py-12 px-4 border-t border-gray-200/60">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <Image src="/logo.svg" alt="Logo" width={50} height={50} />
            <p className="mt-4 text-gray-600">
              Aigorithm is the easiest way to create powerful apps and websites with AI — no coding needed.
            </p>
            <div className="flex gap-4 mt-4 flex-wrap">
              <a href="https://www.facebook.com/AIgorithms" target="_blank" rel="noopener noreferrer">
                <Image src="/facebook-logo.svg" alt="Facebook" width={40} height={40} className="rounded-full" />
              </a>
              <a href="https://www.instagram.com/aigorithms/" target="_blank" rel="noopener noreferrer">
                <Image src="/instagram-logo.svg" alt="Instagram" width={40} height={40} className="rounded-full" />
              </a>
              <a href="https://www.tiktok.com/@aigorithms" target="_blank" rel="noopener noreferrer">
                <Image src="/tiktok-logo.svg" alt="TikTok" width={40} height={40} className="rounded-full" />
              </a>
              <a href="https://www.linkedin.com/company/aigorithms" target="_blank" rel="noopener noreferrer">
                <Image src="/linkedin-logo.svg" alt="LinkedIn" width={40} height={40} className="rounded-full" />
              </a>
              <a href="https://x.com/ai__gorithm" target="_blank" rel="noopener noreferrer">
                <Image src="/twitter-logo.svg" alt="Twitter" width={40} height={40} className="rounded-full" />
              </a>
              <a href="https://discord.gg/Kf7KFbW7K2" target="_blank" rel="noopener noreferrer">
                <Image src="/discord-logo.svg" alt="Discord" width={40} height={40} className="rounded-full" />
              </a>
              <a href="https://t.me/ai_gorithm" target="_blank" rel="noopener noreferrer">
                <Image src="/telegram-logo.svg" alt="Telegram" width={40} height={40} className="rounded-full" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Product</h4>
            <a
              href="https://www.youtube.com/@ai_gorithm"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 block text-gray-600 mb-2"
            >
              Tutorials
            </a>
            <a
              href="https://www.aigorithm.site/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 block text-gray-600"
            >
              Pricing
            </a>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Resources</h4>
            <a
              href="https://medium.com/@aigorithms"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 block text-gray-600"
            >
              Blog
            </a>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Legal</h4>
            <p className="text-gray-600 mb-2">Privacy Policy</p>
            <p className="text-gray-600">Terms of Service</p>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Aigorithm. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
