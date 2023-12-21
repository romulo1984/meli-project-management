import { NextResponse, type NextRequest } from 'next/server'
import { ElevenLabs } from '@/services/ElevenLabs'

const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY || ''

export async function POST(request: NextRequest) {
  const { text } = await request.json()

  const elevenLabs = new ElevenLabs('v1', ELEVEN_LABS_API_KEY)

  const response = await elevenLabs.TextToSpeech(text)
  const blob = await response.blob()

  const headers = new Headers()
  headers.set('Content-Type', 'audio/mpeg')

  return new NextResponse(blob, { status: 200, statusText: 'OK', headers })
}