import { create } from 'zustand'
import * as api from '../api/client'
import toast from 'react-hot-toast'

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
  overlapWarning: null,      // { overlapping_events, pendingData, pendingId, isUpdate }

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
    try {
      const res = await api.createEvent(data)
      set((s) => ({ events: [...s.events, res.data] }))
      get().clearDraft()
      get().closeModal()
      toast.success('Event created')
      return true
    } catch (err) {
      if (err.response?.status === 409) {
        // Overlap detected — store warning data so user can choose to force-save
        const detail = err.response.data.detail
        set({
          overlapWarning: {
            overlapping_events: detail.overlapping_events,
            message: detail.message,
            pendingData: data,
            pendingId: null,
            isUpdate: false,
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
    try {
      const res = await api.updateEvent(id, data)
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
        set({
          overlapWarning: {
            overlapping_events: detail.overlapping_events,
            message: detail.message,
            pendingData: data,
            pendingId: id,
            isUpdate: true,
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
    try {
      await api.deleteEvent(id)
      set((s) => ({ events: s.events.filter((e) => e.id !== id) }))
      toast.success('Event deleted')
    } catch {
      toast.error('Failed to delete event')
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
