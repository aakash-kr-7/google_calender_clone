import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, isSameDay, isToday, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns'
import { getMonthGrid, getWeekDays } from '../../utils/dateUtils'
import { useCalendarStore } from '../../store/calendarStore'
import { useSettingsStore } from '../../store/settingsStore'
import clsx from 'clsx'

export default function MiniCalendar() {
  // miniDate is INDEPENDENT of the main calendar's currentDate
  const [miniDate, setMiniDate] = useState(new Date())
  const { currentDate, setCurrentDate, viewMode } = useCalendarStore()
  const { weekStartsOn } = useSettingsStore()

  const grid = getMonthGrid(miniDate, weekStartsOn)
  const baseWeekDays = ['S','M','T','W','T','F','S']
  const weekDays = [...baseWeekDays.slice(weekStartsOn), ...baseWeekDays.slice(0, weekStartsOn)]

  // Highlight the entire week if in week view
  const weekStart = startOfWeek(currentDate, { weekStartsOn })
  const weekEnd   = endOfWeek(currentDate,   { weekStartsOn })
  const inCurrentWeek = (d) => viewMode === 'week' && d >= weekStart && d <= weekEnd

  const handleDayClick = (day) => {
    setCurrentDate(day)
  }

  return (
    <div className="px-3 py-2 select-none">
      {/* Month header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gcal-text">
          {format(miniDate, 'MMMM yyyy')}
        </span>
        <div className="flex gap-1">
          <button onClick={() => setMiniDate(subMonths(miniDate, 1))} className="p-1 rounded-full hover:bg-gcal-hover">
            <ChevronLeft size={14} className="text-gcal-text" />
          </button>
          <button onClick={() => setMiniDate(addMonths(miniDate, 1))} className="p-1 rounded-full hover:bg-gcal-hover">
            <ChevronRight size={14} className="text-gcal-text" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {weekDays.map((d, i) => (
          <div key={i} className="text-center text-[10px] text-gcal-light font-medium py-0.5">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {grid.map((day, i) => {
          const isCurrentMonth = day.getMonth() === miniDate.getMonth()
          const isSelected     = isSameDay(day, currentDate)
          const isTodayDate    = isToday(day)
          const inWeek         = inCurrentWeek(day)

          return (
            <button
              key={i}
              onClick={() => handleDayClick(day)}
              className={clsx(
                'w-7 h-7 mx-auto flex items-center justify-center rounded-full text-[11px] transition-colors focus:outline-none',
                !isCurrentMonth && 'text-gcal-light opacity-50',
                isCurrentMonth && !isSelected && !isTodayDate && 'text-gcal-text hover:bg-gcal-hover',
                isTodayDate && !isSelected && 'text-gcal-blue font-bold animate-spring-pop',
                isSelected && 'bg-gcal-blue text-white font-bold animate-spring-pop',
                inWeek && !isSelected && 'bg-blue-50 dark:bg-blue-950/40',
              )}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}
