import { useEffect, useRef } from 'react'
import { X, Pencil, Trash2, MapPin, AlignLeft, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { formatEventTime } from '../../utils/dateUtils'

export default function EventPopover({ event, position, onClose, onEdit, onDelete }) {
  const ref = useRef()

  // Close on click outside or ESC
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [onClose])

  // Keep popover within viewport
  const top  = Math.min(position.y, window.innerHeight - 320)
  const left = Math.min(position.x, window.innerWidth  - 300)

  const startDate = new Date(event.start_time)
  const endDate   = new Date(event.end_time)

  return (
    <div
      ref={ref}
      className="popover-enter fixed z-50 w-72 bg-gcal-surface rounded-xl shadow-2xl p-4"
      style={{ top, left }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: event.color }} />
          <h3 className="font-medium text-gcal-text text-base leading-tight">{event.title}</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gcal-light">
          <X size={16} />
        </button>
      </div>

      {/* Date/time */}
      <div className="flex items-center gap-2 text-sm text-gcal-light mb-2">
        <Clock size={14} />
        <span>
          {format(startDate, 'EEE, MMM d')} · {formatEventTime(startDate, endDate)}
        </span>
      </div>

      {/* Location */}
      {event.location && (
        <div className="flex items-center gap-2 text-sm text-gcal-light mb-2">
          <MapPin size={14} />
          <span className="truncate">{event.location}</span>
        </div>
      )}

      {/* Description */}
      {event.description && (
        <div className="flex items-start gap-2 text-sm text-gcal-light mb-3">
          <AlignLeft size={14} className="mt-0.5 shrink-0" />
          <span className="line-clamp-2">{event.description}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-1 border-t border-gcal-border pt-3 mt-2">
        <button
          onClick={() => { onEdit(event); onClose() }}
          className="p-2 rounded-full hover:bg-gray-100 text-gcal-light transition-colors"
          title="Edit"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => { onDelete(event.id); onClose() }}
          className="p-2 rounded-full hover:bg-red-50 text-gcal-light hover:text-red-600 transition-colors"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
