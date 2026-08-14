'use client'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

/**
 * A single toggle row in the settings menu.
 *
 * The API is intentionally minimal and self-contained so new settings can be
 * added by the caller with a single object literal — no changes to this file.
 */
export interface SettingsMenuItem {
  key: string
  label: string
  description?: string
  active: boolean
  disabled?: boolean
  onToggle: () => void
}

interface SettingsMenuProps {
  items: SettingsMenuItem[]
}

// Small on/off switch styled with the app's zinc/indigo palette. Presentational
// only — the surrounding row owns the click/keyboard behaviour and aria state.
function Switch({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
        active ? 'bg-indigo-600' : 'bg-zinc-200',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          active ? 'translate-x-4' : 'translate-x-0.5',
        )}
      />
    </span>
  )
}

export default function SettingsMenu({ items }: SettingsMenuProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Settings"
          className="p-2 px-5 rounded-lg bg-slate-50 text-zinc-400 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <FontAwesomeIcon icon={faGear} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-64 rounded-lg border-zinc-200 bg-white p-0 shadow-lg"
      >
        <div className="border-b border-zinc-100 px-4 py-3">
          <p className="text-sm font-medium text-zinc-700">Settings</p>
          <p className="text-xs text-zinc-400">Board preferences</p>
        </div>
        <div className="flex flex-col p-1.5">
          {items.map(item => (
            <button
              key={item.key}
              type="button"
              role="switch"
              aria-checked={item.active}
              aria-label={item.label}
              disabled={item.disabled}
              onClick={item.onToggle}
              className={cn(
                'flex items-center justify-between gap-3 rounded-md px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                item.disabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-zinc-50',
              )}
            >
              <span className="flex flex-col">
                <span className="text-sm font-medium text-zinc-700">
                  {item.label}
                </span>
                {item.description && (
                  <span className="text-xs text-zinc-400">
                    {item.description}
                  </span>
                )}
              </span>
              <Switch active={item.active} />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
