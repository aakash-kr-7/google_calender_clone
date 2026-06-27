import { useState, useEffect } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import EventModal from '../events/EventModal'
import SettingsModal from './SettingsModal'
import MonthView from '../views/MonthView'
import WeekView from '../views/WeekView'
import DayView from '../views/DayView'
import CommandPalette from './CommandPalette'
import { useCalendarStore } from '../../store/calendarStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useEventStore } from '../../store/eventStore'
import { useEvents } from '../../hooks/useEvents'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { Sun, Moon, Sparkles } from 'lucide-react'

// Skeleton loading layout that mirrors Month/Week/Day grids with beautiful shimmer gradients
function CalendarSkeleton({ viewMode }) {
  if (viewMode === 'month') {
    return (
      <div className="flex flex-col flex-1 overflow-hidden bg-gcal-surface">
        <div className="grid grid-cols-7 border-b border-gcal-border">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="py-2 flex justify-center">
              <div className="w-12 h-3 bg-gcal-hover rounded shimmer" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 overflow-hidden">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="border-b border-r border-gcal-border p-2 space-y-2 min-h-[100px]">
              <div className="w-6 h-6 bg-gcal-hover rounded-full mx-auto shimmer" />
              <div className="w-4/5 h-3.5 bg-gcal-hover rounded shimmer" />
              <div className="w-2/3 h-3.5 bg-gcal-hover rounded shimmer" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const cols = viewMode === 'week' ? 7 : 1
  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-gcal-surface">
      <div className="flex border-b border-gcal-border">
        <div className="w-16 shrink-0 border-r border-gcal-border" />
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex-1 py-3 flex flex-col items-center gap-1.5 border-l border-gcal-border">
            <div className="w-8 h-3 bg-gcal-hover rounded shimmer" />
            <div className="w-9 h-9 bg-gcal-hover rounded-full shimmer" />
          </div>
        ))}
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-16 shrink-0 border-r border-gcal-border space-y-9 py-4 select-none pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-3 w-8 bg-gcal-hover rounded mx-auto shimmer" />
          ))}
        </div>
        <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, colIdx) => (
            <div key={colIdx} className="border-l border-gcal-border p-4 relative space-y-12 select-none pointer-events-none">
              {colIdx % 2 === 0 ? (
                <>
                  <div className="absolute top-[20%] left-4 right-4 h-14 bg-gcal-hover rounded shimmer" />
                  <div className="absolute top-[50%] left-4 right-4 h-20 bg-gcal-hover rounded shimmer" />
                </>
              ) : (
                <div className="absolute top-[35%] left-4 right-4 h-16 bg-gcal-hover rounded shimmer" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Layout() {
  useEvents() // triggers fetches when date/view changes
  const { viewMode } = useCalendarStore()
  const { loading } = useEventStore()
  
  const [showThemePrompt, setShowThemePrompt] = useState(false)
  const [promptStep, setPromptStep] = useState(1)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  useEffect(() => {
    const prompted = localStorage.getItem('gcal-theme-prompted')
    if (prompted !== 'true') {
      setShowThemePrompt(true)
    }
  }, [])

  // Check and restore draft event on mount
  useEffect(() => {
    const { loadDraft, openCreateModal } = useEventStore.getState()
    const draft = loadDraft()
    if (draft) {
      // Auto open modal and let user restore/dismiss
      openCreateModal()
      toast.success('Recovered your unsaved draft!', {
        id: 'draft-recovery',
        duration: 4000,
      })
    }
  }, [])

  // Listen for Ctrl+K/Cmd+K to toggle the command palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleThemeSelect = (isDark) => {
    const { setDarkMode } = useSettingsStore.getState()
    setDarkMode(isDark)
    setPromptStep(2)
  }

  const handleWelcomeDismiss = () => {
    localStorage.setItem('gcal-theme-prompted', 'true')
    setShowThemePrompt(false)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gcal-bg text-gcal-text relative transition-colors duration-200">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {loading ? (
            <CalendarSkeleton viewMode={viewMode} />
          ) : (
            <div key={viewMode} className="flex-1 flex flex-col overflow-hidden animate-view-transition">
              {viewMode === 'month' && <MonthView />}
              {viewMode === 'week'  && <WeekView />}
              {viewMode === 'day'   && <DayView />}
            </div>
          )}
        </main>
      </div>
      <EventModal />
      <SettingsModal />
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      <Toaster position="bottom-center" />

      {/* Theme Choice Pop-up at First Launch */}
      {showThemePrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]"
             style={{ animation: 'fadeIn 0.2s ease' }}>
          <div className="relative overflow-hidden rounded-[20px] border border-gcal-border shadow-2xl w-full max-w-[420px] mx-4 bg-gcal-surface">

            <div className="relative px-9 pt-10 pb-8 flex flex-col items-center text-center">

              {promptStep === 1 ? (
                <>
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-5"
                       style={{ background: 'var(--gcal-blue-light, rgba(26,115,232,0.1))', border: '0.5px solid var(--gcal-blue-border, rgba(26,115,232,0.25))' }}>
                    <Sparkles className="w-[22px] h-[22px] text-gcal-blue" />
                  </div>

                  <p className="text-[11px] font-medium tracking-[0.1em] uppercase mb-2 text-gcal-blue">
                    Welcome
                  </p>
                  <h2 className="text-[20px] font-semibold leading-snug mb-2 text-gcal-text"
                      style={{ letterSpacing: '-0.02em' }}>
                    Set your look
                  </h2>
                  <p className="text-[13px] leading-relaxed mb-8 px-2 text-gcal-text-secondary">
                    Pick a visual theme to get started. Swap it anytime in settings.
                  </p>

                  {/* Theme cards */}
                  <div className="grid grid-cols-2 gap-2.5 w-full mb-6">
                    {/* Light */}
                    <button
                      onClick={() => handleThemeSelect(false)}
                      className="group flex flex-col items-center gap-2.5 rounded-[14px] p-4 transition-all duration-150 focus:outline-none cursor-pointer border border-gcal-border bg-gcal-hover hover:border-gcal-blue"
                      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,115,232,0.15)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)' }}>
                      {/* Mini preview */}
                      <div className="w-full h-[52px] rounded-lg overflow-hidden border border-gcal-border"
                           style={{ background: '#fff' }}>
                        <div style={{ height: 4, background: 'var(--gcal-blue, #1a73e8)' }} />
                        <div className="flex flex-col gap-1 p-2">
                          <div style={{ height: 3, borderRadius: 2, background: 'rgba(26,115,232,0.4)', width: '60%' }} />
                          <div style={{ height: 3, borderRadius: 2, background: 'rgba(0,0,0,0.1)', width: '80%' }} />
                          <div style={{ height: 3, borderRadius: 2, background: 'rgba(0,0,0,0.1)', width: '50%' }} />
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[15px]"
                           style={{ background: 'rgba(251,191,36,0.15)' }}>
                        <Sun size={15} style={{ color: '#f59e0b' }} />
                      </div>
                      <span className="text-[12.5px] font-medium text-gcal-text">Light</span>
                    </button>

                    {/* Dark */}
                    <button
                      onClick={() => handleThemeSelect(true)}
                      className="group flex flex-col items-center gap-2.5 rounded-[14px] p-4 transition-all duration-150 focus:outline-none cursor-pointer border border-gcal-border bg-gcal-hover hover:border-gcal-blue"
                      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(26,115,232,0.15)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.12)' }}>
                      <div className="w-full h-[52px] rounded-lg overflow-hidden border border-gcal-border"
                           style={{ background: '#1e1e1e' }}>
                        <div style={{ height: 4, background: 'var(--gcal-blue, #1a73e8)' }} />
                        <div className="flex flex-col gap-1 p-2">
                          <div style={{ height: 3, borderRadius: 2, background: 'rgba(26,115,232,0.5)', width: '60%' }} />
                          <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.12)', width: '80%' }} />
                          <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.12)', width: '50%' }} />
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center"
                           style={{ background: 'rgba(26,115,232,0.12)' }}>
                        <Moon size={15} className="text-gcal-blue" />
                      </div>
                      <span className="text-[12.5px] font-medium text-gcal-text">Dark</span>
                    </button>
                  </div>

                  <div className="w-full h-px mb-5 bg-gcal-border" />
                  <p className="text-[11.5px] text-gcal-text-secondary opacity-60">
                    No account needed · Your data stays local
                  </p>
                </>
              ) : (
                <>
                  {/* Step 2 */}
                  <div className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-5"
                       style={{ background: 'rgba(52,168,83,0.1)', border: '0.5px solid rgba(52,168,83,0.25)' }}>
                    <Sparkles className="w-[22px] h-[22px]" style={{ color: '#34a853' }} />
                  </div>

                  <p className="text-[11px] font-medium tracking-[0.1em] uppercase mb-2"
                     style={{ color: '#34a853' }}>
                    You're all set
                  </p>
                  <h2 className="text-[20px] font-semibold mb-2 text-gcal-text"
                      style={{ letterSpacing: '-0.02em' }}>
                    Google Calendar Clone
                  </h2>
                  <p className="text-[13px] leading-relaxed mb-6 px-2 text-gcal-text-secondary">
                    Built with every feature you'd expect — and a few you wouldn't.
                  </p>

                  <div className="flex flex-col gap-2 w-full mb-6 text-left">
                    {[
                      {
                        color: 'var(--gcal-blue, #1a73e8)',
                        text: (
                          <>The <strong className="font-medium text-gcal-text">★ sparkles icon</strong> at the top lists all extra features and enhancements baked in.</>
                        ),
                      },
                      {
                        color: '#34a853',
                        text: (
                          <>Full documentation lives in the <strong className="font-medium text-gcal-text">README.md</strong> — answers, rationale, and notes all in one place.</>
                        ),
                      },
                    ].map((item, i) => (
                      <div key={i}
                           className="flex items-start gap-2.5 rounded-[10px] px-3 py-2.5 border border-gcal-border bg-gcal-hover">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                             style={{ background: item.color }} />
                        <p className="text-[12.5px] leading-relaxed text-gcal-text-secondary">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleWelcomeDismiss}
                    className="w-full rounded-[12px] py-[13px] text-[14px] font-semibold text-white transition-all duration-150 cursor-pointer bg-gcal-blue hover:opacity-90"
                    style={{ border: 'none', letterSpacing: '-0.01em' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = '' }}>
                    Open Calendar
                  </button>

                  <p className="text-[11.5px] mt-4 text-gcal-text-secondary opacity-50">
                    Built by <span className="text-gcal-blue font-medium opacity-80">Aakash Kumar</span>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}