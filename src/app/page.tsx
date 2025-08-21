'use client';

import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";
import { Newspaper, Coins, Shield, Sparkles, ChevronRight, Zap, Smartphone, Award } from "lucide-react";
import Marquee from "react-fast-marquee";
import { Navbar } from "@/components/ui/navbar";

export default function LandingPage() {
  const { login, authenticated, user, logout } = usePrivy();

  useEffect(() => {
    if (authenticated) {
      console.log("User is authenticated:", user);
    }
  }, [authenticated, user]);

  const features = [
    {
      icon: <Newspaper className="w-6 h-6" />,
      title: "AI-Powered News Summaries",
      description: "Get concise, accurate summaries of the latest news powered by advanced AI",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Verified Content",
      description: "News verification system ensures high-quality, trustworthy content",
    },
    {
      icon: <Coins className="w-6 h-6" />,
      title: "Earn While You Read",
      description: "Get rewarded with tokens for engaging with news content",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Mint Your News",
      description: "Create and mint your own news NFTs with our verification system",
    },
  ];

  const howItWorks = [
    {
      icon: <Smartphone className="w-8 h-8 text-blue-400" />,
      title: "Connect Your Wallet",
      description: "Start by connecting your Web3 wallet to access all features",
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-400" />,
      title: "Browse & Swipe",
      description: "Discover AI-summarized news and swipe through stories",
    },
    {
      icon: <Award className="w-8 h-8 text-green-400" />,
      title: "Earn Rewards",
      description: "Get tokens for reading and engaging with content",
    },
  ];

  const faqs = [
    {
      question: "How do I earn rewards?",
      answer: "You earn rewards by engaging with news content through swiping, reading, and verifying news articles. Each interaction earns you tokens that can be claimed.",
    },
    {
      question: "How is news content verified?",
      answer: "Our AI-powered verification system analyzes news content for accuracy, cross-references sources, and assigns a confidence score to ensure reliability.",
    },
    {
      question: "Can I post my own news?",
      answer: "Yes! You can submit news articles that will be verified by our AI system. Once verified, you can mint them as NFTs and earn rewards when others engage with your content.",
    },
  ];

  return (
    <AuroraBackground className="elative w-full min-h-screen overflow-hidden">
      <div className="relative z-10 container mx-auto px-4">
      <Navbar />
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="pt-32 pb-16 text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            The Future of News
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience news like never before with AI-powered summaries, blockchain verification, and rewards for engagement.
          </p>
          <div className="flex justify-center gap-4">
            {authenticated ? (
              <RainbowButton onClick={logout}>Disconnect Wallet</RainbowButton>
            ) : (
              <RainbowButton onClick={login}>Connect Wallet</RainbowButton>
            )}
          </div>
        </motion.div>

        {/* Marquee Section */}
        <div className="py-12">
          <Marquee gradient={false} speed={50}>
            <div className="flex gap-8 px-4">
              {["Verified News", "Earn Rewards", "AI Summaries", "NFT Minting", "Web3 Integration", "Secure Platform"].map((text, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 text-white">
                  {text}
                </div>
              ))}
            </div>
          </Marquee>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300"
            >
              <div className="flex justify-center mb-4 text-white">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="py-20"
        >
          <h2 className="text-4xl font-bold text-center text-white mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="relative"
              >
                <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 text-center">
                  <div className="flex justify-center mb-6">{step.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-4">{step.title}</h3>
                  <p className="text-gray-300">{step.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <ChevronRight className="w-8 h-8 text-gray-500" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="py-20"
        >
          <h2 className="text-4xl font-bold text-center text-white mb-16">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-8">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-lg rounded-xl p-6"
              >
                <h3 className="text-xl font-semibold text-white mb-4">{faq.question}</h3>
                <p className="text-gray-300">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center py-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Transform Your News Experience?</h2>
          <p className="text-xl text-gray-300 mb-8">Join the revolution in news consumption and creation.</p>
          {!authenticated && <RainbowButton onClick={login}>Get Started Now</RainbowButton>}
        </motion.div>
      </div>
    </AuroraBackground>
  );
}
