"use client";
import React from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Minus, Plus, X, ArrowRight, Loader2 } from "lucide-react";

interface Destination {
  id: number;
  name: string;
  days: number;
  isValid: boolean;
  isValidating: boolean;
  error?: string;
}

interface Step1PlacesProps {
  destinations: Destination[];
  dateFrom: string;
  dateTo: string;
  plannedDays: number;
  totalTripDays: number;
  isDaysMatch: boolean;
  allCitiesValid: boolean;
  updateDateFrom: (date: string) => void;
  updateDateTo: (date: string) => void;
  updateDestinationName: (id: number, name: string) => void;
  validateCity: (id: number, name: string) => void;
  handleDaysChange: (id: number, delta: number) => void;
  removeDestination: (id: number) => void;
  addDestination: () => void;
  nextStep: () => void;
}

const Step1Places: React.FC<Step1PlacesProps> = ({
  destinations,
  dateFrom,
  dateTo,
  plannedDays,
  totalTripDays,
  isDaysMatch,
  allCitiesValid,
  updateDateFrom,
  updateDateTo,
  updateDestinationName,
  validateCity,
  handleDaysChange,
  removeDestination,
  addDestination,
  nextStep,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-3xl mx-auto"
    >
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">
          Create your <span className="text-blue-500">route</span>
        </h1>
        <p className="text-gray-500 text-lg">
          Where are we heading this time? Add points to your dream map.
        </p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 mb-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
          <Calendar className="w-8 h-8" />
        </div>
        <div className="flex-1 w-full grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => updateDateFrom(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 font-bold text-gray-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1">
              End Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => updateDateTo(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 font-bold text-gray-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
        <div className="flex justify-between items-center mb-6 px-2">
          <h3 className="font-black text-xl">Destinations</h3>
          <div
            className={`px-4 py-2 rounded-2xl font-bold text-sm ${isDaysMatch ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}
          >
            {plannedDays} / {totalTripDays} days planned
          </div>
        </div>

        <div className="relative space-y-4">
          <div className="absolute left-[2.25rem] top-8 bottom-8 w-1 bg-gray-100 rounded-full z-0 hidden sm:block"></div>

          {destinations.map((dest) => (
            <div key={dest.id} className="relative z-10 flex items-center gap-4 group">
              <div className="hidden sm:flex w-16 items-center justify-center shrink-0">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 border-white shadow-sm transition-all duration-300 ${!dest.isValid ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-400"}`}
                >
                  {dest.isValidating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <MapPin className="w-5 h-5" />
                  )}
                </div>
              </div>

              <div
                className={`flex-1 bg-gray-50 hover:bg-white border rounded-3xl p-2 pl-6 flex items-center justify-between transition-all duration-300 ${!dest.isValid && !dest.isValidating ? "border-red-200" : "border-transparent hover:border-gray-100"}`}
              >
                <input
                  type="text"
                  value={dest.name}
                  onChange={(e) => updateDestinationName(dest.id, e.target.value)}
                  onBlur={(e) => validateCity(dest.id, e.target.value)}
                  placeholder="Enter a city..."
                  className="flex-1 bg-transparent border-none py-4 text-xl font-bold text-gray-800 focus:outline-none placeholder:text-gray-300"
                />

                {dest.error && !dest.isValid && !dest.isValidating && (
                  <div className="absolute left-6 top-[calc(100%+0.5rem)] text-[10px] font-bold text-red-500 bg-red-50 px-3 py-1 rounded-lg border border-red-100 z-20">
                    {dest.error}
                  </div>
                )}

                <div className="flex items-center gap-2 pr-2">
                  <div className="flex items-center bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
                    <button
                      onClick={() => handleDaysChange(dest.id, -1)}
                      className="p-2.5 text-gray-400 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-bold text-base">
                      {dest.days}
                      <span className="text-xs text-gray-400 ml-0.5">d</span>
                    </span>
                    <button
                      onClick={() => handleDaysChange(dest.id, 1)}
                      className="p-2.5 text-gray-400 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeDestination(dest.id)}
                    disabled={destinations.length === 1}
                    className="p-3.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-colors disabled:opacity-30"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={addDestination}
            className="flex items-center text-blue-500 font-bold hover:text-blue-600 transition-colors bg-blue-50 hover:bg-blue-100 px-5 py-3 rounded-2xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add destination
          </button>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center gap-4">
        {!isDaysMatch && (
          <p className="text-red-500 text-sm font-bold">
            Planned days must match calendar ({totalTripDays} days)
          </p>
        )}
        {!allCitiesValid && (
          <p className="text-red-500 text-sm font-bold">Please enter valid city names</p>
        )}
        <button
          onClick={nextStep}
          disabled={!isDaysMatch || !allCitiesValid}
          className="bg-blue-500 text-white font-bold text-lg py-5 px-10 rounded-[2rem] hover:bg-blue-600 transition-all duration-300 hover:shadow-[0_8px_25px_rgba(59,130,246,0.3)] hover:-translate-y-1 flex items-center group disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
        >
          Next to details
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

export default Step1Places;
