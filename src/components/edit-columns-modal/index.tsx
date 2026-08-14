'use client'
import { useEffect, useState } from 'react'
import { Id } from '@convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Column = 'good' | 'bad' | 'action'

// Keep in sync with MAX_COLUMN_LABEL_LENGTH in convex/retros.ts (server clamps too).
const MAX_COLUMN_LABEL_LENGTH = 30

const DEFAULT_LABELS: Record<Column, string> = {
  good: 'Good',
  bad: 'Bad',
  action: 'Actions',
}

const FIELDS: { column: Column; label: string }[] = [
  { column: 'good', label: 'Good column' },
  { column: 'bad', label: 'Bad column' },
  { column: 'action', label: 'Actions column' },
]

interface EditColumnsModalProps {
  retroId?: Id<'retros'>
  open: boolean
  onOpenChange: (open: boolean) => void
  // Already resolved to the defaults ("Good"/"Bad"/"Actions") when unset.
  goodLabel: string
  badLabel: string
  actionLabel: string
}

export default function EditColumnsModal(props: EditColumnsModalProps) {
  const { retroId, open, onOpenChange, goodLabel, badLabel, actionLabel } =
    props
  const UpdateColumnLabel = useMutation(api.retros.updateColumnLabel)
  const [labels, setLabels] = useState<Record<Column, string>>({
    good: goodLabel,
    bad: badLabel,
    action: actionLabel,
  })
  const [saving, setSaving] = useState(false)

  // Seed the fields with the current labels each time the modal opens.
  useEffect(() => {
    if (!open) return
    setLabels({ good: goodLabel, bad: badLabel, action: actionLabel })
  }, [open, goodLabel, badLabel, actionLabel])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!retroId || saving) return
    setSaving(true)
    try {
      const current: Record<Column, string> = {
        good: goodLabel,
        bad: badLabel,
        action: actionLabel,
      }
      // Trim + clamp client-side (empty falls back to the default), then write
      // once per changed label — no per-keystroke mutations. React auto-escapes
      // the label when it is rendered back into the headers (XSS-safe).
      const updates = FIELDS.map(({ column }) => {
        const label =
          labels[column].trim().slice(0, MAX_COLUMN_LABEL_LENGTH) ||
          DEFAULT_LABELS[column]
        return { column, label }
      }).filter(({ column, label }) => label !== current[column])

      await Promise.all(
        updates.map(({ column, label }) =>
          UpdateColumnLabel({ id: retroId, column, label }),
        ),
      )
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-zinc-700">
            Edit column labels
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Rename the three columns for this retro. Leave a field empty to
            restore its default name.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
          {FIELDS.map(({ column, label }) => (
            <div key={column} className="flex flex-col w-full">
              <label
                htmlFor={`column-label-${column}`}
                className="text-xs font-medium text-zinc-400 mb-1"
              >
                {label}
              </label>
              <input
                id={`column-label-${column}`}
                value={labels[column]}
                maxLength={MAX_COLUMN_LABEL_LENGTH}
                onChange={e =>
                  setLabels(prev => ({ ...prev, [column]: e.target.value }))
                }
                placeholder={DEFAULT_LABELS[column]}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-700 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-indigo-600 px-8 py-3 font-medium text-slate-100 transition-colors hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
