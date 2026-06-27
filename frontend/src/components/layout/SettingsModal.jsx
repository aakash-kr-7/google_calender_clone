import { useState } from 'react'
import { X, Moon, Sun, Calendar, Clock, EyeOff, Bell, Settings, Globe, MapPin, Sliders, Check } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'
import clsx from 'clsx'

export default function SettingsModal() {
  const {
    settingsOpen,
    closeSettings,
    darkMode,
    toggleDarkMode,
    weekStartsOn,
    setWeekStartsOn,
    defaultEventDuration,
    setDefaultEventDuration,
    showWeekends,
    toggleShowWeekends,
    overlapClashAlert,
    toggleOverlapClashAlert,
    compactMode,
    toggleCompactMode
  } = useSettingsStore()

  const [activeTab, setActiveTab] = useState('general')

  if (!settingsOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeSettings()
  }

  // Get user timezone dynamically
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const menuItems = [
    { id: 'general', label: 'General & Region', icon: Globe },
    { id: 'event_settings', label: 'Event Settings', icon: Clock },
    { id: 'view_options', label: 'View Options', icon: Sliders },
  ]

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 transition-opacity duration-200"
      onClick={handleOverlayClick}
    >
      <div className="bg-gcal-surface rounded-2xl shadow-2xl w-[760px] max-w-[95vw] h-[540px] max-h-[90vh] overflow-hidden border border-gcal-border/20 modal-enter text-gcal-text flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gcal-border flex items-center justify-between bg-gcal-surface">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-gcal-blue" />
            <h2 className="text-lg font-medium text-gcal-text">Settings</h2>
          </div>
          <button
            onClick={closeSettings}
            className="p-1.5 rounded-full hover:bg-gcal-hover text-gcal-light hover:text-gcal-text transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Two-Column Body */}
        <div className="flex-1 flex overflow-hidden bg-gcal-surface">
          
          {/* Left Panel: Sidebar */}
          <aside className="w-56 border-r border-gcal-border bg-gcal-bg/30 p-3 flex flex-col gap-1 shrink-0 select-none">
            <div className="text-[10px] font-bold text-gcal-light uppercase tracking-wider px-3 mb-2 mt-1">Calendar Settings</div>
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-left transition-all duration-150 focus:outline-none',
                    active 
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-gcal-blue' 
                      : 'text-gcal-text hover:bg-gcal-hover'
                  )}
                >
                  <Icon size={16} className={active ? 'text-gcal-blue' : 'text-gcal-light'} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </aside>

          {/* Right Panel: Content Section */}
          <main className="flex-1 p-6 overflow-y-auto space-y-6">
            
            {/* General & Region Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gcal-text mb-1 border-b border-gcal-border pb-2">Language & Region</h3>
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gcal-text font-medium">Language</span>
                      <select className="bg-gcal-surface border border-gcal-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-gcal-blue" disabled>
                        <option>English (US)</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gcal-text font-medium">Country</span>
                      <select className="bg-gcal-surface border border-gcal-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-gcal-blue" disabled>
                        <option>United States</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gcal-text mb-1 border-b border-gcal-border pb-2">Time Zone</h3>
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-gcal-text font-medium flex items-center gap-1.5">
                          <MapPin size={14} className="text-gcal-light" />
                          Primary time zone
                        </span>
                        <p className="text-[11px] text-gcal-light mt-0.5">Determined automatically by your browser</p>
                      </div>
                      <span className="text-xs bg-gcal-bg px-3 py-1.5 rounded-lg border border-gcal-border font-mono text-gcal-light">
                        {timeZone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Event Settings Tab */}
            {activeTab === 'event_settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gcal-text mb-1 border-b border-gcal-border pb-2">Event Settings</h3>
                  
                  <div className="space-y-5 mt-4">
                    {/* Default Duration */}
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-gcal-text font-medium">Default event duration</span>
                        <p className="text-xs text-gcal-light mt-0.5">Length allocated when clicking in the time grid</p>
                      </div>
                      <select
                        value={defaultEventDuration}
                        onChange={(e) => setDefaultEventDuration(parseInt(e.target.value))}
                        className="bg-gcal-surface border border-gcal-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-gcal-blue cursor-pointer"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                      </select>
                    </div>

                    {/* Overlap Warning Toggle */}
                    <div className="flex items-center justify-between text-sm pt-1">
                      <div>
                        <span className="text-gcal-text font-medium flex items-center gap-1.5">
                          <Bell size={14} className="text-gcal-light" />
                          Overlap Conflict Alerts
                        </span>
                        <p className="text-xs text-gcal-light mt-0.5">Warn about conflicts (auto-forces save when disabled)</p>
                      </div>
                      <button
                        type="button"
                        onClick={toggleOverlapClashAlert}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${overlapClashAlert ? 'bg-gcal-blue' : 'bg-slate-200 dark:bg-slate-700'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${overlapClashAlert ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View Options Tab */}
            {activeTab === 'view_options' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gcal-text mb-1 border-b border-gcal-border pb-2">View Options</h3>
                  
                  <div className="space-y-5 mt-4">
                    {/* Week starts on */}
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-gcal-text font-medium">Start week on</span>
                        <p className="text-xs text-gcal-light mt-0.5">Set the first column of the week/month views</p>
                      </div>
                      <select
                        value={weekStartsOn}
                        onChange={(e) => setWeekStartsOn(parseInt(e.target.value))}
                        className="bg-gcal-surface border border-gcal-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-gcal-blue cursor-pointer"
                      >
                        <option value={0}>Sunday</option>
                        <option value={1}>Monday</option>
                      </select>
                    </div>

                    {/* Show weekends */}
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-gcal-text font-medium">Show weekends</span>
                        <p className="text-xs text-gcal-light mt-0.5">Include Saturday and Sunday slots in grids</p>
                      </div>
                      <button
                        type="button"
                        onClick={toggleShowWeekends}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${showWeekends ? 'bg-gcal-blue' : 'bg-slate-200 dark:bg-slate-700'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${showWeekends ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Compact Mode Density */}
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-gcal-text font-medium">Compact density</span>
                        <p className="text-xs text-gcal-light mt-0.5">Compress row spacing and time increments</p>
                      </div>
                      <button
                        type="button"
                        onClick={toggleCompactMode}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${compactMode ? 'bg-gcal-blue' : 'bg-slate-200 dark:bg-slate-700'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${compactMode ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Dark mode */}
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-gcal-text font-medium flex items-center gap-1.5">
                          {darkMode ? <Moon size={14} className="text-gcal-blue" /> : <Sun size={14} className="text-amber-500" />}
                          Dark Mode Theme
                        </span>
                        <p className="text-xs text-gcal-light mt-0.5">Switch between light and clean slate dark palettes</p>
                      </div>
                      <button
                        type="button"
                        onClick={toggleDarkMode}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${darkMode ? 'bg-gcal-blue' : 'bg-slate-200 dark:bg-slate-700'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gcal-bg border-t border-gcal-border flex justify-between items-center text-xs text-gcal-light shrink-0">
          <span>Settings update instantly.</span>
          <button
            onClick={closeSettings}
            className="bg-gcal-blue text-white rounded-lg px-4.5 py-2 text-xs font-semibold hover:bg-gcal-blue-hover transition shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
