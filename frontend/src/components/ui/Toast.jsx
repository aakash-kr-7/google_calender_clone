// Custom overlap warning toast — shown when backend returns 409
import { useEventStore } from '../../store/eventStore'
import toast from 'react-hot-toast'

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
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 shadow-lg rounded-xl p-4`}>
      <p className="font-medium text-amber-800 dark:text-amber-400 text-sm mb-1">⚠️ Scheduling conflict</p>
      <p className="text-amber-700 dark:text-amber-300/90 text-xs mb-3">{overlapWarning?.message}</p>
      <ul className="text-xs text-amber-700 dark:text-amber-300/80 mb-3 space-y-1">
        {overlapWarning?.overlapping_events?.map((e) => (
          <li key={e.id} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: e.color }} />
            {e.title}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <button onClick={handleForceSave} className="flex-1 bg-amber-600 dark:bg-amber-750 text-white text-xs py-1.5 rounded-lg hover:bg-amber-700 transition-colors">
          Save anyway
        </button>
        <button onClick={handleCancel} className="flex-1 border border-amber-300 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 text-xs py-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-950/40 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}
