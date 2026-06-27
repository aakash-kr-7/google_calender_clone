import { create } from 'zustand'

const getSaved = (key, fallback) => {
  const item = localStorage.getItem(key)
  if (item === null) return fallback
  try {
    return JSON.parse(item)
  } catch {
    return item
  }
}

export const useSettingsStore = create((set, get) => {
  // Initialize dark mode class on load
  const isDark = getSaved('gcal-darkMode', false)
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  return {
    darkMode: isDark,
    weekStartsOn: getSaved('gcal-weekStartsOn', 0), // 0 for Sunday, 1 for Monday
    defaultEventDuration: getSaved('gcal-defaultEventDuration', 30), // minutes
    showWeekends: getSaved('gcal-showWeekends', true),
    overlapClashAlert: getSaved('gcal-overlapClashAlert', true),
    compactMode: getSaved('gcal-compactMode', false),
    settingsOpen: false,

    openSettings: () => set({ settingsOpen: true }),
    closeSettings: () => set({ settingsOpen: false }),

    toggleDarkMode: () => {
      const current = get().darkMode
      const next = !current
      localStorage.setItem('gcal-darkMode', JSON.stringify(next))
      if (next) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      set({ darkMode: next })
    },

    setWeekStartsOn: (day) => {
      localStorage.setItem('gcal-weekStartsOn', JSON.stringify(day))
      set({ weekStartsOn: day })
    },

    setDefaultEventDuration: (duration) => {
      localStorage.setItem('gcal-defaultEventDuration', JSON.stringify(duration))
      set({ defaultEventDuration: duration })
    },

    toggleShowWeekends: () => {
      const current = get().showWeekends
      const next = !current
      localStorage.setItem('gcal-showWeekends', JSON.stringify(next))
      set({ showWeekends: next })
    },

    toggleOverlapClashAlert: () => {
      const current = get().overlapClashAlert
      const next = !current
      localStorage.setItem('gcal-overlapClashAlert', JSON.stringify(next))
      set({ overlapClashAlert: next })
    },

    toggleCompactMode: () => {
      const current = get().compactMode
      const next = !current
      localStorage.setItem('gcal-compactMode', JSON.stringify(next))
      set({ compactMode: next })
    }
  }
})
