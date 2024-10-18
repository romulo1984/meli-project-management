import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import { Models } from '@/services/CompletionIA'

export const MODELS = {
  'claude-3-5-sonnet': {
    instance: anthropic,
    model: 'claude-3-5-sonnet-20240620' as Models,
  },
  'gpt-4o-mini': {
    instance: openai,
    model: 'gpt-4o-mini' as Models,
  },
}
