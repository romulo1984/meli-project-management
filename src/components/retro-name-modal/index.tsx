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

// Keep in sync with the clamp in convex/retros.ts (server clamps too).
const MAX_RETRO_NAME_LENGTH = 60

interface RetroNameModalProps {
  retroId?: Id<'retros'>
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
}

export default function RetroNameModal(props: RetroNameModalProps) {
  const { retroId, open, onOpenChange, name } = props
  const UpdateRetro = useMutation(api.retros.update)
  const [value, setValue] = useState(name)
  const [saving, setSaving] = useState(false)

  // Seed the field with the current name each time the modal opens.
  useEffect(() => {
    if (open) setValue(name)
  }, [open, name])

  const trimmed = value.trim().slice(0, MAX_RETRO_NAME_LENGTH)
  const valid = trimmed.length >= 1

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!retroId || !valid || saving) return
    setSaving(true)
    try {
      // Save once on submit (no per-keystroke writes). React auto-escapes the
      // name when it is rendered back into the header (XSS-safe).
      if (trimmed !== name) {
        await UpdateRetro({ id: retroId, name: trimmed })
      }
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-zinc-700">Rename retro</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Give this retrospective a clear title.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
          <div className="flex flex-col w-full">
            <label
              htmlFor="retro-name-input"
              className="text-xs font-medium text-zinc-400 mb-1"
            >
              Retro name
            </label>
            <input
              id="retro-name-input"
              value={value}
              maxLength={MAX_RETRO_NAME_LENGTH}
              autoFocus
              onChange={e => setValue(e.target.value)}
              placeholder="e.g. Sprint 42 retro"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-700 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <button
            type="submit"
            disabled={!valid || saving}
            className="w-full rounded-2xl bg-indigo-600 px-8 py-3 font-medium text-slate-100 transition-colors hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
