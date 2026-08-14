'use client'
import { Highlighter } from 'lucide-react'

interface HighlightToggleProps {
  /** The local user currently controls highlighting. */
  active: boolean
  /** Another participant currently controls highlighting. */
  controlledByOther: boolean
  /** Disabled for other reasons (e.g. no display name yet). */
  disabled?: boolean
  onToggle: () => void
}

export default function HighlightToggle({
  active,
  controlledByOther,
  disabled = false,
  onToggle,
}: HighlightToggleProps) {
  const isDisabled = disabled || controlledByOther

  const title = controlledByOther
    ? 'Highlight mode is in use by another participant'
    : active
      ? 'Highlight mode on — hover a card to highlight it for everyone'
      : 'Turn on Highlight mode to highlight cards for everyone'

  const stateClasses = active
    ? 'bg-pink-100 text-pink-500 outline outline-2 outline-pink-400'
    : 'bg-slate-50 text-zinc-400'

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isDisabled}
      aria-pressed={active}
      title={title}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${stateClasses} ${
        isDisabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <Highlighter className="h-4 w-4" strokeWidth={1.5} />
      <span className="text-sm">
        {controlledByOther ? 'Highlighting (in use)' : 'Highlight'}
      </span>
    </button>
  )
}
