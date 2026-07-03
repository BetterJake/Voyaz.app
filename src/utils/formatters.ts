/**
 * Utility functions for global unit and currency conversions.
 */

/**
 * Converts Celsius to Fahrenheit.
 */
export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

/**
 * Converts meters to kilometers or miles.
 */
export function convertDistance(meters: number, unit: "Kilometers (km)" | "Miles (mi)"): string {
  if (unit === "Miles (mi)") {
    const miles = meters * 0.000621371;
    if (miles < 0.1) return `${Math.round(meters * 3.28084)} ft`;
    return `${miles.toFixed(miles < 10 ? 1 : 0)} mi`;
  }

  if (meters < 1000) return `${Math.round(meters)} m`;
  const km = meters / 1000;
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

/**
 * Formats a currency amount based on exchange rates and target currency.
 */
export function convertCurrencyAmount(
  amount: number,
  baseCurrency: string,
  targetCurrency: string,
  rates: Record<string, number>
): number {
  if (baseCurrency === targetCurrency) return amount;

  // Convert from base to USD first if base is not USD
  const amountInUSD = baseCurrency === "USD" ? amount : amount / (rates[baseCurrency] || 1);

  // Convert from USD to target
  return amountInUSD * (rates[targetCurrency] || 1);
}

/**
 * Gets the currency symbol for a given currency code.
 */
export function getCurrencySymbol(currencyWithSymbol: string): string {
  // Expected format: "USD ($)" or "PLN (zł)"
  const match = currencyWithSymbol.match(/\((.*)\)/);
  return match ? match[1] : currencyWithSymbol.split(" ")[0];
}

/**
 * Formats a number as a currency string.
 */
export function formatCurrencyString(amount: number, currencyWithSymbol: string): string {
  const symbol = getCurrencySymbol(currencyWithSymbol);
  const code = currencyWithSymbol.split(" ")[0];

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: code,
    currencyDisplay: "narrowSymbol",
  }).format(amount);
}
