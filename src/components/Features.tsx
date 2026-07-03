"use client";
import { motion } from "framer-motion";
import { FaStar, FaBolt, FaMagic, FaMap } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
const Features = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };
  const imageReveal = {
    hidden: { clipPath: "inset(0 100% 0 0)", opacity: 0 },
    visible: {
      clipPath: "inset(0 0% 0 0)",
      opacity: 1,
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] as any },
    },
  };
  return (
    <section className="w-full bg-white overflow-hidden">
      <div className="relative h-[600px] w-full flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ scale: 1.2 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          <Image
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"
            alt="Epic Landscape"
            fill
            className="object-cover brightness-75"
          />
        </motion.div>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center px-6"
        >
          <span className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] mb-6 block">
            The New Era of Travel
          </span>
          <h2 className="text-6xl md:text-9xl font-[1000] text-white uppercase tracking-tighter leading-[0.85] mb-4">
            REDEFINE <br /> <span className="text-blue-500">YOUR TRIP.</span>
          </h2>
        </motion.div>
      </div>
      <div className="py-40 px-6 md:px-12 max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative h-[700px]"
        >
          <motion.div
            variants={imageReveal}
            className="absolute top-0 right-0 w-[85%] h-[500px] rounded-[3rem] overflow-hidden shadow-2xl z-10"
          >
            <Image
              src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=2070&auto=format&fit=crop"
              alt="Travel Planning"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-10 left-10 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <FaMagic size={12} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest">
                  AI Engine Active
                </span>
              </div>
              <p className="text-lg font-bold leading-tight">Optimizing Tokyo Route...</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute bottom-0 left-0 w-[60%] h-[350px] rounded-[3rem] border-[12px] border-white overflow-hidden shadow-2xl z-20"
          >
            <Image
              src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=2070&auto=format&fit=crop"
              alt="Exploring"
              fill
              className="object-cover"
            />
          </motion.div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-60" />
          <div className="absolute -bottom-10 right-0 w-60 h-60 bg-purple-50 rounded-full blur-3xl opacity-60" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-6xl md:text-8xl font-[1000] uppercase leading-[0.8] tracking-tighter mb-10 text-gray-900">
            CREATE <br />
            YOUR <br /> <span className="text-blue-600">JOURNEY.</span>
          </h2>
          <div className="space-y-8 mb-16">
            <div className="flex gap-6 group">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                <FaBolt />
              </div>
              <div>
                <h4 className="text-xl font-black uppercase tracking-tight mb-2">
                  Instant Generation
                </h4>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                  Our neural network analyzes millions of data points to build the perfect route in
                  under 30 seconds.
                </p>
              </div>
            </div>
            <div className="flex gap-6 group">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
                <FaMap />
              </div>
              <div>
                <h4 className="text-xl font-black uppercase tracking-tight mb-2">
                  Precision Mapping
                </h4>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                  Every spot is verified for coordinates, opening hours, and local popularity to
                  ensure a flawless flow.
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-8 p-10 rounded-[3rem] bg-gray-50 border border-gray-100 mb-12">
            {[
              { val: "12k+", label: "Voyages" },
              { val: "98%", label: "Precision" },
              { val: "4.9", label: "Rating", icon: true },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl font-black flex items-center gap-1 leading-none mb-1">
                  {stat.val} {stat.icon && <FaStar className="text-yellow-400 text-sm" />}
                </div>
                <div className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-6">
            <Link href="/plan-trip">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 rounded-full bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-black/10 w-full sm:w-auto"
              >
                Create Your Journey
              </motion.button>
            </Link>
            <Link href="/plan-trip">
              <motion.button
                whileHover={{ scale: 1.05, borderColor: "#2563eb", color: "#2563eb" }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 rounded-full border-2 border-gray-200 text-xs font-black uppercase tracking-widest transition-all w-full sm:w-auto"
              >
                Watch Demo
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
export default Features;
