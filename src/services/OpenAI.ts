import type OpenAI from 'openai'

type CreateCompletionProps = {
  openAiInstance?: OpenAI
  model?: string
  systemContent: string
  userContent: string
}

const CreateCompletion = async ({
  openAiInstance,
  model = 'gpt-4o-mini',
  systemContent,
  userContent,
}: CreateCompletionProps) => {
  return openAiInstance?.chat.completions.create({
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
}

export { CreateCompletion }
