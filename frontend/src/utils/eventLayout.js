/**
 * Sweep-line column layout algorithm.
 *
 * Problem: two events at 9–10 AM and 9:30–10:30 AM can't both be 100% wide.
 * We need to assign them to columns so they sit side by side.
 *
 * Algorithm:
 * 1. Sort events by start_time ascending
 * 2. For each event, find the first column whose last event ends
 *    before this event starts (no overlap). Assign to that column.
 *    If no free column, open a new one.
 * 3. After all events are placed, count total columns in each
 *    overlapping group and set left%/width% accordingly.
 */
export function computeEventLayout(events) {
  if (!events.length) return []

  // Sort by start time
  const sorted = [...events].sort(
    (a, b) => new Date(a.start_time) - new Date(b.start_time)
  )

  // columns[i] = end time of the last event placed in column i
  const columns = []
  const assignments = sorted.map((event) => {
    const start = new Date(event.start_time)
    const end   = new Date(event.end_time)

    // Find the first column that is free (last event in it already ended)
    let col = columns.findIndex((colEnd) => colEnd <= start)
    if (col === -1) {
      col = columns.length // open a new column
    }
    columns[col] = end
    return { event, col }
  })

  // Total columns = however many we opened
  const totalColumns = columns.length

  return assignments.map(({ event, col }) => ({
    ...event,
    column:       col,
    totalColumns,
    leftPercent:  (col / totalColumns) * 100,
    widthPercent: (1 / totalColumns) * 100,
  }))
}
