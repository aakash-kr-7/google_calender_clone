import { Switch } from '@headlessui/react'
import { MapPin, AlignLeft, Repeat, Users } from 'lucide-react'
import { format } from 'date-fns'
import ColorPicker from '../ui/ColorPicker'
import { useEventStore } from '../../store/eventStore'

const RRULE_OPTIONS = [
  { label: 'Does not repeat', value: '' },
  { label: 'Daily',           value: 'FREQ=DAILY' },
  { label: 'Weekly',          value: 'FREQ=WEEKLY' },
  { label: 'Monthly',         value: 'FREQ=MONTHLY' },
  { label: 'Weekdays (Mon–Fri)', value: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' },
]

export default function EventForm({ formData, onChange }) {
  const { saveDraft } = useEventStore()

  const update = (field, value) => {
    const updated = { ...formData, [field]: value }
    onChange(updated)
    saveDraft(updated) // persist draft on every change
  }

  const inputCls = 'border-0 border-b border-gcal-border focus:outline-none focus:border-gcal-blue text-gcal-text text-sm py-1 w-full bg-gcal-surface'
  const rowCls   = 'flex items-start gap-4 py-3 border-b border-gcal-border'
  const iconCls  = 'text-gcal-light mt-0.5 shrink-0'

  return (
    <div className="space-y-0">
      {/* All-day toggle + date/time */}
      <div className={rowCls}>
        <div className="flex-1 space-y-2">
          {/* Date row */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => update('startDate', e.target.value)}
              className={`${inputCls} w-auto`}
            />
            {!formData.isAllDay && (
              <>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => update('startTime', e.target.value)}
                  className={`${inputCls} w-auto`}
                />
                <span className="text-gcal-light">to</span>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => update('endTime', e.target.value)}
                  className={`${inputCls} w-auto`}
                />
              </>
            )}
          </div>
          {/* All-day toggle */}
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.isAllDay}
              onChange={(v) => update('isAllDay', v)}
              className={`${formData.isAllDay ? 'bg-gcal-blue' : 'bg-gray-200 dark:bg-slate-700'} relative inline-flex h-5 w-9 items-center rounded-full transition-colors`}
            >
              <span className={`${formData.isAllDay ? 'translate-x-5' : 'translate-x-1'} inline-block h-3 w-3 transform rounded-full bg-white transition-transform`} />
            </Switch>
            <span className="text-sm text-gcal-light">All day</span>
          </div>
        </div>
      </div>

      {/* Repeat */}
      <div className={rowCls}>
        <Repeat size={18} className={iconCls} />
        <select
          value={formData.rrule || ''}
          onChange={(e) => update('rrule', e.target.value)}
          className={`${inputCls} flex-1`}
        >
          {RRULE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div className={rowCls}>
        <MapPin size={18} className={iconCls} />
        <input
          type="text"
          placeholder="Add location"
          value={formData.location || ''}
          onChange={(e) => update('location', e.target.value)}
          className={`${inputCls} flex-1`}
        />
      </div>

      {/* Attendees */}
      <div className={rowCls}>
        <Users size={18} className={iconCls} />
        <input
          type="text"
          placeholder="Add guests (emails separated by commas)"
          value={formData.attendees || ''}
          onChange={(e) => update('attendees', e.target.value)}
          className={`${inputCls} flex-1`}
        />
      </div>

      {/* Description */}
      <div className={rowCls}>
        <AlignLeft size={18} className={iconCls} />
        <textarea
          placeholder="Add description"
          value={formData.description || ''}
          onChange={(e) => update('description', e.target.value)}
          rows={3}
          className={`${inputCls} flex-1 resize-none`}
        />
      </div>

      {/* Color picker */}
      <div className={`${rowCls} border-b-0`}>
        <div className="w-[18px]" />
        <ColorPicker value={formData.color} onChange={(c) => update('color', c)} />
      </div>
    </div>
  )
}
