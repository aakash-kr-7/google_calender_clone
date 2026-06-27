import clsx from 'clsx'
import { format } from 'date-fns'
import { isSameDay } from '../../utils/dateUtils'

export default function AllDayRow({ days, events }) {
  const allDayEvents = events.filter((e) => e.is_all_day)

  return (
    <div className="flex border-b border-gcal-border">
      {/* Time label spacer */}
      <div className="w-16 shrink-0 text-[10px] text-gcal-light flex items-center justify-end pr-2 py-1">
        all-day
      </div>
      {/* One column per day */}
      {days.map((day, i) => {
        const dayEvents = allDayEvents.filter((e) => isSameDay(new Date(e.start_time), day))
        return (
          <div key={i} className="flex-1 min-h-[24px] border-l border-gcal-border py-0.5 px-1 space-y-0.5">
            {dayEvents.map((e) => (
              <div
                key={e.id}
                className="text-[11px] text-white px-1.5 rounded truncate"
                style={{ backgroundColor: e.color }}
              >
                {e.title}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
