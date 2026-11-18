// js/weather.js — Course 5, Module 3 lab: "Bengaluru right now"
// Live weather from Open-Meteo (no key; sends CORS headers), cached for
// 15 minutes, with a stale-cache and then a sample-data fallback.
//
// The data is someone else's, so it is rendered with textContent only.

const WEATHER_KEY = "weather-bengaluru";
const WEATHER_MAX_AGE = 15 * 60 * 1000;
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast?" + new URLSearchParams({
  latitude: "12.97",
  longitude: "77.59",
  current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature",
  timezone: "Asia/Kolkata",
});

// WMO weather codes used by Open-Meteo (a subset; others -> "Conditions unavailable")
const CONDITIONS = { 0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 51: "Light drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain",
  80: "Rain showers", 95: "Thunderstorm" };

function setWeatherStatus(text) {
  const line = document.querySelector("#weather-status");
  if (line) line.textContent = text;
}

// The fallback ladder (slide 16):
// fresh cache -> fetch -> stale cache -> sample file -> error state
async function loadWeather() {
  if (!document.querySelector("#weather")) return;   // only on resume.html

  const saved = cacheRead(WEATHER_KEY);
  if (isFresh(saved, WEATHER_MAX_AGE)) return renderWeather(saved.data, saved.savedAt);

  setWeatherStatus("Loading the weather…");
  try {
    const data = await getJSON(WEATHER_URL);
    cacheWrite(WEATHER_KEY, data);
    renderWeather(data, Date.now());
  } catch (error) {
    console.error(error);
    if (saved) return renderWeather(saved.data, saved.savedAt, messageFor(error));
    try {
      const sample = await getJSON("fixtures/weather-bengaluru.json");
      renderWeather(sample, null, "Live weather is unavailable. Showing sample data.");
    } catch {
      setWeatherStatus(messageFor(error));
    }
  }
}

// savedAt: a timestamp, or null for sample data. note: an extra status message.
function renderWeather(data, savedAt, note = "") {
  const now = data.current;
  const units = data.current_units;
  const set = (id, text) => { document.querySelector(`#${id}`).textContent = text; };

  set("weather-temp", `${now.temperature_2m} ${units.temperature_2m}`);
  set("weather-condition", CONDITIONS[now.weather_code] ?? "Conditions unavailable");
  set("weather-feels", `Feels like ${now.apparent_temperature} ${units.apparent_temperature}`);
  set("weather-humidity", `Humidity ${now.relative_humidity_2m} ${units.relative_humidity_2m}`);
  set("weather-wind", `Wind ${now.wind_speed_10m} ${units.wind_speed_10m}`);
  set("weather-updated", savedAt
    ? `Updated ${new Date(savedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
    : "Sample data");

  document.querySelector("#weather-card").hidden = false;
  setWeatherStatus(note);
}

document.addEventListener("DOMContentLoaded", loadWeather);
