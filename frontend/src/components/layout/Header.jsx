import { Menu, ChevronLeft, ChevronRight, Search, Settings } from 'lucide-react'
import { format } from 'date-fns'
import { useCalendarStore } from '../../store/calendarStore'
import { useSettingsStore } from '../../store/settingsStore'
import clsx from 'clsx'

const VIEW_LABELS = { day: 'Day', week: 'Week', month: 'Month' }

function getPeriodTitle(date, viewMode) {
  if (viewMode === 'month') return format(date, 'MMMM yyyy')
  if (viewMode === 'week') {
    const start = new Date(date)
    start.setDate(date.getDate() - date.getDay())
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    if (start.getMonth() === end.getMonth())
      return `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`
  }
  return format(date, 'EEEE, MMMM d, yyyy')
}

export default function Header() {
  const { currentDate, viewMode, navigatePrev, navigateNext, goToToday, setViewMode, toggleSidebar } = useCalendarStore()
  const { openSettings } = useSettingsStore()
  const userEmail = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : 'U'
  const initial = userEmail[0].toUpperCase()

  return (
    <header className="h-16 bg-gcal-surface border-b border-gcal-border flex items-center px-4 gap-3 shrink-0">
      {/* Left */}
      <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-gray-100 text-gcal-light">
        <Menu size={20} />
      </button>
      <div className="flex items-center gap-1.5 mr-4">
        <span className="text-xl font-medium text-gcal-text">Calendar</span>
      </div>

      {/* Center nav */}
      <button
        onClick={goToToday}
        className="px-3.5 py-1.5 text-sm border border-gcal-border rounded hover:bg-gray-50 text-gcal-text font-medium"
      >
        Today
      </button>
      <button onClick={navigatePrev} className="p-1.5 rounded-full hover:bg-gray-100 text-gcal-light">
        <ChevronLeft size={20} />
      </button>
      <button onClick={navigateNext} className="p-1.5 rounded-full hover:bg-gray-100 text-gcal-light">
        <ChevronRight size={20} />
      </button>
      <h1 className="text-[22px] font-normal text-gcal-text flex-1">
        {getPeriodTitle(currentDate, viewMode)}
      </h1>

      {/* Right */}
      <button className="p-2 rounded-full hover:bg-gray-100 text-gcal-light">
        <Search size={20} />
      </button>

      {/* View switcher */}
      <div className="flex border border-gcal-border rounded overflow-hidden text-sm">
        {['day','week','month'].map((v) => (
          <button
            key={v}
            onClick={() => setViewMode(v)}
            className={clsx(
              'border-r border-gcal-border last:border-0 px-3 py-1.5 capitalize transition-colors',
              viewMode === v ? 'bg-blue-50 text-gcal-blue font-medium' : 'text-gcal-text hover:bg-gray-50'
            )}
          >
            {VIEW_LABELS[v]}
          </button>
        ))}
      </div>

      <button onClick={openSettings} className="p-2 rounded-full hover:bg-gcal-border/20 text-gcal-light">
        <Settings size={20} />
      </button>

      {/* User avatar */}
      <div className="w-8 h-8 rounded-full bg-gcal-blue flex items-center justify-center text-white text-sm font-medium">
        {initial}
      </div>
    </header>
  )
}
