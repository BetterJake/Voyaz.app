export interface WeatherData {
  temp: number;
  condition: string;
}
const WMO_MAP: Record<number, string> = {
  0: "Clear Sky",
  1: "Mainly Clear",
  2: "Partly Cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing Rime Fog",
  51: "Light Drizzle",
  53: "Moderate Drizzle",
  55: "Dense Drizzle",
  61: "Slight Rain",
  63: "Moderate Rain",
  65: "Heavy Rain",
  71: "Slight Snowfall",
  73: "Moderate Snowfall",
  75: "Heavy Snowfall",
  77: "Snow Grains",
  80: "Slight Rain Showers",
  81: "Moderate Rain Showers",
  82: "Violent Rain Showers",
  85: "Slight Snow Showers",
  86: "Heavy Snow Showers",
  95: "Thunderstorm",
  96: "Thunderstorm with Slight Hail",
  99: "Thunderstorm with Heavy Hail",
};
export async function getRealTimeWeather(lat: number, lng: number): Promise<WeatherData> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
    );
    const data = await response.json();
    if (!data.current_weather) {
      throw new Error("Weather data not available");
    }
    const { temperature, weathercode } = data.current_weather;
    return {
      temp: Math.round(temperature),
      condition: WMO_MAP[weathercode] || "Clear Sky",
    };
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return {
      temp: 18,
      condition: "Partly Cloudy",
    };
  }
}
