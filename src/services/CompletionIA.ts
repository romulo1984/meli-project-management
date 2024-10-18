import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

export type Models = 'claude-3-5-sonnet-20240620' | 'gpt-4o-mini'

export type CreateCompletionProps = {
  instance: Anthropic | OpenAI
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
  let messages: { text: string }[] = []

  if (instance instanceof OpenAI) {
    const result = await instance?.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: systemContent,
        },
        {
          role: 'user',
          content: userContent,
        },
      ],
    })

    messages =
      result?.choices.map(({ message }) => ({ text: message.content || '' })) ||
      []
  }

  if (instance instanceof Anthropic) {
    console.log('romin:', instance)
    const result = await instance?.messages.create({
      model,
      max_tokens: 1000,
      temperature: 0,
      system: systemContent,
      messages: [
        {
          role: 'user',
          content: userContent,
        },
      ],
    })

    // @ts-ignore
    messages = result?.content.filter(({ type }) => type === 'text') || []
  }

  return {
    messages,
  }
}

export { CreateCompletion }
