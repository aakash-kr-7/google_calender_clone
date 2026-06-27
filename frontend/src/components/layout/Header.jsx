import { useState } from 'react'
import { Menu, ChevronLeft, ChevronRight, Search, Settings, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { useCalendarStore } from '../../store/calendarStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useEventStore } from '../../store/eventStore'
import toast from 'react-hot-toast'
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
  const { currentDate, viewMode, navigatePrev, navigateNext, goToToday, setViewMode, toggleSidebar, setCurrentDate } = useCalendarStore()
  const { openSettings, compactMode, toggleCompactMode } = useSettingsStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  const userData = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  const userEmail = userData?.email || 'user@example.com'
  const userName = userData?.name || userEmail.split('@')[0]
  const userPicture = userData?.picture || ''
  const initial = userEmail[0].toUpperCase()

  const [searchQuery, setSearchQuery] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)

  const { events, openEditModal } = useEventStore()
  
  const searchResults = searchQuery.trim() 
    ? events.filter(e => 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.location && e.location.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : []

  const handleSearchResultClick = (event) => {
    setSearchQuery('')
    setCurrentDate(new Date(event.start_time))
    openEditModal(event)
  }

  const handleSignOut = () => {
    setProfileOpen(false)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success("Successfully logged out!")
    setTimeout(() => {
      window.location.href = '/login'
    }, 500)
  }

  const handleResetData = async () => {
    setDropdownOpen(false)
    if (window.confirm("Are you sure you want to clear all calendar events?")) {
      const { events, deleteEvent } = useEventStore.getState()
      if (events.length === 0) {
        toast.error("No events to clear!")
        return
      }
      const loader = toast.loading("Clearing calendar...")
      try {
        for (const e of events) {
          await deleteEvent(e.id)
        }
        toast.dismiss(loader)
        toast.success("All calendar events cleared!")
      } catch {
        toast.dismiss(loader)
        toast.error("Failed to clear some events")
      }
    }
  }

  return (
    <header className="h-16 bg-gcal-surface border-b border-gcal-border flex items-center px-4 gap-3 shrink-0">
      {/* Left */}
      <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-gcal-hover text-gcal-light">
        <Menu size={20} />
      </button>
      <div className="flex items-center gap-1.5 mr-4">
        <span className="text-xl font-medium text-gcal-text">Calendar</span>
      </div>

      {/* Center nav */}
      <button
        onClick={goToToday}
        className="px-3.5 py-1.5 text-sm border border-gcal-border rounded hover:bg-gcal-hover text-gcal-text font-medium bg-gcal-surface"
      >
        Today
      </button>
      <button onClick={navigatePrev} className="p-1.5 rounded-full hover:bg-gcal-hover text-gcal-light">
        <ChevronLeft size={20} />
      </button>
      <button onClick={navigateNext} className="p-1.5 rounded-full hover:bg-gcal-hover text-gcal-light">
        <ChevronRight size={20} />
      </button>
      <h1 className="text-[22px] font-normal text-gcal-text flex-1">
        {getPeriodTitle(currentDate, viewMode)}
      </h1>

      {/* Search bar */}
      <div className="relative flex-1 max-w-sm mx-4 hidden md:block z-30">
        <div className="flex items-center gap-2 bg-gcal-hover border border-transparent focus-within:border-gcal-blue focus-within:bg-gcal-surface focus-within:shadow-md rounded-lg px-3 py-1.5 transition">
          <Search size={18} className="text-gcal-light shrink-0" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-gcal-text focus:outline-none w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gcal-light hover:text-gcal-text focus:outline-none">
              <X size={16} />
            </button>
          )}
        </div>
        
        {/* Search Results Dropdown */}
        {searchQuery && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setSearchQuery('')} />
            <div className="absolute left-0 right-0 mt-1 bg-gcal-surface border border-gcal-border rounded-lg shadow-xl py-1.5 max-h-60 overflow-y-auto z-40">
              {searchResults.length > 0 ? (
                searchResults.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => handleSearchResultClick(e)}
                    className="w-full text-left px-4 py-2 hover:bg-gcal-hover flex items-center justify-between text-xs transition-colors focus:outline-none border-b border-gcal-border/10 last:border-0"
                  >
                    <div className="truncate flex-1 pr-3">
                      <div className="font-semibold text-gcal-text text-sm truncate flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                        {e.title}
                      </div>
                      <div className="text-gcal-light text-[10px] truncate mt-0.5">{e.description || 'No description'}</div>
                    </div>
                    <span className="text-[10px] text-gcal-light font-mono shrink-0">
                      {format(new Date(e.start_time), 'MMM d')}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-xs text-gcal-light text-center">No matching events found</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* View switcher */}
      <div className="flex border border-gcal-border rounded overflow-hidden text-sm">
        {['day','week','month'].map((v) => (
          <button
            key={v}
            onClick={() => setViewMode(v)}
            className={clsx(
              'border-r border-gcal-border last:border-0 px-3 py-1.5 capitalize transition-colors bg-gcal-surface',
              viewMode === v ? 'bg-blue-50 dark:bg-blue-950/40 text-gcal-blue font-medium' : 'text-gcal-text hover:bg-gcal-hover'
            )}
          >
            {VIEW_LABELS[v]}
          </button>
        ))}
      </div>

      <div className="relative">
        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)} 
          className="p-2 rounded-full hover:bg-gcal-hover text-gcal-light focus:outline-none"
        >
          <Settings size={20} />
        </button>
        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 mt-1 w-52 bg-gcal-surface border border-gcal-border rounded-lg shadow-lg py-1.5 z-30 animate-in fade-in slide-in-from-top-1 duration-100">
              <button 
                onClick={() => { openSettings(); setDropdownOpen(false) }} 
                className="w-full text-left px-4 py-2 text-sm text-gcal-text hover:bg-gcal-hover transition-colors"
              >
                Settings
              </button>
              <button 
                onClick={() => { toggleCompactMode(); setDropdownOpen(false) }} 
                className="w-full text-left px-4 py-2 text-sm text-gcal-text hover:bg-gcal-hover flex justify-between items-center transition-colors"
              >
                <span>Compact density</span>
                {compactMode && <Check size={14} className="text-gcal-blue" />}
              </button>
              <div className="border-t border-gcal-border my-1" />
              <button 
                onClick={handleResetData} 
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors font-medium"
              >
                Reset Calendar Data
              </button>
            </div>
          </>
        )}
      </div>

      {/* User profile avatar */}
      <div className="relative">
        <button 
          onClick={() => setProfileOpen(!profileOpen)}
          className="w-8 h-8 rounded-full bg-gcal-blue hover:opacity-90 flex items-center justify-center text-white text-sm font-medium focus:outline-none border-2 border-transparent hover:border-gcal-border overflow-hidden"
        >
          {userPicture ? (
            <img src={userPicture} alt={userName} className="w-full h-full object-cover" />
          ) : (
            initial
          )}
        </button>
        {profileOpen && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setProfileOpen(false)} />
            <div className="absolute right-0 mt-2 w-80 bg-gcal-surface border border-gcal-border rounded-2xl shadow-2xl p-6 z-30 animate-in fade-in slide-in-from-top-1 duration-100 flex flex-col items-center text-center">
              
              {/* Header profile info */}
              <div className="w-16 h-16 rounded-full bg-gcal-blue flex items-center justify-center text-white text-2xl font-medium overflow-hidden mb-3 border border-gcal-border/25 shadow">
                {userPicture ? (
                  <img src={userPicture} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              <h3 className="font-semibold text-gcal-text text-base leading-tight">{userName}</h3>
              <p className="text-xs text-gcal-light font-mono mt-0.5 mb-4">{userEmail}</p>
              
              <a 
                href="https://myaccount.google.com/" 
                target="_blank" 
                rel="noreferrer"
                className="w-full border border-gcal-border rounded-full py-2 text-xs font-semibold text-gcal-text hover:bg-gcal-hover transition mb-4 block"
              >
                Manage your Google Account
              </a>
              
              <div className="w-full border-t border-gcal-border my-2" />
              
              <button 
                onClick={handleSignOut} 
                className="w-full bg-gcal-surface border border-gcal-border hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 rounded-full py-2 text-xs font-semibold transition mt-2 flex items-center justify-center gap-2"
              >
                Sign out
              </button>
              
              {/* Footer info */}
              <div className="flex gap-2.5 text-[10px] text-gcal-light mt-6 font-medium">
                <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="hover:underline">Privacy Policy</a>
                <span>•</span>
                <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="hover:underline">Terms of Service</a>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
