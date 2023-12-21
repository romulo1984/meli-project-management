const API_BASE_URL = 'https://api.elevenlabs.io'
const VOICE_ID = 'vVDelcAKq1jRPXONbBPZ'
const MODEL_ID = 'eleven_multilingual_v2'

export class ElevenLabs {
    private version: string
    private apiKey: string

    constructor(version: string, apiKey: string) {
      this.version = version
      this.apiKey = apiKey
    }

    async TextToSpeech(text: string) {
      const url = `${API_BASE_URL}/${this.version}/text-to-speech/${VOICE_ID}`
      const data = {
        model_id: MODEL_ID,
        text: this._prepareTextToSpeech(text),
        voice_settings: {
          similarity_boost: 1,
          stability: 0.5,
          style: 0.5,
          use_speaker_boost: true,
        }
      }

      return fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        }
      })
    }

    private _prepareTextToSpeech(text: string) {
      const firstLetter = text
        .trim()
        .charAt(0)
        .toUpperCase()
      
      const restOfText = text
        .trim()
        .slice(1)

      const lastLetter = restOfText.slice(-1)

      return `${firstLetter}${restOfText}${['?', '!', '.'].includes(lastLetter) ? '' : '.'}`
    }
}