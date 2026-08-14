'use client'
import { useState } from 'react'
import { toast } from 'react-toastify'

export default function useVoiceToText() {
  const [text, setText] = useState('')
  const [recognizing, setRecognizing] = useState(false)

  const startRecognition = () => {
    // Resolve the constructor from the real global at click time (client only).
    // Chromium exposes it as `webkitSpeechRecognition`; some browsers don't have
    // it at all — fall back gracefully instead of throwing.
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
    setRecognizing(true)

    recognition.onresult = (event: any) => {
      const spokenText = event.results[0][0].transcript
      setText(spokenText)
      setRecognizing(false)
    }
    recognition.onerror = () => setRecognizing(false)
    recognition.onend = () => setRecognizing(false)

    recognition.start()
  }

  return {
    text,
    recognizing,
    startRecognition,
  }
}
