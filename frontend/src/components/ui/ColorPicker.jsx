const COLORS = [
  { name: 'Tomato',    hex: '#d50000' },
  { name: 'Flamingo',  hex: '#e67c73' },
  { name: 'Tangerine', hex: '#f4511e' },
  { name: 'Banana',    hex: '#f6bf26' },
  { name: 'Sage',      hex: '#33b679' },
  { name: 'Basil',     hex: '#0b8043' },
  { name: 'Peacock',   hex: '#039be5' },
  { name: 'Blueberry', hex: '#3f51b5' },
  { name: 'Lavender',  hex: '#7986cb' },
  { name: 'Grape',     hex: '#8e24aa' },
  { name: 'Graphite',  hex: '#616161' },
]

export { COLORS }

export default function ColorPicker({ value, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {COLORS.map((c) => (
        <button
          key={c.hex}
          title={c.name}
          onClick={() => onChange(c.hex)}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1"
          style={{ backgroundColor: c.hex }}
        >
          {value === c.hex && (
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      ))}
    </div>
  )
}
