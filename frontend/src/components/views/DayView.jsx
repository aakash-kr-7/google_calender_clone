import { format, isToday } from 'date-fns'
import { useCalendarStore } from '../../store/calendarStore'
import { useEventStore } from '../../store/eventStore'
import TimeGrid from '../calendar/TimeGrid'
import AllDayRow from '../calendar/AllDayRow'

export default function DayView() {
  const { currentDate } = useCalendarStore()
  const { events } = useEventStore()
  const days = [currentDate]

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex shrink-0 border-b border-gcal-border bg-white">
        <div className="w-16 shrink-0" />
        <div className="flex-1 flex flex-col items-start py-2 px-4">
          <span className="text-[11px] font-medium uppercase tracking-wide text-gcal-light">
            {format(currentDate, 'EEE')}
          </span>
          <span className={`text-3xl font-light ${isToday(currentDate) ? 'text-gcal-blue' : 'text-gcal-text'}`}>
            {format(currentDate, 'd')}
          </span>
          <span className="text-sm text-gcal-light">{format(currentDate, 'MMMM yyyy')}</span>
        </div>
      </div>
      <AllDayRow days={days} events={events} />
      <TimeGrid days={days} events={events} />
    </div>
  )
}
