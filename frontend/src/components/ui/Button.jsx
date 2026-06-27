import clsx from 'clsx'

const variants = {
  primary:   'bg-gcal-blue text-white hover:bg-gcal-blue-hover',
  secondary: 'border border-gcal-border text-gcal-text hover:bg-gcal-hover',
  ghost:     'text-gcal-text hover:bg-gcal-hover',
  danger:    'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20',
}
const sizes = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
}

export default function Button({ variant='secondary', size='md', className, children, ...props }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center gap-2 rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gcal-blue/40',
        variants[variant], sizes[size], className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
