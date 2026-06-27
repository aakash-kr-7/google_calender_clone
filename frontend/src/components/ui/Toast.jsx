import { useEventStore } from '../../store/eventStore'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export function OverlapToast({ t, overlapWarning }) {
  const { forceSave, dismissOverlapWarning } = useEventStore()

  const handleForceSave = () => {
    toast.dismiss(t.id)
    forceSave()
  }

  const handleCancel = () => {
    toast.dismiss(t.id)
    dismissOverlapWarning()
  }

  return (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-900/30 shadow-lg rounded-xl p-4 select-none`}>
      <p className="font-medium text-amber-800 dark:text-amber-400 text-sm mb-1">⚠️ Scheduling conflict</p>
      <p className="text-amber-700 dark:text-amber-300/90 text-xs mb-3">{overlapWarning?.message}</p>
      
      {/* Suggestions List in Toast */}
      {overlapWarning?.suggestions && overlapWarning.suggestions.length > 0 && (
        <div className="mb-3 border-t border-amber-200/50 dark:border-amber-900/20 pt-2.5">
          <p className="font-bold text-[9px] text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-1.5">Suggested Available Slots:</p>
          <div className="flex flex-col gap-1">
            {overlapWarning.suggestions.map((slot, idx) => {
              const start = new Date(slot.start)
              const end = new Date(slot.end)
              return (
                <button
                  key={idx}
                  onClick={() => {
                    toast.dismiss(t.id)
                    useEventStore.setState({ selectedSlot: slot })
                  }}
                  className="w-full text-left px-2 py-1.5 bg-amber-100/60 dark:bg-amber-900/30 hover:bg-amber-200/80 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-[10px] font-semibold rounded-lg transition cursor-pointer border border-amber-200/30 dark:border-transparent"
                >
                  {format(start, 'EEEE h:mm a')} – {format(end, 'h:mm a')}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <ul className="text-[10px] text-amber-700/80 dark:text-amber-400/70 mb-3 space-y-1">
        <li className="font-bold text-[9px] uppercase tracking-wider text-amber-800 dark:text-amber-400">Conflicting Events:</li>
        {overlapWarning?.overlapping_events?.map((e) => (
          <li key={e.id} className="flex items-center gap-1.5 pl-1">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: e.color }} />
            <span className="truncate">{e.title}</span>
          </li>
        ))}
      </ul>

      <div className="flex gap-2 border-t border-amber-200/50 dark:border-amber-900/20 pt-3">
        <button onClick={handleForceSave} className="flex-1 bg-amber-600 dark:bg-amber-700 text-white text-xs py-1.5 rounded-lg hover:bg-amber-700 dark:hover:bg-amber-600 transition-colors font-semibold cursor-pointer">
          Save anyway
        </button>
        <button onClick={handleCancel} className="flex-1 border border-amber-300 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 text-xs py-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-950/40 transition-colors font-semibold cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  )
}
