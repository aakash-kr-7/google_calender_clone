import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  addDays, format, isSameDay, isToday, eachDayOfInterval,
  getHours, getMinutes,
} from 'date-fns'

// Returns 7 Date objects for the week containing `date` (Sunday → Saturday)
export function getWeekDays(date) {
  const start = startOfWeek(date, { weekStartsOn: 0 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

// Returns a flat array of Date objects filling a 6×7 month grid.
// Includes trailing/leading days from adjacent months to fill the grid.
export function getMonthGrid(date) {
  const monthStart = startOfMonth(date)
  const monthEnd   = endOfMonth(date)
  const gridStart  = startOfWeek(monthStart, { weekStartsOn: 0 })
  const gridEnd    = addDays(gridStart, 41) // always 42 cells (6 weeks)
  return eachDayOfInterval({ start: gridStart, end: gridEnd })
}

// "9:00 AM" or "11:30 PM"
export function formatTime(date) {
  return format(date, 'h:mm a')
}

// "9:00 – 10:30 AM" — shares AM/PM suffix if both in same period
export function formatEventTime(start, end) {
  const startHour = getHours(start)
  const endHour   = getHours(end)
  const samePeriod = (startHour < 12) === (endHour < 12)
  const startStr = samePeriod ? format(start, 'h:mm') : format(start, 'h:mm a')
  const endStr   = format(end, 'h:mm a')
  return `${startStr} – ${endStr}`
}

// Minutes since midnight — used to calculate position in the time grid
export function minutesFromMidnight(date) {
  return getHours(date) * 60 + getMinutes(date)
}

// Position as % of the 24-hour grid height (for absolute positioning)
export function timeToPercent(date) {
  return (minutesFromMidnight(date) / 1440) * 100
}

// Height as % of the 24-hour grid (for event block height)
export function durationToPercent(start, end) {
  const durationMinutes = (end - start) / 60000
  return (durationMinutes / 1440) * 100
}

export { isSameDay, isToday, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays }
