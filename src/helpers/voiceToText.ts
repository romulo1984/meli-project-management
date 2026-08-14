'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

/**
 * Speech-to-text via the Web Speech API.
 *
 * `onResult` is called with the (growing) transcript as the user speaks, so
 * the caller can write it straight into its own state. We keep the latest
 * callback in a ref so an in-flight recognition session always uses fresh
 * state without being torn down and recreated on every render.
 */
export default function useVoiceToText(onResult?: (text: string) => void) {
  const [recognizing, setRecognizing] = useState(false)
  const recognitionRef = useRef<any>(null)
  const onResultRef = useRef(onResult)

  useEffect(() => {
    onResultRef.current = onResult
  }, [onResult])

  const stopRecognition = useCallback(() => {
    const recognition = recognitionRef.current
    recognitionRef.current = null
    if (recognition) {
      // Detach handlers first so abort() doesn't re-enter our state setters.
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      try {
        recognition.abort()
      } catch {
        /* already stopped */
      }
    }
    setRecognizing(false)
  }, [])

  const startRecognition = useCallback(() => {
    // Tapping the control while it is already listening stops it (toggle).
    if (recognitionRef.current) {
      stopRecognition()
      return
    }

    // Resolve the constructor from the real global at click time (client
    // only). Chromium exposes it as `webkitSpeechRecognition`; browsers
    // without it fall back gracefully instead of throwing.
    const SpeechRecognitionCtor =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition
        : undefined

    if (!SpeechRecognitionCtor) {
      toast('Voice input is not supported in this browser')
      return
    }

    const recognition = new SpeechRecognitionCtor()
    recognitionRef.current = recognition
    recognition.lang =
      typeof navigator !== 'undefined' ? navigator.language || 'en-US' : 'en-US'
    recognition.interimResults = true
    recognition.continuous = false

    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      onResultRef.current?.(transcript)
    }
    recognition.onerror = () => {
      recognitionRef.current = null
      setRecognizing(false)
    }
    recognition.onend = () => {
      recognitionRef.current = null
      setRecognizing(false)
    }

    setRecognizing(true)
    recognition.start()
  }, [stopRecognition])

  // Stop listening if the component using the hook unmounts.
  useEffect(() => stopRecognition, [stopRecognition])

  return {
    recognizing,
    startRecognition,
    stopRecognition,
  }
}
