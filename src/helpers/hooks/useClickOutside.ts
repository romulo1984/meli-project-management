'use client'
import { useRef, useEffect, RefObject } from 'react'

export default function useClickOutside (callback: () => void) {
  const ref: RefObject<HTMLDivElement> = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    document.addEventListener('click', handleClickOutside, true)
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [ref, callback])

  return ref
}
