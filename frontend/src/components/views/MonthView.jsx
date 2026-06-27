import { format, isSameMonth, isToday, isSameDay } from 'date-fns'
import { getMonthGrid } from '../../utils/dateUtils'
import { useCalendarStore } from '../../store/calendarStore'
import { useEventStore } from '../../store/eventStore'
import { useSettingsStore } from '../../store/settingsStore'
import clsx from 'clsx'

const DAY_HEADERS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function MonthView() {
  const { currentDate } = useCalendarStore()
  const { events, openCreateModal, openEditModal, deleteEvent } = useEventStore()
  const { weekStartsOn, showWeekends } = useSettingsStore()
  
  let headers = [...DAY_HEADERS.slice(weekStartsOn), ...DAY_HEADERS.slice(0, weekStartsOn)]
  let grid = getMonthGrid(currentDate, weekStartsOn)
  
  if (!showWeekends) {
    headers = headers.filter((h) => h !== 'Sun' && h !== 'Sat')
    grid = grid.filter((day) => day.getDay() !== 0 && day.getDay() !== 6)
  }

  const getDayEvents = (day) =>
    events.filter((e) => isSameDay(new Date(e.start_time), day))

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-gcal-surface">
      {/* Day headers */}
      <div className={clsx("grid border-b border-gcal-border", showWeekends ? "grid-cols-7" : "grid-cols-5")}>
        {headers.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-gcal-light py-2 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className={clsx("grid flex-1 overflow-hidden", showWeekends ? "grid-cols-7" : "grid-cols-5")}>
        {grid.map((day, i) => {
          const dayEvents = getDayEvents(day)
          const inMonth   = isSameMonth(day, currentDate)
          const todayDate = isToday(day)
          const visible   = dayEvents.slice(0, 3)
          const overflow  = dayEvents.length - 3

          return (
            <div
              key={i}
              onClick={() => openCreateModal({ start: day, end: day })}
              className={clsx(
                'border-b border-r border-gcal-border p-1 min-h-[100px] cursor-pointer hover:bg-gray-50 transition-colors',
                !inMonth && 'bg-gray-50/50'
              )}
            >
              {/* Date number */}
              <div className="flex justify-center mb-1">
                <span className={clsx(
                  'w-7 h-7 flex items-center justify-center text-sm rounded-full',
                  todayDate ? 'bg-gcal-blue text-white font-bold' : inMonth ? 'text-gcal-text' : 'text-gcal-light'
                )}>
                  {format(day, 'd')}
                </span>
              </div>

              {/* Events */}
              <div className="space-y-0.5">
                {visible.map((e) => (
                  <div
                    key={e.id}
                    onClick={(ev) => { ev.stopPropagation(); openEditModal(e) }}
                    className="text-[11px] text-white px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-90"
                    style={{ backgroundColor: e.color }}
                  >
                    {e.title}
                  </div>
                ))}
                {overflow > 0 && (
                  <div className="text-[11px] text-gcal-light px-1.5">
                    +{overflow} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
