import { Users, MapPin, AlignLeft, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { formatEventTime } from '../../utils/dateUtils'

export default function EventHoverPreview({ event, position }) {
  if (!event || !position) return null

  // Ensure tooltip stays inside the viewport bounds
  const top = Math.min(position.y, window.innerHeight - 250)
  const left = Math.min(position.x, window.innerWidth - 300)

  const startDate = new Date(event.start_time)
  const endDate = new Date(event.end_time)

  // Parse attendees list
  const attendeeList = event.attendees
    ? event.attendees.split(',').map((email) => email.trim()).filter(Boolean)
    : []

  return (
    <div
      className="popover-enter fixed z-[9999] w-72 bg-gcal-surface border border-gcal-border/50 rounded-xl shadow-xl p-4 pointer-events-none select-none"
      style={{ top, left }}
    >
      {/* Visual left color bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl" style={{ backgroundColor: event.color }} />

      <div className="pl-2 space-y-3">
        {/* Title */}
        <div>
          <h4 className="font-semibold text-gcal-text text-sm leading-snug break-words">
            {event.title}
          </h4>
        </div>

        {/* Time */}
        <div className="flex items-center gap-2 text-xs text-gcal-light">
          <Clock size={12} className="shrink-0" />
          <span>
            {format(startDate, 'EEEE, MMM d')} · {formatEventTime(startDate, endDate)}
          </span>
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-2 text-xs text-gcal-light">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div className="flex items-start gap-2 text-xs text-gcal-light">
            <AlignLeft size={12} className="mt-0.5 shrink-0" />
            <span className="line-clamp-3 break-words">{event.description}</span>
          </div>
        )}

        {/* Attendees */}
        {attendeeList.length > 0 && (
          <div className="space-y-1 pt-1 border-t border-gcal-border/30">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gcal-light uppercase tracking-wider">
              <Users size={11} />
              <span>Guests ({attendeeList.length})</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {attendeeList.map((email, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-gcal-hover text-gcal-text rounded-full text-[10px] truncate max-w-full"
                  title={email}
                >
                  {email}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
