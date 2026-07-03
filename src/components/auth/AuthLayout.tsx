"use client";
import { AuthSwiper } from "./AuthSwiper";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IoArrowBackOutline, IoHomeOutline } from "react-icons/io5";
import { motion } from "framer-motion";
interface AuthLayoutProps {
  children: React.ReactNode;
}
export default function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen w-full bg-white">
      <div className="fixed top-8 right-8 z-50 flex items-center gap-3 lg:right-12 xl:right-16">
        <motion.button
          whileHover={{ x: -3, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="group flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-gray-400 border border-gray-100 transition-all hover:bg-white hover:text-gray-900 hover:shadow-xl hover:shadow-gray-200/50"
          title="Go Back"
        >
          <IoArrowBackOutline size={18} />
        </motion.button>
        <Link href="/">
          <motion.div
            whileHover={{ y: -3, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group flex h-10 items-center gap-2 rounded-2xl bg-gray-50 px-4 text-xs font-black uppercase tracking-[0.2em] text-gray-400 border border-gray-100 transition-all hover:bg-white hover:text-gray-900 hover:shadow-xl hover:shadow-gray-200/50"
          >
            <IoHomeOutline size={16} />
            <span className="hidden sm:inline">Home</span>
          </motion.div>
        </Link>
      </div>
      <div className="relative hidden w-1/2 p-6 lg:block">
        <AuthSwiper />
      </div>
      <div className="flex w-full flex-col justify-center p-8 lg:w-1/2 lg:p-16 xl:p-24">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
