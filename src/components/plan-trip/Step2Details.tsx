"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Wallet, MapPin, MessageSquare, Sparkles } from "lucide-react";

interface Step2DetailsProps {
  budget: string;
  mustSee: string;
  description: string;
  setBudget: (val: string) => void;
  setMustSee: (val: string) => void;
  setDescription: (val: string) => void;
  prevStep: () => void;
  startChat: () => void;
}

const Step2Details: React.FC<Step2DetailsProps> = ({
  budget,
  mustSee,
  description,
  setBudget,
  setMustSee,
  setDescription,
  prevStep,
  startChat,
}) => {
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Limit to 7 digits (max 9,999,999) to prevent UI overflow and unrealistic budgets
    if ((val === "" || /^\d+$/.test(val)) && val.length <= 7) {
      setBudget(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent non-numeric characters that type="number" might still allow in some browsers
    if (["-", "+", "e", "E", ".", ","].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-3xl mx-auto"
    >
      <div className="text-center mb-10 relative">
        <button
          onClick={prevStep}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-3 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-2xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">
          A few <span className="text-blue-500">details</span>
        </h1>
        <p className="text-gray-500 text-lg">For the perfect plan, we need a few more details.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-green-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 ease-out z-0"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Wallet className="w-6 h-6 text-green-500" />
              <h3 className="font-bold text-gray-800">Budget per person</h3>
            </div>
            <div className="flex items-end gap-2">
              <input
                type="number"
                min="0"
                value={budget}
                onChange={handleBudgetChange}
                onKeyDown={handleKeyDown}
                className="w-32 bg-transparent border-b-2 border-gray-200 focus:border-green-500 py-1 font-black text-4xl text-gray-800 outline-none transition-colors"
              />
              <span className="text-xl font-bold text-gray-400 mb-1">PLN</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-purple-500" />
            <h3 className="font-bold text-gray-800">Places of interest</h3>
          </div>
          <input
            type="text"
            value={mustSee}
            onChange={(e) => setMustSee(e.target.value)}
            placeholder="e.g., Museum, specific street..."
            className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:font-normal"
          />
        </div>

        <div className="col-span-1 sm:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 text-blue-500" />
            <h3 className="font-bold text-gray-800">Additional notes for AI</h3>
          </div>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your style. Do you like a fast pace and lots of sightseeing, or slow mornings in cafes?"
            className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 font-medium text-gray-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
          ></textarea>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <button
          onClick={startChat}
          className="bg-[#1C1D22] text-white font-bold text-lg py-5 px-12 rounded-[2rem] hover:bg-black transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:scale-105 flex items-center"
        >
          <Sparkles className="w-5 h-5 mr-3 text-yellow-400" />
          AI Magic – Generate Plan
        </button>
      </div>
    </motion.div>
  );
};

export default Step2Details;
