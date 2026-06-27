/**
 * Fetches events whenever the visible date range changes.
 * 
 * We watch currentDate + viewMode. When either changes, recompute
 * the visible range and re-fetch from the backend. This means navigating
 * to next week automatically loads that week's events.
 */
import { useEffect } from 'react'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, subDays } from 'date-fns'
import { useCalendarStore } from '../store/calendarStore'
import { useEventStore } from '../store/eventStore'

export function useEvents() {
  const { currentDate, viewMode } = useCalendarStore()
  const { fetchEvents, events, loading } = useEventStore()

  useEffect(() => {
    let start, end

    if (viewMode === 'month') {
      // Fetch a bit beyond the month to cover the grid's leading/trailing days
      start = subDays(startOfMonth(currentDate), 7)
      end   = addDays(endOfMonth(currentDate), 7)
    } else if (viewMode === 'week') {
      start = startOfWeek(currentDate, { weekStartsOn: 0 })
      end   = endOfWeek(currentDate, { weekStartsOn: 0 })
    } else {
      // Day view — just fetch that single day with a small buffer
      start = subDays(currentDate, 1)
      end   = addDays(currentDate, 1)
    }

    fetchEvents(start.toISOString(), end.toISOString())
  }, [currentDate, viewMode])

  return { events, loading }
}
