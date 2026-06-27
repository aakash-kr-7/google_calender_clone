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
import clsx from 'clsx'

export default function EventBlock({ event, top, height, left, width, onEdit, onDelete, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    data: event,
  })

  const { localEndTime, startResize } = useResize(event)

  const style = {
    position:  'absolute',
    top:       `${top}%`,
    height:    `${Math.max(height, 1.5)}%`,
    left:      `${left}%`,
    width:     `${width}%`,
    // dnd-kit applies transform during drag
    transform: CSS.Translate.toString(transform),
    zIndex:    isDragging ? 50 : 1,
    // Semi-transparent background using the event's color
    backgroundColor: event.color + '26',
    borderLeft: `3px solid ${event.color}`,
    borderRadius: '4px',
    overflow: 'hidden',
    cursor: isDragging ? 'grabbing' : 'grab',
    opacity: isDragging ? 0.7 : 1,
    boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
    scale: isDragging ? '1.02' : '1',
    transition: isDragging ? 'none' : 'box-shadow 0.15s, opacity 0.15s',
    userSelect: 'none',
    padding: '2px 4px',
  }

  const handleClick = (e) => {
    if (isDragging) return
    onClick?.(e)
  }

  const startTime = new Date(event.start_time)
  const endDisplay = localEndTime || new Date(event.end_time)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="event-enter"
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      <p className="font-semibold text-[11px] leading-tight truncate" style={{ color: event.color }}>
        {event.title}
      </p>
      <p className="text-[10px] opacity-75 truncate" style={{ color: event.color }}>
        {formatEventTime(startTime, endDisplay)}
      </p>

      {/* Resize handle at bottom */}
      <div
        onMouseDown={startResize}
        className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize"
        style={{ backgroundColor: event.color + '60' }}
      />
    </div>
  )
}
