"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Footer from "@/components/Footer";
import { useSmoothScroll } from "@/context/SmoothScrollContext";
import {
  IoShieldCheckmarkOutline,
  IoDocumentTextOutline,
  IoScaleOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";
export default function TermsPage() {
  const { lenis } = useSmoothScroll();
  const sections = [
    {
      id: "01",
      icon: IoDocumentTextOutline,
      title: "Agreement to Terms",
      content:
        "By accessing or using the Voyaz platform (voyaz.app), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.",
    },
    {
      id: "02",
      icon: IoInformationCircleOutline,
      title: "Our AI Services",
      content:
        "Voyaz provides an AI-native travel discovery platform. We utilize advanced algorithms to generate itineraries. While we strive for perfection, Voyaz is not responsible for real-world outcomes following AI suggestions.",
    },
    {
      id: "03",
      icon: IoShieldCheckmarkOutline,
      title: "User Responsibilities",
      content:
        "You are responsible for your account security. You agree not to use the service for unlawful purposes or content that infringes upon third-party rights.",
    },
    {
      id: "04",
      icon: IoScaleOutline,
      title: "Limitation of Liability",
      content:
        "In no event shall Voyaz be liable for any indirect, incidental, or consequential damages resulting from your use of or inability to use the platform.",
    },
  ];
  const scrollToSection = (id: string) => {
    if (lenis) {
      lenis.scrollTo(`#section-${id}`, {
        offset: -120,
        duration: 1.5,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    }
  };
  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-[75vh] w-full flex items-center justify-center overflow-hidden bg-black pt-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop"
            alt="Misty Mountains"
            fill
            className="object-cover opacity-60 brightness-75"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/40" />
        </div>
        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-blue-500 font-black uppercase tracking-[0.5em] text-[10px] mb-8 block">
              Legal Infrastructure
            </span>
            <h1 className="text-6xl md:text-[10vw] font-[1000] text-white uppercase tracking-tighter leading-[0.8] mb-8 drop-shadow-2xl">
              TERMS OF <br /> <span className="text-blue-500">SERVICE.</span>
            </h1>
            <p className="text-white/60 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Last updated April 2025. Defining the digital boundaries of your next great discovery.
            </p>
          </motion.div>
        </div>
      </section>
      <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 italic">
          <div className="lg:col-span-4 sticky top-32 h-fit">
            <h2 className="text-4xl md:text-5xl font-[1000] uppercase tracking-tighter leading-none mb-6 text-gray-900">
              DOCUMENT <br /> <span className="text-blue-600 italic">OVERVIEW.</span>
            </h2>
            <p className="text-gray-400 font-medium leading-relaxed">
              Our commitment to transparency and security ensures that every journey starts with a
              solid foundation of trust.
            </p>
            <div className="mt-12 flex flex-col gap-4">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className="flex items-center gap-4 group cursor-pointer w-full text-left outline-none"
                >
                  <span className="text-[10px] font-black text-gray-300 group-hover:text-blue-600 transition-colors uppercase tracking-widest">
                    {s.id}
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest text-gray-900 group-hover:translate-x-1 transition-all">
                    {s.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-8 space-y-24">
            {sections.map((section, idx) => (
              <motion.div
                key={section.id}
                id={`section-${section.id}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="group"
              >
                <div className="flex gap-8 mb-8">
                  <div className="w-16 h-16 shrink-0 rounded-[1.5rem] bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                    <section.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-[1000] uppercase tracking-tighter text-gray-900 mb-4 leading-none">
                      {section.title}
                    </h3>
                    <p className="text-gray-500 text-xl font-medium leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
                <div className="h-px w-full bg-gray-100 group-hover:bg-blue-600/20 transition-colors" />
              </motion.div>
            ))}
            <div className="pt-20">
              <div className="p-12 md:p-16 rounded-[4rem] bg-gray-50 border border-gray-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <h4 className="text-3xl font-[1000] uppercase tracking-tighter text-gray-900 mb-6">
                    Need legal support?
                  </h4>
                  <p className="text-gray-500 font-medium text-lg leading-relaxed mb-10 max-w-lg">
                    Our compliance team is here to help you understand the finer details of our
                    service agreement.
                  </p>
                  <a
                    href="mailto:legal@voyaz.app"
                    className="inline-flex items-center justify-center px-10 py-5 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-black/10"
                  >
                    Contact Legal Team
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
