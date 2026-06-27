import { useRef, useEffect, useState } from 'react'
import { isSameDay, format } from 'date-fns'
import { computeEventLayout } from '../../utils/eventLayout'
import { timeToPercent, durationToPercent, minutesFromMidnight } from '../../utils/dateUtils'
import EventBlock from '../events/EventBlock'
import EventPopover from '../events/EventPopover'
import { useEventStore } from '../../store/eventStore'
import { useSettingsStore } from '../../store/settingsStore'
import { RRule } from 'rrule'

// GRID_HEIGHT_PX: 1px per minute = 1440px total. Makes time math trivial.
const GRID_HEIGHT_PX = 1440

const HOURS = Array.from({ length: 24 }, (_, i) => i)

function expandRecurring(event, rangeStart, rangeEnd) {
  // Expand a recurring event's rrule into individual instances within the visible range
  if (!event.rrule) return []
  try {
    const rule = RRule.fromString(`DTSTART:${format(new Date(event.start_time), "yyyyMMdd'T'HHmmss'Z'")}\nRRULE:${event.rrule}`)
    const duration = new Date(event.end_time) - new Date(event.start_time)
    return rule.between(rangeStart, rangeEnd, true).map((date) => ({
      ...event,
      id: `${event.id}_${date.toISOString()}`, // virtual id for recurring instances
      start_time: date.toISOString(),
      end_time:   new Date(date.getTime() + duration).toISOString(),
      _isInstance: true,
    }))
  } catch { return [] }
}

export default function TimeGrid({ days, events }) {
  const scrollRef = useRef()
  const gridRef   = useRef()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [popover, setPopover] = useState(null) // { event, x, y }
  const { openCreateModal, openEditModal, deleteEvent } = useEventStore()
  const { defaultEventDuration } = useSettingsStore()

  // Auto-scroll to 7 AM on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (7 / 24) * GRID_HEIGHT_PX - 60
    }
  }, [])

  // Update current time line every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval) // cleanup prevents memory leak
  }, [])

  // Click on empty grid area → open create modal with that time pre-filled
  const handleGridClick = (e, day) => {
    if (e.target !== e.currentTarget) return
    const rect = gridRef.current.getBoundingClientRect()
    const y    = e.clientY - rect.top + scrollRef.current.scrollTop
    const clickedMinutes = Math.round((y / GRID_HEIGHT_PX) * 1440 / 30) * 30
    const start = new Date(day)
    start.setHours(Math.floor(clickedMinutes / 60), clickedMinutes % 60, 0, 0)
    const end = new Date(start.getTime() + defaultEventDuration * 60000)
    openCreateModal({ start, end })
  }

  const rangeStart = days[0]
  const rangeEnd   = days[days.length - 1]

  // Get events for a specific day, expanding recurring ones
  const getDayEvents = (day) => {
    const regular = events.filter(
      (e) => !e.rrule && isSameDay(new Date(e.start_time), day) && !e.is_all_day
    )
    const recurring = events
      .filter((e) => e.rrule)
      .flatMap((e) => expandRecurring(e, rangeStart, rangeEnd))
      .filter((e) => isSameDay(new Date(e.start_time), day))
    return computeEventLayout([...regular, ...recurring])
  }

  const currentTimePercent = (minutesFromMidnight(currentTime) / 1440) * 100

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto time-grid-scroll relative">
      <div ref={gridRef} className="flex" style={{ height: GRID_HEIGHT_PX }}>
        {/* Time labels column */}
        <div className="w-16 shrink-0 relative">
          {HOURS.map((h) => (
            <div
              key={h}
              className="absolute right-2 text-[10px] text-gcal-light"
              style={{ top: `${(h / 24) * 100}%`, transform: 'translateY(-50%)' }}
            >
              {h === 0 ? '' : format(new Date().setHours(h, 0), 'h a')}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day, dayIdx) => {
          const dayEvents = getDayEvents(day)
          const isToday   = isSameDay(day, new Date())

          return (
            <div
              key={dayIdx}
              className="flex-1 relative border-l border-gcal-border"
              onClick={(e) => handleGridClick(e, day)}
            >
              {/* Hour lines */}
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="absolute left-0 right-0 border-t border-gcal-border"
                  style={{ top: `${(h / 24) * 100}%` }}
                />
              ))}

              {/* Half-hour lines (lighter) */}
              {HOURS.map((h) => (
                <div
                  key={`half-${h}`}
                  className="absolute left-0 right-0 border-t border-gcal-border opacity-40"
                  style={{ top: `${((h + 0.5) / 24) * 100}%`, borderStyle: 'dashed' }}
                />
              ))}

              {/* Current time indicator — only on today's column */}
              {isToday && (
                <div
                  className="absolute left-0 right-0 z-10 pointer-events-none"
                  style={{ top: `${currentTimePercent}%` }}
                >
                  <div className="relative flex items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-gcal-red -ml-1.5 shrink-0" />
                    <div className="flex-1 h-[2px] bg-gcal-red" />
                  </div>
                </div>
              )}

              {/* Event blocks */}
              {dayEvents.map((event) => (
                <EventBlock
                  key={event.id}
                  event={event}
                  top={timeToPercent(new Date(event.start_time))}
                  height={durationToPercent(new Date(event.start_time), new Date(event.end_time))}
                  left={event.leftPercent + 1}
                  width={event.widthPercent - 2}
                  onClick={(e) => setPopover({ event, x: e.clientX + 8, y: e.clientY - 40 })}
                  onEdit={openEditModal}
                  onDelete={deleteEvent}
                />
              ))}
            </div>
          )
        })}
      </div>

      {/* Event popover */}
      {popover && (
        <EventPopover
          event={popover.event}
          position={{ x: popover.x, y: popover.y }}
          onClose={() => setPopover(null)}
          onEdit={(ev) => { openEditModal(ev); setPopover(null) }}
          onDelete={(id) => { deleteEvent(id); setPopover(null) }}
        />
      )}
    </div>
  )
}
