export default async function SpechText (text: string, type: 'AI' | 'native' = 'native') {
  if (type === 'native') {
    const SpechText = new SpeechSynthesisUtterance()
    SpechText.text = text
    SpechText.lang = 'pt-BR'
    SpechText.rate = 0.9
    SpechText.pitch = 1
    SpechText.volume = 1
  
    speechSynthesis.speak(SpechText)

    return
  }


  const response = await fetch('/api/speech', {
    method: 'POST',
    body: JSON.stringify({ text }),
    headers: {
      'Content-Type': 'application/json'
    },
    cache: 'force-cache',
    next: {
      revalidate: 3600 * 60 * 24 * 30
    }
  })

  const audio = new Audio(URL.createObjectURL(await response.blob()))
  audio.play()
}