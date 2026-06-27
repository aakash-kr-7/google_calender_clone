import { X, Moon, Sun, Calendar, Clock, EyeOff, BellRing, Settings } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'

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
    toggleOverlapClashAlert
  } = useSettingsStore()

  if (!settingsOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) closeSettings()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 transition-opacity duration-200"
      onClick={handleOverlayClick}
    >
      <div className="bg-gcal-surface rounded-2xl shadow-2xl w-[480px] max-w-[95vw] overflow-hidden border border-gcal-border/20 modal-enter text-gcal-text flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gcal-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-gcal-blue" />
            <h2 className="text-lg font-medium text-gcal-text">Settings</h2>
          </div>
          <button
            onClick={closeSettings}
            className="p-1 rounded-full hover:bg-gcal-border/20 text-gcal-light hover:text-gcal-text transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Section: Appearance */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gcal-light">Appearance</h3>
            
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  {darkMode ? <Moon size={16} className="text-gcal-blue" /> : <Sun size={16} className="text-amber-500" />}
                  <span>Dark Mode Theme</span>
                </div>
                <p className="text-xs text-gcal-light mt-0.5">Toggle clean dark layout across all views</p>
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

          {/* Section: Calendar Preferences */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gcal-light">Preferences</h3>

            {/* Week Starts On */}
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  <Calendar size={16} className="text-gcal-light" />
                  <span>Start week on</span>
                </div>
                <p className="text-xs text-gcal-light mt-0.5">Choose standard calendar week start day</p>
              </div>
              <select
                value={weekStartsOn}
                onChange={(e) => setWeekStartsOn(parseInt(e.target.value))}
                className="text-xs bg-gcal-surface border border-gcal-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gcal-blue transition"
              >
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
              </select>
            </div>

            {/* Default Event Duration */}
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  <Clock size={16} className="text-gcal-light" />
                  <span>Default event duration</span>
                </div>
                <p className="text-xs text-gcal-light mt-0.5">Standard length for newly drafted events</p>
              </div>
              <select
                value={defaultEventDuration}
                onChange={(e) => setDefaultEventDuration(parseInt(e.target.value))}
                className="text-xs bg-gcal-surface border border-gcal-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gcal-blue transition"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
              </select>
            </div>

            {/* Show Weekends */}
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  <EyeOff size={16} className="text-gcal-light" />
                  <span>Show Weekends</span>
                </div>
                <p className="text-xs text-gcal-light mt-0.5">Show or hide Saturday and Sunday slots</p>
              </div>
              <button
                type="button"
                onClick={toggleShowWeekends}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${showWeekends ? 'bg-gcal-blue' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${showWeekends ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {/* Section: Clash Warnings */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gcal-light">Alarms & Clashes</h3>

            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  <BellRing size={16} className="text-gcal-light" />
                  <span>Overlap Conflict Warning</span>
                </div>
                <p className="text-xs text-gcal-light mt-0.5">Alert and toast on scheduling overlaps</p>
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

        {/* Footer */}
        <div className="p-4 bg-gcal-bg border-t border-gcal-border/30 flex justify-between items-center text-xs text-gcal-light">
          <span>All settings save automatically.</span>
          <button
            onClick={closeSettings}
            className="bg-gcal-blue text-white rounded-lg px-4 py-2 text-xs font-semibold hover:bg-gcal-blue-hover transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
