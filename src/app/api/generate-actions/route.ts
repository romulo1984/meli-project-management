import {
  transformItemsInText,
  transformTextInItems,
} from '@/helpers/transforms'
import { CreateCompletion } from '@/services/OpenAI'
import { ACTION_ITEMS } from '@/services/system-content'
import OpenAI from 'openai'

const openai = new OpenAI()

export async function POST(req: Request) {
  try {
    const { items } = await req.json()

    const completion = await CreateCompletion({
      openAiInstance: openai,
      systemContent: ACTION_ITEMS,
      userContent: transformItemsInText(items),
    })

    return Response.json({
      suggested_action_items: transformTextInItems(
        completion?.choices[0]?.message?.content || '',
      ),
    })
  } catch (e) {
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
}
