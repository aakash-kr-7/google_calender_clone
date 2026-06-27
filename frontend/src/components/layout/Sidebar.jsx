import { Plus } from 'lucide-react'
import MiniCalendar from '../calendar/MiniCalendar'
import { useCalendarStore } from '../../store/calendarStore'
import { useEventStore } from '../../store/eventStore'
import clsx from 'clsx'

const MY_CALENDARS = [
  { name: 'My Calendar', color: '#1a73e8' },
  { name: 'Birthdays',   color: '#33b679' },
  { name: 'Holidays',    color: '#039be5' },
]

export default function Sidebar() {
  const { sidebarOpen } = useCalendarStore()
  const { openCreateModal } = useEventStore()

  return (
    <aside
      className={clsx(
        'sidebar-transition bg-white shrink-0 flex flex-col overflow-hidden border-r border-gcal-border',
        sidebarOpen ? 'w-64' : 'w-0'
      )}
    >
      <div className="w-64 flex flex-col">
        {/* Create button */}
        <div className="p-4">
          <button
            onClick={() => openCreateModal()}
            className="flex items-center gap-3 bg-white shadow-md rounded-2xl px-5 py-3 hover:shadow-lg transition-shadow text-gcal-text text-sm font-medium w-full"
          >
            <Plus size={20} className="text-gcal-text" />
            Create
          </button>
        </div>

        {/* Mini calendar */}
        <MiniCalendar />

        {/* Divider */}
        <div className="border-t border-gcal-border mx-4 my-3" />

        {/* My calendars */}
        <div className="px-4">
          <p className="text-[11px] font-semibold text-gcal-light uppercase tracking-wider mb-2">
            My calendars
          </p>
          {MY_CALENDARS.map((cal) => (
            <div key={cal.name} className="flex items-center gap-3 py-1.5">
              <span className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: cal.color }} />
              <span className="text-sm text-gcal-text">{cal.name}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
