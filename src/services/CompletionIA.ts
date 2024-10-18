import type { anthropic } from '@ai-sdk/anthropic'
import type { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

export type Models = 'claude-3-5-sonnet-20240620' | 'gpt-4o-mini'

export type CreateCompletionProps = {
  instance: typeof anthropic | typeof openai
  model: Models
  systemContent: string
  userContent: string
}

const CreateCompletion = async ({
  instance,
  model = 'claude-3-5-sonnet-20240620',
  systemContent,
  userContent,
}: CreateCompletionProps) => {
  const { text } = await generateText({
    model: instance(model),
    system: systemContent,
    prompt: userContent,
  })

  return text
}

export { CreateCompletion }
