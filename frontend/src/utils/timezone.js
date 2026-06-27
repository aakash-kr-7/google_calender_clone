// All datetimes from the backend are UTC ISO strings.
// JavaScript's Date constructor auto-converts them to local time,
// so we get local display for free without a timezone library.

// Convert UTC ISO string from API → local Date object
export function utcToLocal(isoString) {
  return new Date(isoString)
}

// Convert local Date → UTC ISO string for sending to API
export function localToUtc(date) {
  return date.toISOString()
}

// User's local timezone name, e.g. "Asia/Kolkata"
export function getUserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}
