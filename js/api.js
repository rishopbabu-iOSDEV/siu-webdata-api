// js/api.js — Course 5, Module 3
// Every request on the site goes through here. Load this file before any
// script that fetches (resume.js, weather.js, posts.js).

// Three checks, in the order a request can fail:
//   1. fetch itself rejects   -> no response at all (offline, wrong host, CORS, timeout)
//   2. response.ok is false   -> a 4xx or 5xx: fetch RESOLVES on these, so we must check
//   3. Content-Type not JSON  -> an HTML error page or a mistyped URL
// Each failure becomes an Error with a .reason the page can turn into a sentence.
async function getResponse(url, timeoutMs = 8000) {
  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  } catch (cause) {
    const error = new Error(cause.name === "TimeoutError" ? "Request timed out" : "Network error");
    error.reason = cause.name === "TimeoutError" ? "timeout" : "network";
    throw error;
  }

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.reason = "http";
    error.status = response.status;
    error.retryAfter = response.headers.get("Retry-After");
    throw error;
  }

  const type = response.headers.get("Content-Type") || "";
  if (!type.includes("application/json")) {
    const error = new Error(`Expected JSON, received ${type || "nothing"}`);
    error.reason = "format";
    throw error;
  }

  return response;
}

// The body only. Use getResponse when you also need the headers (pagination).
async function getJSON(url, timeoutMs = 8000) {
  const response = await getResponse(url, timeoutMs);
  return response.json();
}

// One sentence per failure, written for a visitor. Technical detail goes to
// console.error(error); the page shows this.
function messageFor(error) {
  if (error.reason === "timeout") return "This is taking too long. Please try again.";
  if (error.reason === "network") return "We can't reach the service right now.";
  if (error.status === 404) return "We couldn't find that.";
  if (error.status === 429 || error.status === 403) return "Too many requests. Please wait a minute.";
  if (error.status >= 500) return "The service is having problems. Please try later.";
  return "Something went wrong.";
}

// A tiny localStorage cache: { savedAt, data }. Never cache anything private.
function cacheRead(key) {
  try {
    return JSON.parse(localStorage.getItem(key));      // { savedAt, data } or null
  } catch {
    localStorage.removeItem(key);                       // corrupted: throw it away
    return null;
  }
}

function cacheWrite(key, data) {
  localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
}

// Fresh = saved less than maxAgeMs ago.
const isFresh = (saved, maxAgeMs) => saved !== null && Date.now() - saved.savedAt < maxAgeMs;
