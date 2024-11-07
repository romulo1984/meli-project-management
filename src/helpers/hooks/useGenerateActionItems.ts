import { useState } from 'react'

import { useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'

interface GenerateActionItemsProps {
  retroId: Id<'retros'>
  userId?: Id<'users'>
  items: string[]
}

const useGenerateActionItems = (props: GenerateActionItemsProps) => {
  const { items, retroId, userId } = props
  const [isLoading, setIsLoading] = useState(false)
  const CreateNote = useMutation(api.notes.store)

  const generateActionItems = async (model = 'gpt-4o') => {
    if (userId === undefined) return

    setIsLoading(true)
    let index = 0

    try {
      const response = await fetch('/api/generate-actions', {
        method: 'POST',
        body: JSON.stringify({ items, model }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const { suggested_action_items } = await response.json()

      const processNext = () => {
        if (index < suggested_action_items.length) {
          CreateNote({
            body: suggested_action_items[index],
            pipeline: 'action',
            retroId: retroId,
            userId: userId,
            anonymous: false,
          })
          index++
          setTimeout(processNext, 600)
        } else {
          setIsLoading(false)
        }
      }

      processNext()
    } catch (e: any) {
      console.log('error', e.message)
      setIsLoading(false)
    }
  }

  return {
    generateActionItems,
    isGenerating: isLoading,
  }
}

export { useGenerateActionItems }
