export default function SpechText (text: string) {
  const SpechText = new SpeechSynthesisUtterance()
  SpechText.text = text
  SpechText.lang = 'pt-BR'
  SpechText.rate = 0.9
  SpechText.pitch = 1
  SpechText.volume = 1

  speechSynthesis.speak(SpechText)
}