/**
 * Event duration resizing via bottom drag handle.
 *
 * Uses document-level mousemove/mouseup (not element-level) so
 * the resize continues even when the cursor leaves the event block.
 * Enforces a 15-minute minimum duration.
 */
import { useState, useCallback } from 'react'
import { useEventStore } from '../store/eventStore'
import { updateEvent } from '../api/client'
import toast from 'react-hot-toast'

export function useResize(event, gridHeightPx = 1440) {
  const [isResizing, setIsResizing] = useState(false)
  const [localEndTime, setLocalEndTime] = useState(new Date(event.end_time))

  const startResize = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)

    const startY     = e.clientY
    const startEnd   = new Date(event.end_time)
    const startStart = new Date(event.start_time)

    const onMove = (moveEvent) => {
      const deltaY       = moveEvent.clientY - startY
      const deltaMinutes = Math.round((deltaY / gridHeightPx) * 1440 / 15) * 15
      const newEnd       = new Date(startEnd.getTime() + deltaMinutes * 60000)

      // Enforce 15-minute minimum
      const minEnd = new Date(startStart.getTime() + 15 * 60000)
      if (newEnd > minEnd) setLocalEndTime(newEnd)
    }

    const onUp = async () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      setIsResizing(false)

      try {
        await updateEvent(event.id, { end_time: localEndTime.toISOString() }, true)
        useEventStore.setState((s) => ({
          events: s.events.map((ev) =>
            ev.id === event.id ? { ...ev, end_time: localEndTime.toISOString() } : ev
          ),
        }))
      } catch {
        setLocalEndTime(new Date(event.end_time))
        toast.error('Failed to resize event')
      }
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [event, gridHeightPx, localEndTime])

  return { isResizing, localEndTime, startResize }
}
