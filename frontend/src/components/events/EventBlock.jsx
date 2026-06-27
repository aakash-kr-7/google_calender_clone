/**
 * EventBlock is absolutely positioned inside the TimeGrid.
 * Top and height are percentages of the 1440px grid height.
 * We use @dnd-kit's useDraggable hook for drag support.
 */
import { useRef, useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { formatEventTime } from '../../utils/dateUtils'
import { useResize } from '../../hooks/useResize'
import { useSettingsStore } from '../../store/settingsStore'
import clsx from 'clsx'

export default function EventBlock({ event, top, height, left, width, onEdit, onDelete, onClick, onMouseEnter, onMouseLeave }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    data: event,
  })

  const [isHovered, setIsHovered] = useState(false)
  const { localEndTime, startResize } = useResize(event)
  const { darkMode } = useSettingsStore()

  const style = {
    position:  'absolute',
    top:       `${top}%`,
    height:    `${Math.max(height, 1.5)}%`,
    left:      `${left}%`,
    width:     `${width}%`,
    // dnd-kit applies transform during drag, otherwise apply scale on hover
    transform: CSS.Translate.toString(transform) || (isHovered ? 'scale(1.025)' : 'none'),
    zIndex:    isDragging ? 50 : isHovered ? 30 : 1,
    // Solid background with white text in dark mode for contrast; tinted in light mode
    backgroundColor: darkMode ? event.color + 'cc' : event.color + '26',
    borderLeft: darkMode ? 'none' : `3px solid ${event.color}`,
    borderRadius: '4px',
    overflow: 'hidden',
    cursor: isDragging ? 'grabbing' : 'grab',
    opacity: isDragging ? 0.7 : 1,
    boxShadow: isDragging 
      ? '0 8px 24px rgba(0,0,0,0.25)' 
      : isHovered 
        ? '0 6px 16px rgba(0,0,0,0.15)' 
        : 'none',
    transition: isDragging 
      ? 'none' 
      : 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 150ms ease, z-index 150ms ease',
    userSelect: 'none',
    padding: darkMode ? '3px 6px' : '2px 4px',
  }

  const handleClick = (e) => {
    if (isDragging) return
    onClick?.(e)
  }

  const handleMouseEnter = (e) => {
    setIsHovered(true)
    onMouseEnter?.(e, event)
  }

  const handleMouseLeave = (e) => {
    setIsHovered(false)
    onMouseLeave?.(e)
  }

  const startTime = new Date(event.start_time)
  const endDisplay = localEndTime || new Date(event.end_time)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="event-enter"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...attributes}
      {...listeners}
    >
      <p className="font-semibold text-[11px] leading-tight truncate" style={{ color: darkMode ? '#ffffff' : event.color }}>
        {event.title}
      </p>
      <p className="text-[10px] opacity-75 truncate" style={{ color: darkMode ? '#f1f5f9' : event.color }}>
        {formatEventTime(startTime, endDisplay)}
      </p>

      {/* Resize handle at bottom */}
      <div
        onMouseDown={startResize}
        className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize"
        style={{ backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : event.color + '60' }}
      />
    </div>
  )
}
