import Header from './Header'
import Sidebar from './Sidebar'
import EventModal from '../events/EventModal'
import MonthView from '../views/MonthView'
import WeekView from '../views/WeekView'
import DayView from '../views/DayView'
import { useCalendarStore } from '../../store/calendarStore'
import { useEvents } from '../../hooks/useEvents'
import { Toaster } from 'react-hot-toast'

export default function Layout() {
  useEvents() // triggers fetches when date/view changes
  const { viewMode } = useCalendarStore()

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gcal-bg">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {viewMode === 'month' && <MonthView />}
          {viewMode === 'week'  && <WeekView />}
          {viewMode === 'day'   && <DayView />}
        </main>
      </div>
      <EventModal />
      <Toaster position="bottom-center" />
    </div>
  )
}
