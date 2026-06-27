import { useState, useEffect, useRef } from 'react'
import { Search, Calendar, Moon, Sun, Plus, ArrowRight, CornerDownLeft, Sparkles, Clock, MapPin } from 'lucide-react'
import { useCalendarStore } from '../../store/calendarStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useEventStore } from '../../store/eventStore'
import { format } from 'date-fns'

export default function CommandPalette({ isOpen, onClose }) {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  const { goToToday, navigateNext, navigatePrev, setViewMode, setCurrentDate } = useCalendarStore()
  const { toggleDarkMode, darkMode } = useSettingsStore()
  const { events, openCreateModal, openEditModal } = useEventStore()

  // Reset search and selected item when opened/closed
  useEffect(() => {
    if (isOpen) {
      setSearch('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!isOpen) return null

  // Natural Language Date Parser for Jump to Date
  const parseDateJump = (str) => {
    const query = str.toLowerCase().trim()
    if (!query) return null

    const today = new Date()
    
    if (query === 'today') return today
    
    if (query === 'tomorrow') {
      const d = new Date()
      d.setDate(d.getDate() + 1)
      return d
    }
    
    if (query === 'yesterday') {
      const d = new Date()
      d.setDate(d.getDate() - 1)
      return d
    }

    if (query === 'next week') {
      const d = new Date()
      d.setDate(d.getDate() + 7)
      return d
    }

    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayIdx = daysOfWeek.indexOf(query)
    if (dayIdx !== -1) {
      const d = new Date()
      const currentDay = d.getDay()
      let diff = dayIdx - currentDay
      if (diff <= 0) diff += 7 // move to next week's day
      d.setDate(d.getDate() + diff)
      return d
    }

    // Try parsing standard date
    const parsedTime = Date.parse(str)
    if (!isNaN(parsedTime)) {
      return new Date(parsedTime)
    }

    return null
  }

  const parsedDateJump = parseDateJump(search)

  // Actions / Static Commands
  const staticCommands = [
    {
      id: 'new_event',
      title: 'Create New Event',
      subtitle: 'Opens creation dialog',
      shortcut: 'C',
      icon: Plus,
      action: () => {
        onClose()
        openCreateModal({ start: new Date() })
      }
    },
    {
      id: 'today',
      title: 'Go to Today',
      subtitle: 'Jump to current date',
      shortcut: 'T',
      icon: Calendar,
      action: () => {
        onClose()
        goToToday()
      }
    },
    {
      id: 'next_week',
      title: 'Next Week',
      subtitle: 'Move date range forward',
      shortcut: 'N',
      icon: ArrowRight,
      action: () => {
        onClose()
        navigateNext()
      }
    },
    {
      id: 'prev_week',
      title: 'Previous Week',
      subtitle: 'Move date range backward',
      shortcut: 'P',
      icon: ArrowRight,
      action: () => {
        onClose()
        navigatePrev()
      }
    },
    {
      id: 'view_month',
      title: 'Switch to Month View',
      subtitle: 'Change density layout to 35-day grid',
      shortcut: 'M',
      icon: Calendar,
      action: () => {
        onClose()
        setViewMode('month')
      }
    },
    {
      id: 'view_week',
      title: 'Switch to Week View',
      subtitle: 'Change layout to weekly column grid',
      shortcut: 'W',
      icon: Calendar,
      action: () => {
        onClose()
        setViewMode('week')
      }
    },
    {
      id: 'view_day',
      title: 'Switch to Day View',
      subtitle: 'Change layout to single day hourly column',
      shortcut: 'D',
      icon: Calendar,
      action: () => {
        onClose()
        setViewMode('day')
      }
    },
    {
      id: 'theme',
      title: `Toggle ${darkMode ? 'Light' : 'Dark'} Mode`,
      subtitle: `Switch visual palette`,
      shortcut: 'G D',
      icon: darkMode ? Sun : Moon,
      action: () => {
        onClose()
        toggleDarkMode()
      }
    }
  ]

  // Filter commands by search text
  const filteredCommands = staticCommands.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.subtitle.toLowerCase().includes(search.toLowerCase())
  )

  // Event search results from loaded store events
  const matchingEvents = search.trim()
    ? events.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(search.toLowerCase())) ||
        (e.location && e.location.toLowerCase().includes(search.toLowerCase()))
      ).map(e => ({
        id: `event_${e.id}`,
        title: e.title,
        subtitle: `Event on ${format(new Date(e.start_time), 'MMM d, h:mm a')}`,
        icon: Sparkles,
        color: e.color,
        action: () => {
          onClose()
          setCurrentDate(new Date(e.start_time))
          openEditModal(e)
        }
      }))
    : []

  // Combine items
  const items = []

  // 1. If date jump is parsed successfully, show it at the very top
  if (parsedDateJump) {
    items.push({
      id: 'jump_to_date',
      title: `Jump to: ${format(parsedDateJump, 'EEEE, MMMM d, yyyy')}`,
      subtitle: 'Press Enter to jump calendar to this date',
      icon: Calendar,
      action: () => {
        onClose()
        setCurrentDate(parsedDateJump)
      }
    })
  }

  // 2. Add filtered commands
  items.push(...filteredCommands)

  // 3. Add search matches
  items.push(...matchingEvents)

  // Keyboard navigation logic
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (items[selectedIndex]) {
        items[selectedIndex].action()
      }
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-150"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-gcal-surface border border-gcal-border rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[50vh] text-gcal-text">
        {/* Search header */}
        <div className="flex items-center gap-3 px-4 border-b border-gcal-border py-3 bg-gcal-surface">
          <Search className="text-gcal-light shrink-0" size={18} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, search events, or jump to date (e.g. 'tomorrow')..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder-gray-400 text-gcal-text"
          />
          <kbd className="text-[10px] bg-gcal-hover border border-gcal-border text-gcal-light rounded px-1.5 py-0.5 select-none font-mono">
            ESC
          </kbd>
        </div>

        {/* Action list */}
        <div className="flex-1 overflow-y-auto py-2 divide-y divide-gcal-border/10">
          {items.length > 0 ? (
            items.map((item, idx) => {
              const Icon = item.icon
              const isSelected = idx === selectedIndex
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors duration-150 ${
                    isSelected ? 'bg-gcal-hover' : 'bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="shrink-0 p-1.5 rounded-lg bg-gcal-hover/80 text-gcal-light flex items-center justify-center relative">
                      {item.color && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                      )}
                      <Icon size={16} className={isSelected ? 'text-gcal-blue' : 'text-gcal-light'} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate leading-tight">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-gcal-light truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Actions indicators */}
                  <div className="flex items-center gap-2 shrink-0">
                    {item.shortcut && (
                      <kbd className="text-[9px] bg-gcal-surface border border-gcal-border text-gcal-light rounded px-1.5 py-0.5 font-mono">
                        {item.shortcut}
                      </kbd>
                    )}
                    {isSelected && (
                      <CornerDownLeft size={12} className="text-gcal-blue/70 animate-pulse" />
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8 text-xs text-gcal-light">
              No matching commands or events found. Try searching for "Today", "Month", or event titles.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
