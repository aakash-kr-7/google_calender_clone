import React from 'react'
import { create } from 'zustand'
import * as api from '../api/client'
import toast from 'react-hot-toast'
import { useSettingsStore } from './settingsStore'
import { findAvailableSlots } from '../utils/slotFinder'

export const useEventStore = create((set, get) => ({
  events: [],
  loading: false,
  error: null,

  // Modal state
  isModalOpen: false,
  modalMode: 'create',       // 'create' | 'edit'
  selectedEvent: null,       // event being edited
  modalInitialData: null,    // pre-fill data when clicking on time grid

  // Overlap warning state — holds data needed to force-save
  overlapWarning: null,      // { overlapping_events, pendingData, pendingId, isUpdate, suggestions }
  selectedSlot: null,

  // ── Fetching ─────────────────────────────────────────────────────────────
  fetchEvents: async (start, end) => {
    set({ loading: true, error: null })
    try {
      const res = await api.fetchEvents(start, end)
      set({ events: res.data, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  // ── Creating ──────────────────────────────────────────────────────────────
  createEvent: async (data) => {
    const clashAlert = useSettingsStore.getState().overlapClashAlert
    try {
      const res = await api.createEvent(data, !clashAlert)
      set((s) => ({ events: [...s.events, res.data] }))
      get().clearDraft()
      get().closeModal()
      toast.success('Event created')
      return true
    } catch (err) {
      if (err.response?.status === 409) {
        // Overlap detected — store warning data so user can choose to force-save
        const detail = err.response.data.detail
        const suggestions = findAvailableSlots(
          { ...data, id: null },
          get().events
        )
        set({
          overlapWarning: {
            overlapping_events: detail.overlapping_events,
            message: detail.message,
            pendingData: data,
            pendingId: null,
            isUpdate: false,
            suggestions,
          }
        })
        return false
      }
      toast.error('Failed to create event')
      return false
    }
  },

  // ── Updating ──────────────────────────────────────────────────────────────
  updateEvent: async (id, data) => {
    const clashAlert = useSettingsStore.getState().overlapClashAlert
    try {
      const res = await api.updateEvent(id, data, !clashAlert)
      // Replace the old event in the array with the updated version
      set((s) => ({
        events: s.events.map((e) => (e.id === id ? res.data : e)),
      }))
      get().closeModal()
      toast.success('Event updated')
      return true
    } catch (err) {
      if (err.response?.status === 409) {
        const detail = err.response.data.detail
        const suggestions = findAvailableSlots(
          { ...data, id },
          get().events
        )
        set({
          overlapWarning: {
            overlapping_events: detail.overlapping_events,
            message: detail.message,
            pendingData: data,
            pendingId: id,
            isUpdate: true,
            suggestions,
          }
        })
        return false
      }
      toast.error('Failed to update event')
      return false
    }
  },

  // ── Deleting ──────────────────────────────────────────────────────────────
  deleteEvent: async (id) => {
    const eventToDelete = get().events.find((e) => e.id === id)
    try {
      await api.deleteEvent(id)
      set((s) => ({ events: s.events.filter((e) => e.id !== id) }))
      
      if (eventToDelete) {
        const backup = {
          title: eventToDelete.title,
          description: eventToDelete.description,
          location: eventToDelete.location,
          color: eventToDelete.color,
          is_all_day: eventToDelete.is_all_day,
          rrule: eventToDelete.rrule,
          start_time: eventToDelete.start_time,
          end_time: eventToDelete.end_time,
          attendees: eventToDelete.attendees,
        }
        
        toast((t) => (
          React.createElement('div', { className: "flex items-center justify-between gap-4 w-full" },
            React.createElement('span', { className: "text-sm font-medium text-gcal-text" }, "Event deleted"),
            React.createElement('button', {
              onClick: () => {
                toast.dismiss(t.id)
                get().restoreEvent(backup)
              },
              className: "text-gcal-blue dark:text-blue-400 font-semibold text-xs border border-gcal-blue/20 hover:border-gcal-blue/40 px-2 py-0.5 rounded hover:bg-gcal-blue/5 transition cursor-pointer"
            }, "Undo")
          )
        ), { duration: 5000 })
      } else {
        toast.success('Event deleted')
      }
    } catch {
      toast.error('Failed to delete event')
    }
  },

  // ── Restoring (Undo) ──────────────────────────────────────────────────────
  restoreEvent: async (eventData) => {
    try {
      const res = await api.createEvent(eventData, true) // force save bypasses overlaps
      set((s) => ({ events: [...s.events, res.data] }))
      toast.success('Event restored')
    } catch {
      toast.error('Failed to restore event')
    }
  },

  // ── Force save (bypass overlap check) ────────────────────────────────────
  forceSave: async () => {
    const { overlapWarning } = get()
    if (!overlapWarning) return
    try {
      if (overlapWarning.isUpdate) {
        const res = await api.updateEvent(overlapWarning.pendingId, overlapWarning.pendingData, true)
        set((s) => ({
          events: s.events.map((e) => (e.id === overlapWarning.pendingId ? res.data : e)),
          overlapWarning: null,
        }))
        get().closeModal()
        toast.success('Event updated')
      } else {
        const res = await api.createEvent(overlapWarning.pendingData, true)
        set((s) => ({ events: [...s.events, res.data], overlapWarning: null }))
        get().clearDraft()
        get().closeModal()
        toast.success('Event created')
      }
    } catch {
      toast.error('Failed to save event')
    }
  },

  dismissOverlapWarning: () => set({ overlapWarning: null }),

  // ── Modal controls ────────────────────────────────────────────────────────
  openCreateModal: (initialData = null) => set({
    isModalOpen: true,
    modalMode: 'create',
    selectedEvent: null,
    modalInitialData: initialData,
  }),

  openEditModal: (event) => set({
    isModalOpen: true,
    modalMode: 'edit',
    selectedEvent: event,
    modalInitialData: null,
  }),

  closeModal: () => set({
    isModalOpen: false,
    selectedEvent: null,
    modalInitialData: null,
  }),

  // ── Draft persistence (offline support) ──────────────────────────────────
  saveDraft:  (data) => localStorage.setItem('event_draft', JSON.stringify(data)),
  loadDraft:  ()     => {
    try { return JSON.parse(localStorage.getItem('event_draft') || 'null') }
    catch { return null }
  },
  clearDraft: ()     => localStorage.removeItem('event_draft'),
}))
