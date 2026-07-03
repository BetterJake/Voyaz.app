"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { useScrollLock } from "@/hooks/useScrollLock";
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useScrollLock(isOpen);
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          data-lenis-prevent
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white/90 backdrop-blur-3xl border border-white/50 rounded-[40px] shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-8 pb-4">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-900"
              >
                <IoClose size={20} />
              </button>
            </div>
            <div className="p-8 pt-0">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
