import { useState, useEffect } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import EventModal from '../events/EventModal'
import SettingsModal from './SettingsModal'
import MonthView from '../views/MonthView'
import WeekView from '../views/WeekView'
import DayView from '../views/DayView'
import { useCalendarStore } from '../../store/calendarStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useEvents } from '../../hooks/useEvents'
import { Toaster } from 'react-hot-toast'
import { Sun, Moon, Sparkles } from 'lucide-react'

export default function Layout() {
  useEvents() // triggers fetches when date/view changes
  const { viewMode } = useCalendarStore()
  const [showThemePrompt, setShowThemePrompt] = useState(false)
  const [promptStep, setPromptStep] = useState(1)

  useEffect(() => {
    const prompted = localStorage.getItem('gcal-theme-prompted')
    if (prompted !== 'true') {
      setShowThemePrompt(true)
    }
  }, [])

  const handleThemeSelect = (isDark) => {
    const { darkMode, toggleDarkMode } = useSettingsStore.getState()
    if (darkMode !== isDark) {
      toggleDarkMode()
    }
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
          {viewMode === 'month' && <MonthView />}
          {viewMode === 'week'  && <WeekView />}
          {viewMode === 'day'   && <DayView />}
        </main>
      </div>
      <EventModal />
      <SettingsModal />
      <Toaster position="bottom-center" />

      {/* Theme Choice Pop-up at First Launch */}
      {showThemePrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
          <div className="bg-gcal-surface border border-gcal-border rounded-2xl p-8 max-w-md w-full shadow-2xl text-center flex flex-col items-center">
            {promptStep === 1 ? (
              <>
                <div className="w-12 h-12 rounded-full bg-gcal-blue/10 flex items-center justify-center text-gcal-blue mb-4">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h2 className="text-xl font-semibold text-gcal-text mb-2">Welcome!</h2>
                <p className="text-xs text-gcal-light mb-6 px-4">
                  Choose your preferred visual theme to get started. You can change this setting anytime in the gear dropdown.
                </p>
                
                <div className="grid grid-cols-2 gap-4 w-full">
                  {/* Light Mode Card */}
                  <button 
                    onClick={() => handleThemeSelect(false)}
                    className="flex flex-col items-center gap-3 p-4 border border-gcal-border hover:border-gcal-blue rounded-xl bg-white hover:bg-slate-50 transition text-slate-800 focus:outline-none shadow-sm cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
                      <Sun size={20} />
                    </div>
                    <span className="text-sm font-semibold">Light Theme</span>
                  </button>
                  
                  {/* Dark Mode Card */}
                  <button 
                    onClick={() => handleThemeSelect(true)}
                    className="flex flex-col items-center gap-3 p-4 border border-slate-700 hover:border-gcal-blue rounded-xl bg-slate-900 hover:bg-slate-800 transition text-slate-200 focus:outline-none shadow-sm cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-400">
                      <Moon size={20} />
                    </div>
                    <span className="text-sm font-semibold">Dark Theme</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-gcal-blue/10 flex items-center justify-center text-gcal-blue mb-4 animate-bounce">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold text-gcal-text mb-3">Made with 💙</h2>
                <p className="text-xs text-gcal-text/90 leading-relaxed mb-6 px-3">
                  This calendar is crafted with love and intent to give as close to the Google Calendar experience as possible.
                  <br /><br />
                  We have also done some extra fun things (like custom search jumps and keyboard hotkeys) which you can check out by clicking the <strong className="text-gcal-blue font-semibold">Highlights button</strong> in the top header.
                </p>
                <button
                  onClick={handleWelcomeDismiss}
                  className="w-full bg-gcal-blue hover:bg-gcal-blue-hover text-white text-sm font-semibold rounded-xl py-3 transition shadow-md cursor-pointer"
                >
                  Awesome, let's go!
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
