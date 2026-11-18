# Widget states: "Bengaluru right now"

**Module:** Course 5, Module 3 — Consuming APIs in JavaScript
**Page:** `resume.html` (served by Live Server at `http://127.0.0.1:5500`)
**Code:** `js/weather.js` (uses `getJSON`, `cacheRead`, `cacheWrite`, `isFresh` from `js/api.js`)
**Cache key:** `weather-bengaluru` in Local Storage, fresh for 15 minutes

The fallback ladder: fresh cache → fetch → stale cache → sample file → error state.

| # | State | How I produced it | What the page showed | Network tab | Screenshot |
|---:|---|---|---|---|---|
| 1 | Loading | Deleted the cache key (Application → Local Storage); throttling **3G**; reload | "Loading the weather…" in the status line; card hidden | One pending request to `api.open-meteo.com` | `screenshots/01-loading.png` |
| 2 | Success, fresh | Normal reload with the cache key deleted | 24.3 °C, Partly cloudy, Feels like 25.1 °C, Humidity 62 %, Wind 9.4 km/h, "Updated 14:19" | **One** request to `api.open-meteo.com`, 200 | `screenshots/02-success.png` |
| 3 | Success from cache | Reloaded again within 15 minutes | Same card, same "Updated" time | **No** request to `api.open-meteo.com` | `screenshots/03-from-cache.png` |
| 4 | Error with stale data | Edited `savedAt` in Local Storage to an hour earlier; right-clicked the Open-Meteo request → **Block request URL**; reload | The old card with "Updated 13:19" and "We can't reach the service right now." | Open-Meteo request red, `(blocked:devtools)` | `screenshots/04-stale-with-error.png` |
| 5 | Sample data | Deleted the cache key; kept the block; reload | "Live weather is unavailable. Showing sample data." and "Sample data" on the card | Open-Meteo blocked; `fixtures/weather-bengaluru.json` 200 | `screenshots/05-sample-data.png` |
| 6 | Timeout | Changed the call to `getJSON(WEATHER_URL, 50)`; deleted the cache key; reload; then put back 8000 | The request was cancelled; sample data shown with the "unavailable" message | Open-Meteo `(canceled)` | `screenshots/06-timeout-sample.png` |

After testing: the URL is unblocked, the timeout is back to 8000, throttling is
off, and the page loads live data again.

## What I learned

- A 404 or 500 does not make `fetch` reject; `getResponse` checks `response.ok`.
- With the cache, three reloads in a minute send one request to Open-Meteo, not three.
- Stale data with a clear "Updated" time is better than a blank card.

*Reference screenshots were taken by `tools/browser/check_module03.js` with the
Open-Meteo request answered from the saved fixture (route interception), so the
values are the fixture's. A student's screenshots show live values.*
