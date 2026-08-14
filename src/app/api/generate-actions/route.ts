import { type NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import {
  transformItemsInText,
  transformTextInItems,
} from '@/helpers/transforms'
import { CreateCompletion } from '@/services/CompletionIA'
import { ACTION_ITEN } from '@/services/system-content'
import { MODELS } from '@/constants/models'
import { CLERK_AUTH_ENABLED } from '@/config/features'

const MAX_ITEMS = 100
const MAX_ITEM_LENGTH = 2000

export async function POST(req: NextRequest) {
  try {
    // When Clerk is enabled, require an authenticated user. In the anonymous
    // model there is no server-side principal (documented tradeoff, same as
    // /api/speech); the input validation below bounds abuse of the AI provider.
    if (CLERK_AUTH_ENABLED) {
      const { userId } = getAuth(req)
      if (!userId) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = await req.json()
    const model =
      typeof body?.model === 'string' ? body.model : 'claude-3-5-sonnet'
    const items = body?.items

    // Validate the shape/size of external input before calling the model.
    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > MAX_ITEMS ||
      !items.every(i => typeof i === 'string' && i.length <= MAX_ITEM_LENGTH)
    ) {
      return Response.json(
        { error: 'Invalid items' },
        { status: 400 },
      )
    }

    const selectedModel = MODELS[model as keyof typeof MODELS]

    if (!selectedModel) {
      return Response.json(
        { error: 'Invalid model', message: 'Invalid model' },
        { status: 400 },
      )
    }

    const completion = await CreateCompletion({
      ...selectedModel,
      systemContent: ACTION_ITEN,
      userContent: transformItemsInText(items),
    })

    return Response.json(
      {
        suggested_action_items: transformTextInItems(completion || ''),
      },
      { status: 200 },
    )
  } catch (e: any) {
    // Log details server-side; return a generic message to avoid leaking internals.
    console.error('generate-actions failed:', e?.message)
    return Response.json({ error: 'Invalid request' }, { status: 500 })
  }
}
