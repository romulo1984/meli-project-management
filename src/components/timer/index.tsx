'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface TimerProps {
  timer: number
  start: number
  status: string
  setTimer: (timer: number) => void
  startTimer: () => void
  resetTimer: () => void
}

const msInDisplayTimer = (ms: number) => {
  const seconds = (Math.floor(ms / 1000) % 60).toString().padStart(2, '0')
  const minutes = (Math.floor(ms / 1000 / 60) % 60).toString().padStart(2, '0')
  const hours = (Math.floor(ms / 1000 / 60 / 60) % 60).toString().padStart(2, '0')
  return { hours, minutes, seconds }
}

// Bounds for a custom timer duration (input validation).
const MIN_TIMER_MS = 1000 // 1 second
const MAX_TIMER_MS = 24 * 60 * 60 * 1000 // 24 hours
const MAX_CUSTOM_MINUTES = MAX_TIMER_MS / 1000 / 60 // 1440

// Strictly parse a user-entered minutes:seconds duration into a bounded number
// of milliseconds. Returns null for empty / NaN / negative / non-integer /
// out-of-range input so callers never persist a garbage timer value
// (allowlist-style validation — CWE-20 / CWE-190). Values above the max are
// clamped rather than rejected so long entries still resolve to a sane timer.
const parseCustomDurationMs = (
  minutesInput: string,
  secondsInput: string
): number | null => {
  const minutes = Number(minutesInput.trim() === '' ? '0' : minutesInput)
  const seconds = Number(secondsInput.trim() === '' ? '0' : secondsInput)

  const isSafeCount = (n: number) => Number.isInteger(n) && n >= 0
  if (!isSafeCount(minutes) || !isSafeCount(seconds)) return null

  const totalMs = (minutes * 60 + seconds) * 1000
  if (!Number.isFinite(totalMs) || totalMs < MIN_TIMER_MS) return null

  return Math.min(totalMs, MAX_TIMER_MS)
}

export default function Timer (props: TimerProps) {
  const { timer, start, setTimer, startTimer, resetTimer, status } = props
  const [displayTimer, setDisplayTimer] = useState(msInDisplayTimer(timer))
  const [showTimeOptions, setShowTimeOptions] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [customMinutes, setCustomMinutes] = useState('')
  const [customSeconds, setCustomSeconds] = useState('')
  const [customError, setCustomError] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // On mobile the time options open in a modal instead of expanding inline
  // (the inline row is cramped on a phone). Desktop keeps the inline UI.
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Prefill the custom fields with the current duration when the mobile modal
  // opens, so the user edits from a sensible starting point.
  useEffect(() => {
    if (!isMobile || !showTimeOptions) return
    const totalSeconds = Math.floor(timer / 1000)
    setCustomMinutes(String(Math.floor(totalSeconds / 60)))
    setCustomSeconds(String(totalSeconds % 60))
    setCustomError(false)
  }, [isMobile, showTimeOptions, timer])

  const handleShowTimeOptions = useCallback(() => {
    setShowTimeOptions((prev) => !prev)
  }, [])

  const handleSetTimer = useCallback((ms: number) => {
    setTimer(ms)
    setShowCustom(false)
    setShowTimeOptions(false)
  }, [setTimer])

  // Reveal the custom field, prefilling it with the current duration so the
  // user edits from a sensible starting point.
  const handleToggleCustom = useCallback(() => {
    setShowCustom((prev) => {
      const next = !prev
      if (next) {
        const totalSeconds = Math.floor(timer / 1000)
        setCustomMinutes(String(Math.floor(totalSeconds / 60)))
        setCustomSeconds(String(totalSeconds % 60))
        setCustomError(false)
      }
      return next
    })
  }, [timer])

  const handleCustomFieldChange = useCallback(
    (setter: (value: string) => void) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setter(event.target.value)
        setCustomError(false)
      },
    []
  )

  const handleSetCustomTimer = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const ms = parseCustomDurationMs(customMinutes, customSeconds)
      if (ms === null) {
        setCustomError(true)
        return
      }
      handleSetTimer(ms)
    },
    [customMinutes, customSeconds, handleSetTimer]
  )

  useEffect(() => {
    let interval: any
    const updateTimer = () => {
      const now = new Date().getTime()
      const elapsedTime = Math.max(timer - (now - start), 0) + 1000
      
      if (elapsedTime <= 1000) {
        audioRef.current?.play()
        setDisplayTimer(msInDisplayTimer(timer))
        resetTimer()
      } else {
        setDisplayTimer(msInDisplayTimer(elapsedTime))
      }
    }

    if (status === 'started') {
      interval = setInterval(updateTimer, 1000)
    } else {
      setDisplayTimer(msInDisplayTimer(timer))
    }

    return () => clearInterval(interval)
  }, [status, start, timer, resetTimer])

  return (
    <div className={`${status === 'started' ? 'bg-red-200' : 'bg-slate-50'} flex items-center gap-4 px-4 py-2 rounded-lg`}>
      <button onClick={handleShowTimeOptions}>
        <svg className='scale-[0.8] fill-slate-400' xmlns='http://www.w3.org/2000/svg' height='1em' viewBox='0 0 320 512'>
          {showTimeOptions ?
            <path d='M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z' />
            :
            <path d='M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z' />
          }
        </svg>
      </button>

      {showTimeOptions &&
        <div className='hidden md:flex flex-wrap items-center gap-3'>
          <button className='bg-slate-200 px-2 rounded' onClick={() => handleSetTimer(45000)}>45s</button>
          <button className='bg-slate-200 px-2 rounded' onClick={() => handleSetTimer(60000)}>60s</button>
          <button className='bg-slate-200 px-2 rounded' onClick={() => handleSetTimer(120000)}>2min</button>
          <button className='bg-slate-200 px-2 rounded' onClick={() => handleSetTimer(300000)}>5min</button>
          <button
            className={`px-2 rounded ${showCustom ? 'bg-slate-400 text-white' : 'bg-slate-200'}`}
            onClick={handleToggleCustom}
            aria-expanded={showCustom}
          >
            Custom
          </button>

          {showCustom &&
            <form className='flex items-center gap-1' onSubmit={handleSetCustomTimer}>
              <input
                type='number'
                inputMode='numeric'
                min={0}
                max={MAX_CUSTOM_MINUTES}
                step={1}
                aria-label='Minutes'
                placeholder='mm'
                value={customMinutes}
                onChange={handleCustomFieldChange(setCustomMinutes)}
                className={`w-12 text-center rounded border bg-white px-1 py-0.5 outline-none ${customError ? 'border-red-400' : 'border-slate-300'}`}
              />
              <span className='text-slate-400'>:</span>
              <input
                type='number'
                inputMode='numeric'
                min={0}
                max={59}
                step={1}
                aria-label='Seconds'
                placeholder='ss'
                value={customSeconds}
                onChange={handleCustomFieldChange(setCustomSeconds)}
                className={`w-12 text-center rounded border bg-white px-1 py-0.5 outline-none ${customError ? 'border-red-400' : 'border-slate-300'}`}
              />
              <button
                type='submit'
                className='bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-0.5 rounded'
              >
                Set
              </button>
            </form>
          }
        </div>
      }
      
      <p className={status === 'started' ? 'text-slate-600' : 'text-slate-400'}>{displayTimer.hours !== '00' && `${displayTimer.hours}:`}{displayTimer.minutes}:{displayTimer.seconds}</p>
      
      {status === 'started' ?
        <button onClick={resetTimer}>
          <svg xmlns='http://www.w3.org/2000/svg' height='1em' viewBox='0 0 512 512'>
            <path d='M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm192-96H320c17.7 0 32 14.3 32 32V320c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V192c0-17.7 14.3-32 32-32z' />
          </svg>
        </button>
      :
        <button onClick={startTimer}>
          <svg className='fill-green-600' xmlns='http://www.w3.org/2000/svg' height='1em' viewBox='0 0 512 512'>
            <path d='M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c7.6-4.2 16.8-4.1 24.3 .5l144 88c7.1 4.4 11.5 12.1 11.5 20.5s-4.4 16.1-11.5 20.5l-144 88c-7.4 4.5-16.7 4.7-24.3 .5s-12.3-12.2-12.3-20.9V168c0-8.7 4.7-16.7 12.3-20.9z' />
          </svg>
        </button>
      }
      <audio ref={audioRef} src='/alarm.mp3' preload='auto' />

      {/* Mobile: the time options open in a modal instead of the inline row. */}
      <Dialog
        open={isMobile && showTimeOptions}
        onOpenChange={open => {
          if (!open) {
            setShowTimeOptions(false)
            setShowCustom(false)
          }
        }}
      >
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle className='text-lg text-zinc-700'>Set timer</DialogTitle>
          </DialogHeader>
          <div className='grid grid-cols-2 gap-2'>
            {[
              { label: '45s', ms: 45000 },
              { label: '1 min', ms: 60000 },
              { label: '2 min', ms: 120000 },
              { label: '5 min', ms: 300000 },
            ].map(({ label, ms }) => (
              <button
                key={ms}
                type='button'
                onClick={() => handleSetTimer(ms)}
                className='rounded-lg bg-slate-100 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200'
              >
                {label}
              </button>
            ))}
          </div>
          <form
            onSubmit={handleSetCustomTimer}
            className='flex items-center gap-2 border-t border-zinc-100 pt-4'
          >
            <span className='text-sm text-zinc-500'>Custom</span>
            <input
              type='number'
              inputMode='numeric'
              min={0}
              max={MAX_CUSTOM_MINUTES}
              step={1}
              aria-label='Minutes'
              placeholder='mm'
              value={customMinutes}
              onChange={handleCustomFieldChange(setCustomMinutes)}
              className={`w-14 rounded-lg border bg-white px-2 py-1.5 text-center outline-none ${customError ? 'border-red-400' : 'border-slate-300'}`}
            />
            <span className='text-slate-400'>:</span>
            <input
              type='number'
              inputMode='numeric'
              min={0}
              max={59}
              step={1}
              aria-label='Seconds'
              placeholder='ss'
              value={customSeconds}
              onChange={handleCustomFieldChange(setCustomSeconds)}
              className={`w-14 rounded-lg border bg-white px-2 py-1.5 text-center outline-none ${customError ? 'border-red-400' : 'border-slate-300'}`}
            />
            <button
              type='submit'
              className='ml-auto rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500'
            >
              Set
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}