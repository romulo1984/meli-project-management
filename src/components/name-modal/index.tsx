'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useIdentity } from '@/contexts/IdentityProvider'
import {
  generateAvatarDataUri,
  isValidName,
  MAX_NAME_LENGTH,
  normalizeName,
  suggestName,
} from '@/helpers/localIdentity'
import {
  AVATAR_ACCEPT_ATTR,
  processAvatarFile,
} from '@/helpers/avatarImage'

export default function NameModal() {
  const {
    anonId,
    name,
    customAvatar,
    nameModalMode,
    isNameModalOpen,
    saveName,
    closeNameModal,
  } = useIdentity()

  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)
  // Pending avatar change staged in the modal (not yet saved):
  //   undefined → no change (keep the stored avatar)
  //   string    → newly uploaded custom avatar
  //   null       → cleared back to the generated letter avatar
  const [pendingAvatar, setPendingAvatar] = useState<string | null | undefined>(
    undefined,
  )
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Seed the field each time the modal opens: current name when editing, a
  // friendly suggestion on first welcome. Also reset any staged avatar change.
  useEffect(() => {
    if (!isNameModalOpen) return
    setPendingAvatar(undefined)
    setAvatarError(null)
    if (nameModalMode === 'edit') {
      setValue(name)
    } else {
      setValue(name || suggestName())
    }
    const id = window.setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 60)
    return () => window.clearTimeout(id)
  }, [isNameModalOpen, nameModalMode, name])

  const valid = isValidName(value)
  const generatedAvatar = useMemo(
    () => generateAvatarDataUri(anonId || 'anon', value || '?'),
    [anonId, value],
  )
  // Effective custom avatar for the preview: a staged change wins, otherwise
  // fall back to whatever is currently saved.
  const effectiveCustomAvatar =
    pendingAvatar === undefined ? customAvatar : pendingAvatar
  const previewAvatar = effectiveCustomAvatar || generatedAvatar

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    // Reset the input so selecting the same file again re-triggers onChange.
    e.target.value = ''
    if (!file) return
    setAvatarError(null)
    setProcessing(true)
    try {
      const result = await processAvatarFile(file)
      if (result.ok) {
        setPendingAvatar(result.dataUri)
      } else {
        setAvatarError(result.error)
      }
    } finally {
      setProcessing(false)
    }
  }

  const handleUseLetter = () => {
    setAvatarError(null)
    setPendingAvatar(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid || saving) return
    setSaving(true)
    try {
      await saveName(value, pendingAvatar)
    } finally {
      setSaving(false)
    }
  }

  const isWelcome = nameModalMode === 'welcome'

  return (
    <Dialog
      open={isNameModalOpen}
      onOpenChange={open => {
        if (!open) closeNameModal()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-zinc-700">
            {isWelcome ? 'Welcome to /retrospectool 👋' : 'Edit your name'}
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            {isWelcome
              ? 'Pick a display name so your teammates know who wrote what. It stays on this device — no sign-up needed.'
              : 'Update how your name appears. Your identity and existing notes stay the same.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewAvatar}
              alt="Your avatar"
              width={56}
              height={56}
              className="h-14 w-14 rounded-full shadow-sm shrink-0"
            />
            <div className="flex flex-col w-full">
              <label
                htmlFor="display-name-input"
                className="text-xs font-medium text-zinc-400 mb-1"
              >
                Display name
              </label>
              <input
                id="display-name-input"
                ref={inputRef}
                value={value}
                maxLength={MAX_NAME_LENGTH}
                onChange={e => setValue(e.target.value)}
                placeholder="e.g. Alex from Payments"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-zinc-700 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              <span className="mt-1 text-xs text-zinc-400">
                {normalizeName(value).length}/{MAX_NAME_LENGTH}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={AVATAR_ACCEPT_ATTR}
              onChange={handleFileChange}
              className="hidden"
              aria-hidden="true"
              tabIndex={-1}
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={processing || saving}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing ? 'Processing…' : 'Upload photo'}
              </button>
              {Boolean(effectiveCustomAvatar) && (
                <button
                  type="button"
                  onClick={handleUseLetter}
                  disabled={processing || saving}
                  className="text-sm text-zinc-500 underline-offset-2 transition-colors hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Use letter avatar
                </button>
              )}
            </div>
            {avatarError ? (
              <p className="text-xs text-red-500">{avatarError}</p>
            ) : (
              <p className="text-xs text-zinc-400">
                PNG, JPEG, WebP or GIF, up to 5&nbsp;MB. Stays on this device.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!valid || saving}
            className="w-full rounded-2xl bg-indigo-600 px-8 py-3 font-medium text-slate-100 transition-colors hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {saving ? 'Saving…' : isWelcome ? "Let's go" : 'Save name'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
