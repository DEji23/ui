/**
 * Fixed "now" for the whole app — the single instant every seed dataset and
 * every relative-time computation is anchored to.
 *
 * Two independent problems both land on the same fix:
 *
 * 1. Seed data tells a coherent story (which tasks are overdue, which
 *    recommendations are stale) only when read against a fixed point in
 *    time. Reading the live clock instead makes that story silently drift
 *    and eventually invert as real time passes the seeded dates.
 * 2. Most consumers sit in Client Components, which Next renders once on
 *    the server and once more on the client during hydration. A `now`
 *    default of `new Date()` reads two different wall-clock instants
 *    across those passes and can produce two different formatted strings,
 *    which React treats as a hydration mismatch.
 *
 * A fixed reference fixes both: every "now"-dependent function in the app
 * (relativeTime, isRecommendationStale, isBreachingSla, ...) should default
 * to this constant rather than to `new Date()`.
 */
export const APP_NOW = new Date("2026-08-06T09:00:00Z")
