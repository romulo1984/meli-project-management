'use client'
import { faChevronRight, faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

/**
 * The settings menu renders a list of rows inside a gear-triggered popover.
 *
 * A row is one of three shapes — a clean superset:
 *   - a TOGGLE row (`active` + `onToggle`) shown as an on/off switch,
 *   - an ACTION row (`onSelect`) shown as a clickable row with a chevron
 *     affordance that runs the callback and closes the popover, or
 *   - a STEPPER row (`value` + `onChange`) shown as a `−  value  +` numeric
 *     control that respects `min`/`max` and leaves the popover open.
 *
 * The API is intentionally minimal and self-contained so new settings can be
 * added by the caller with a single object literal — no changes to this file.
 */
interface SettingsMenuItemBase {
  key: string
  label: string
  description?: string
  disabled?: boolean
}

/** A setting that flips on/off. Renders and behaves like the original row. */
export interface SettingsMenuToggleItem extends SettingsMenuItemBase {
  active: boolean
  onToggle: () => void
}

/** A one-shot action: runs `onSelect`, then closes the popover. */
export interface SettingsMenuActionItem extends SettingsMenuItemBase {
  onSelect: () => void
}

/** A bounded integer setting shown as a `−  value  +` stepper. */
export interface SettingsMenuStepperItem extends SettingsMenuItemBase {
  value: number
  min: number
  max?: number
  onChange: (value: number) => void
}

export type SettingsMenuItem =
  | SettingsMenuToggleItem
  | SettingsMenuActionItem
  | SettingsMenuStepperItem

// Stepper rows are the ones that expose `onChange`.
function isStepperItem(item: SettingsMenuItem): item is SettingsMenuStepperItem {
  return 'onChange' in item
}

// Action rows are the ones that expose `onSelect`; everything else is a toggle.
function isActionItem(item: SettingsMenuItem): item is SettingsMenuActionItem {
  return 'onSelect' in item
}

interface SettingsMenuProps {
  items: SettingsMenuItem[]
}

// Shared row shell so toggle and action rows stay visually in sync.
const rowClassName = (disabled?: boolean) =>
  cn(
    'flex items-center justify-between gap-3 rounded-md px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
    disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-zinc-50',
  )

function RowLabel({
  label,
  description,
}: {
  label: string
  description?: string
}) {
  return (
    <span className="flex flex-col">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      {description && (
        <span className="text-xs text-zinc-400">{description}</span>
      )}
    </span>
  )
}

// `−  value  +` numeric control. Presentational + self-contained: it clamps to
// [min, max] by disabling the button at each bound and never emits a value out
// of range. The consumer's own handler should still validate/clamp server-side.
function Stepper({
  value,
  min,
  max,
  disabled,
  onChange,
}: {
  value: number
  min: number
  max?: number
  disabled?: boolean
  onChange: (value: number) => void
}) {
  const canDecrease = !disabled && value > min
  const canIncrease = !disabled && (max === undefined || value < max)

  const stepButton =
    'flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'

  return (
    <span className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        aria-label="Decrease"
        disabled={!canDecrease}
        onClick={() => canDecrease && onChange(value - 1)}
        className={stepButton}
      >
        −
      </button>
      <span className="w-5 text-center text-sm font-medium tabular-nums text-zinc-700">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase"
        disabled={!canIncrease}
        onClick={() => canIncrease && onChange(value + 1)}
        className={stepButton}
      >
        +
      </button>
    </span>
  )
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
  // Controlled so action rows can close the popover on select; toggle rows
  // leave it open, exactly as before.
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
          {items.map(item =>
            isStepperItem(item) ? (
              <div
                key={item.key}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-md px-2.5 py-2',
                  item.disabled && 'opacity-50',
                )}
              >
                <RowLabel label={item.label} description={item.description} />
                <Stepper
                  value={item.value}
                  min={item.min}
                  max={item.max}
                  disabled={item.disabled}
                  onChange={item.onChange}
                />
              </div>
            ) : isActionItem(item) ? (
              <button
                key={item.key}
                type="button"
                aria-label={item.label}
                disabled={item.disabled}
                onClick={() => {
                  item.onSelect()
                  setOpen(false)
                }}
                className={rowClassName(item.disabled)}
              >
                <RowLabel label={item.label} description={item.description} />
                <FontAwesomeIcon
                  icon={faChevronRight}
                  aria-hidden="true"
                  className="shrink-0 text-xs text-zinc-300"
                />
              </button>
            ) : (
              <button
                key={item.key}
                type="button"
                role="switch"
                aria-checked={item.active}
                aria-label={item.label}
                disabled={item.disabled}
                onClick={item.onToggle}
                className={rowClassName(item.disabled)}
              >
                <RowLabel label={item.label} description={item.description} />
                <Switch active={item.active} />
              </button>
            ),
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
