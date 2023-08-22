import { useState } from 'react'
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

export default function useVoiceToText () {
  const [text, setText] = useState('')
  const [recognizing, setRecognizing] = useState(false)

  const startRecognition = () => {
    setRecognizing(true)
    const recognition = new SpeechRecognition()
    recognition.onresult = (event: { results: { transcript: any }[][] }) => {
      const spokenText = event.results[0][0].transcript
      setText(spokenText)
      setRecognizing(false)
    }

    recognition.start()
  }

  return {
    text,
    recognizing,
    startRecognition
  }
}
