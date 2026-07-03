"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import {
  celsiusToFahrenheit,
  convertDistance,
  convertCurrencyAmount,
  formatCurrencyString,
} from "@/utils/formatters";

interface PreferencesContextType {
  formatCurrency: (amount: number, fromCurrency?: string) => string;
  formatDistance: (meters: number) => string;
  formatTemperature: (celsius: number) => string;
  currencyRates: Record<string, number>;
  isLoadingRates: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [rates, setRates] = useState<Record<string, number>>({});
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  // Default values from profile or fallbacks
  const preferredCurrency = profile?.preferred_currency || "USD ($)";
  const distanceUnit = profile?.distance_unit || "Kilometers (km)";
  const tempUnit = profile?.temperature_unit || "Celsius (°C)";

  // Fetch real-time exchange rates (base USD)
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await response.json();
        if (data && data.rates) {
          setRates(data.rates);
        }
      } catch (error) {
        console.error("Failed to fetch currency rates:", error);
        // Fallback static rates if API fails
        setRates({
          USD: 1,
          EUR: 0.92,
          GBP: 0.79,
          PLN: 4.01,
          JPY: 151.45,
        });
      } finally {
        setIsLoadingRates(false);
      }
    };

    fetchRates();
  }, []);

  const formatCurrency = useCallback(
    (amount: number, fromCurrency: string = "USD", shouldConvert: boolean = true) => {
      const targetCode = preferredCurrency.split(" ")[0];
      const converted = shouldConvert
        ? convertCurrencyAmount(amount, fromCurrency, targetCode, rates)
        : amount;
      return formatCurrencyString(converted, preferredCurrency);
    },
    [preferredCurrency, rates]
  );

  const formatDistance = useCallback(
    (meters: number) => {
      return convertDistance(meters, distanceUnit as any);
    },
    [distanceUnit]
  );

  const formatTemperature = useCallback(
    (celsius: number) => {
      if (tempUnit.includes("Fahrenheit")) {
        const f = celsiusToFahrenheit(celsius);
        return `${Math.round(f)}°F`;
      }
      return `${Math.round(celsius)}°C`;
    },
    [tempUnit]
  );

  return (
    <PreferencesContext.Provider
      value={{
        formatCurrency,
        formatDistance,
        formatTemperature,
        currencyRates: rates,
        isLoadingRates,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
};
