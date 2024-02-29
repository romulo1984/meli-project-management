'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

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

export default function Timer (props: TimerProps) {
  const { timer, start, setTimer, startTimer, resetTimer, status } = props
  const [displayTimer, setDisplayTimer] = useState(msInDisplayTimer(timer))
  const [showTimeOptions, setShowTimeOptions] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleShowTimeOptions = useCallback(() => {
    setShowTimeOptions((prev) => !prev)
  }, [])

  const handleSetTimer = useCallback((ms: number) => {
    setTimer(ms)
    setShowTimeOptions(false)
  }, [])

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
        <div className='flex gap-3'>
          <button className='bg-slate-200 px-2 rounded' onClick={() => handleSetTimer(45000)}>45s</button>
          <button className='bg-slate-200 px-2 rounded' onClick={() => handleSetTimer(60000)}>60s</button>
          <button className='bg-slate-200 px-2 rounded' onClick={() => handleSetTimer(120000)}>2min</button>
          <button className='bg-slate-200 px-2 rounded' onClick={() => handleSetTimer(300000)}>5min</button>
        </div>
      }
      
      <p className={status === 'started' ? 'text-slate-600' : 'text-slate-400'}>{displayTimer.minutes}:{displayTimer.seconds}</p>
      
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
    </div>
  )
}