import type { NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import {
  transformItemsInText,
  transformTextInItems,
} from '@/helpers/transforms'
import { CreateCompletion } from '@/services/CompletionIA'
import { ACTION_ITEMS } from '@/services/system-content'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { Models } from '@/services/CompletionIA'

const MODELS = {
  'claude-3-5-sonnet': {
    instance: new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    }),
    model: 'claude-3-5-sonnet-20240620' as Models,
  },
  'gpt-4o-mini': {
    instance: new OpenAI(),
    model: 'gpt-4o-mini' as Models,
  },
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)

    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items, model = 'claude-3-5-sonnet' } = await req.json()
    const selectedModel = MODELS[model as keyof typeof MODELS]

    if (!selectedModel) {
      return Response.json(
        { error: 'Invalid model', message: 'Invalid model' },
        { status: 400 },
      )
    }

    const completion = await CreateCompletion({
      ...selectedModel,
      systemContent: ACTION_ITEMS,
      userContent: transformItemsInText(items),
    })

    return Response.json(
      {
        suggested_action_items: transformTextInItems(
          completion.messages[0].text || '',
        ),
      },
      { status: 200 },
    )
  } catch (e: any) {
    return Response.json(
      { error: 'Invalid request', message: e.message },
      { status: 500 },
    )
  }
}
