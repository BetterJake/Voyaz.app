"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Footer from "@/components/Footer";
import { useSmoothScroll } from "@/context/SmoothScrollContext";
import {
  IoFingerPrintOutline,
  IoEarthOutline,
  IoSyncOutline,
  IoLockClosedOutline,
} from "react-icons/io5";
export default function PrivacyPage() {
  const { lenis } = useSmoothScroll();
  const sections = [
    {
      id: "01",
      icon: IoFingerPrintOutline,
      title: "Data Stewardship",
      content:
        "Your digital identity is sacred. We collect information you provide directly to us (account details, travel preferences, and interaction history) with absolute transparency.",
    },
    {
      id: "02",
      icon: IoSyncOutline,
      title: "AI Processing",
      content:
        "Our AI engine processes behavioral data to craft personalized journeys. This data is anonymized where possible and used strictly to refine your discovery experience.",
    },
    {
      id: "03",
      icon: IoEarthOutline,
      title: "Global Compliance",
      content:
        "We adhere strictly to GDPR, CCPA, and international data protection standards. Regardless of your location, you have the right to access, correct, or delete your personal data.",
    },
    {
      id: "04",
      icon: IoLockClosedOutline,
      title: "Quantum Security",
      content:
        "We utilize multi-layered encryption and secure-server architectures to shield your information from unauthorized access. Your privacy is protected by design.",
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
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
            alt="Global Network"
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
            <span className="text-emerald-500 font-black uppercase tracking-[0.5em] text-[10px] mb-8 block">
              Privacy Infrastructure
            </span>
            <h1 className="text-6xl md:text-[10vw] font-[1000] text-white uppercase tracking-tighter leading-[0.8] mb-8 drop-shadow-2xl">
              PRIVACY <br /> <span className="text-emerald-500 italic">POLICY.</span>
            </h1>
            <p className="text-white/60 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Last updated April 2025. Protecting the data that powers your global discovery.
            </p>
          </motion.div>
        </div>
      </section>
      <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-4 sticky top-32 h-fit">
            <h2 className="text-4xl md:text-5xl font-[1000] uppercase tracking-tighter leading-none mb-6 text-gray-900">
              DATA <br /> <span className="text-emerald-600 italic">CHARTER.</span>
            </h2>
            <p className="text-gray-400 font-medium leading-relaxed">
              Transparency is the foundation of the Voyaz ecosystem. Discover how we protect your
              unique digital footprint.
            </p>
            <div className="mt-12 flex flex-col gap-4">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  className="flex items-center gap-4 group cursor-pointer w-full text-left outline-none"
                >
                  <span className="text-[10px] font-black text-gray-300 group-hover:text-emerald-600 transition-colors uppercase tracking-widest">
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
                className="group relative"
              >
                <div className="flex gap-8 mb-8">
                  <div className="w-16 h-16 shrink-0 rounded-[1.5rem] bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-sm">
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
                <div className="h-px w-full bg-gray-100 group-hover:bg-emerald-600/20 transition-colors" />
              </motion.div>
            ))}
            <div className="pt-20">
              <div className="p-12 md:p-16 rounded-[4rem] bg-gray-50 border border-gray-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <h4 className="text-3xl font-[1000] uppercase tracking-tighter text-gray-900 mb-6 font-bold">
                    Privacy Rights Center
                  </h4>
                  <p className="text-gray-500 font-medium text-lg leading-relaxed mb-10 max-w-lg">
                    Exercise your data rights, request an export, or ask our Data Protection Officer
                    about our standards.
                  </p>
                  <a
                    href="mailto:privacy@voyaz.app"
                    className="inline-flex items-center justify-center px-10 py-5 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-black/10"
                  >
                    Contact DPO
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
