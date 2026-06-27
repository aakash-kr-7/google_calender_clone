// Zustand is a minimal global state manager — think of it as a global useState.
// No reducers, no dispatch — just a plain object with setter functions.
import { create } from 'zustand'
import {
  addDays, addWeeks, addMonths,
  subDays, subWeeks, subMonths,
} from 'date-fns'

export const useCalendarStore = create((set, get) => ({
  currentDate: new Date(),
  viewMode: 'week',   // 'month' | 'week' | 'day'
  sidebarOpen: true,

  setCurrentDate: (date) => set({ currentDate: date }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  goToToday: () => set({ currentDate: new Date() }),

  navigatePrev: () => {
    const { currentDate, viewMode } = get()
    const fn = { month: subMonths, week: subWeeks, day: subDays }[viewMode]
    set({ currentDate: fn(currentDate, 1) })
  },

  navigateNext: () => {
    const { currentDate, viewMode } = get()
    const fn = { month: addMonths, week: addWeeks, day: addDays }[viewMode]
    set({ currentDate: fn(currentDate, 1) })
  },
}))
