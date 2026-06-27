import { useEffect, useState, useRef } from 'react'
import { X } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import EventForm from './EventForm'
import Button from '../ui/Button'
import { useEventStore } from '../../store/eventStore'
import toast from 'react-hot-toast'
import { OverlapToast } from '../ui/Toast'

function buildFormData(event = null, initialData = null) {
  // Build default form values from an existing event (edit) or initialData (create from click)
  const now = new Date()
  const later = new Date(now.getTime() + 60 * 60000)
  const base = event || {}
  const startDt = event ? new Date(event.start_time) : (initialData?.start || now)
  const endDt   = event ? new Date(event.end_time)   : (initialData?.end   || later)

  return {
    title:       base.title       || '',
    description: base.description || '',
    location:    base.location    || '',
    color:       base.color       || '#1a73e8',
    isAllDay:    base.is_all_day  || false,
    rrule:       base.rrule       || '',
    startDate:   format(startDt, 'yyyy-MM-dd'),
    startTime:   format(startDt, 'HH:mm'),
    endDate:     format(endDt,   'yyyy-MM-dd'),
    endTime:     format(endDt,   'HH:mm'),
  }
}

export default function EventModal() {
  const {
    isModalOpen, modalMode, selectedEvent, modalInitialData,
    closeModal, createEvent, updateEvent, loadDraft, clearDraft,
    overlapWarning,
  } = useEventStore()

  const [formData, setFormData] = useState(() => buildFormData())
  const [showDraftBanner, setShowDraftBanner] = useState(false)
  const titleRef = useRef()

  // Reset form when modal opens
  useEffect(() => {
    if (!isModalOpen) return
    if (modalMode === 'edit' && selectedEvent) {
      setFormData(buildFormData(selectedEvent))
      setShowDraftBanner(false)
    } else {
      const draft = loadDraft()
      if (draft) {
        setShowDraftBanner(true)
        setFormData(draft)
      } else {
        setFormData(buildFormData(null, modalInitialData))
      }
    }
    // Autofocus title
    setTimeout(() => titleRef.current?.focus(), 50)
  }, [isModalOpen, modalMode, selectedEvent])

  // Show overlap toast when overlapWarning is set
  useEffect(() => {
    if (overlapWarning) {
      toast.custom((t) => <OverlapToast t={t} overlapWarning={overlapWarning} />, {
        duration: Infinity,
        id: 'overlap-warning',
      })
    }
  }, [overlapWarning])

  // ESC to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeModal() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [closeModal])

  if (!isModalOpen) return null

  const buildApiPayload = (data) => {
    const startStr = data.isAllDay
      ? `${data.startDate}T00:00:00.000Z`
      : new Date(`${data.startDate}T${data.startTime}`).toISOString()
    const endStr = data.isAllDay
      ? `${data.startDate}T23:59:59.000Z`
      : new Date(`${data.startDate}T${data.endTime}`).toISOString()

    return {
      title:       data.title,
      description: data.description || null,
      location:    data.location    || null,
      color:       data.color,
      is_all_day:  data.isAllDay,
      rrule:       data.rrule       || null,
      start_time:  startStr,
      end_time:    endStr,
    }
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Please add a title')
      titleRef.current?.focus()
      return
    }
    const payload = buildApiPayload(formData)
    if (modalMode === 'edit') {
      await updateEvent(selectedEvent.id, payload)
    } else {
      await createEvent(payload)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-40"
      onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-[560px] max-w-[95vw] max-h-[90vh] overflow-y-auto modal-enter">
        {/* Draft banner */}
        {showDraftBanner && (
          <div className="bg-yellow-50 border-b border-yellow-100 px-6 py-2 flex items-center justify-between">
            <span className="text-xs text-yellow-700">You have an unsaved draft</span>
            <div className="flex gap-2">
              <button onClick={() => setShowDraftBanner(false)} className="text-xs text-yellow-600 hover:underline">Use draft</button>
              <button onClick={() => { clearDraft(); setFormData(buildFormData(null, modalInitialData)); setShowDraftBanner(false) }} className="text-xs text-yellow-600 hover:underline">Dismiss</button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-2">
          <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: formData.color }} />
          <input
            ref={titleRef}
            type="text"
            placeholder="Add title"
            value={formData.title}
            onChange={(e) => setFormData((d) => ({ ...d, title: e.target.value }))}
            className="flex-1 text-2xl font-normal border-0 border-b-2 border-gcal-border focus:outline-none focus:border-gcal-blue pb-1 text-gcal-text placeholder-gray-300"
          />
          <button onClick={closeModal} className="p-1.5 rounded-full hover:bg-gray-100 text-gcal-light">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 pb-4">
          <EventForm formData={formData} onChange={setFormData} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gcal-border">
          <Button variant="ghost" size="sm" onClick={closeModal}>Cancel</Button>
          <Button variant="primary" size="md" onClick={handleSave}>
            {modalMode === 'edit' ? 'Save changes' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}
