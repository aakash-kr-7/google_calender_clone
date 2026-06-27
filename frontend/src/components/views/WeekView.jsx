import { format, isToday } from 'date-fns'
import { getWeekDays } from '../../utils/dateUtils'
import { useCalendarStore } from '../../store/calendarStore'
import { useEventStore } from '../../store/eventStore'
import { useSettingsStore } from '../../store/settingsStore'
import TimeGrid from '../calendar/TimeGrid'
import AllDayRow from '../calendar/AllDayRow'
import clsx from 'clsx'

export default function WeekView() {
  const { currentDate } = useCalendarStore()
  const { events } = useEventStore()
  const { weekStartsOn, showWeekends } = useSettingsStore()
  
  let days = getWeekDays(currentDate, weekStartsOn)
  if (!showWeekends) {
    days = days.filter((d) => d.getDay() !== 0 && d.getDay() !== 6)
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Column headers */}
      <div className="flex shrink-0 border-b border-gcal-border bg-gcal-surface">
        <div className="w-16 shrink-0" /> {/* spacer for time labels */}
        {days.map((day, i) => (
          <div
            key={i}
            className={clsx(
              'flex-1 flex flex-col items-center py-2 border-l border-gcal-border',
              isToday(day) && 'text-gcal-blue'
            )}
          >
            <span className="text-[11px] font-medium uppercase tracking-wide">
              {format(day, 'EEE')}
            </span>
            <span className={clsx(
              'text-2xl font-normal leading-tight',
              isToday(day) && 'bg-gcal-blue text-white w-9 h-9 rounded-full flex items-center justify-center text-xl'
            )}>
              {format(day, 'd')}
            </span>
          </div>
        ))}
      </div>

      {/* All-day events row */}
      <AllDayRow days={days} events={events} />

      {/* Time grid */}
      <TimeGrid days={days} events={events} />
    </div>
  )
}
