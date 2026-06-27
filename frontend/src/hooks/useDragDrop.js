/**
 * Drag-and-drop rescheduling hook.
 *
 * On drag end:
 * 1. Convert pixel delta → minute delta
 * 2. Apply to event start/end times
 * 3. Optimistically update store (instant UI feedback)
 * 4. PATCH backend — on failure, rollback and show error
 *
 * This optimistic update pattern makes the UI feel snappy
 * even if the network is slow.
 */
import { useEventStore } from '../store/eventStore'
import { updateEvent } from '../api/client'
import toast from 'react-hot-toast'

export function useDragDrop(gridHeightPx = 1440) {
  const { events, fetchEvents } = useEventStore()

  const handleDragEnd = async ({ active, delta, overId }) => {
    if (!active || !delta) return

    const eventId = active.id
    const event = events.find((e) => e.id === eventId)
    if (!event) return

    // Convert pixel delta to minutes
    // gridHeightPx represents 1440 minutes (24h), so 1px = 1440/gridHeightPx minutes
    const minuteDelta = Math.round((delta.y / gridHeightPx) * 1440 / 15) * 15

    if (minuteDelta === 0 && !overId) return

    const oldStart = new Date(event.start_time)
    const oldEnd   = new Date(event.end_time)
    const newStart = new Date(oldStart.getTime() + minuteDelta * 60000)
    const newEnd   = new Date(oldEnd.getTime()   + minuteDelta * 60000)

    // Optimistic update — update store immediately
    useEventStore.setState((s) => ({
      events: s.events.map((e) =>
        e.id === eventId
          ? { ...e, start_time: newStart.toISOString(), end_time: newEnd.toISOString() }
          : e
      ),
    }))

    try {
      await updateEvent(eventId, {
        start_time: newStart.toISOString(),
        end_time:   newEnd.toISOString(),
      }, true) // force=true skips overlap check on drag
    } catch {
      // Rollback on failure
      useEventStore.setState((s) => ({
        events: s.events.map((e) =>
          e.id === eventId
            ? { ...e, start_time: event.start_time, end_time: event.end_time }
            : e
        ),
      }))
      toast.error('Failed to move event')
    }
  }

  return { handleDragEnd }
}
