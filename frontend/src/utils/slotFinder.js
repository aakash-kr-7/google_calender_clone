/**
 * Finds alternative non-overlapping slots for a conflicting event.
 * 
 * Rules:
 * 1. Checks working hours: 9:00 AM - 6:00 PM.
 * 2. Scans starting from the day of the pending event up to 7 days forward.
 * 3. Skips checking recurrence rules (simplifies calculations).
 * 4. Checks overlaps against other loaded events in the store.
 */
export function findAvailableSlots(pendingEvent, allEvents, count = 3) {
  const durationMs = new Date(pendingEvent.end_time) - new Date(pendingEvent.start_time);
  const suggestions = [];

  const startDay = new Date(pendingEvent.start_time);
  startDay.setHours(9, 0, 0, 0); // start at 9:00 AM on the event's day

  // Check up to 7 days forward
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const currentDay = new Date(startDay.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    
    // Check half-hour increments between 9 AM and 6 PM
    for (let hour = 9; hour < 18; hour++) {
      for (const minute of [0, 30]) {
        const candidateStart = new Date(currentDay);
        candidateStart.setHours(hour, minute, 0, 0);
        
        // Skip candidate slots in the past
        if (candidateStart < new Date()) continue;

        const candidateEnd = new Date(candidateStart.getTime() + durationMs);

        // Ensure slot finishes within working hours (by 6:00 PM)
        const dayEnd = new Date(currentDay);
        dayEnd.setHours(18, 0, 0, 0);
        if (candidateEnd > dayEnd) continue;

        // Check overlap with existing events
        const hasOverlap = allEvents.some((event) => {
          // Ignore the event itself if updating, all-day events, and virtual instances
          if (event.id === pendingEvent.id || event.is_all_day || event.rrule) return false;
          
          const eventStart = new Date(event.start_time);
          const eventEnd = new Date(event.end_time);

          return candidateStart < eventEnd && candidateEnd > eventStart;
        });

        if (!hasOverlap) {
          suggestions.push({
            start: candidateStart.toISOString(),
            end: candidateEnd.toISOString(),
          });
          if (suggestions.length >= count) {
            return suggestions;
          }
        }
      }
    }
  }

  return suggestions;
}
