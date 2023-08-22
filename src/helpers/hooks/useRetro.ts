import { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { useUser } from '@clerk/clerk-react'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'

interface useRetroProps {
  retroId: Id<'retros'>
}

const useRetro = (props: useRetroProps) => {
  const { retroId } = props
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()

  const retro = useQuery(api.retros.get, { id: retroId })
  const notes = useQuery(api.notes.getRetroNotes, { retroId: retroId })
  const users = useQuery(api.users.getRetroUsers, { retroId: retroId })

  const me = users?.find((u) => u?.tokenIdentifier === user?.id)

  useEffect(() => {
    if (retro && notes && users) {
      setIsLoading(false)
    }
  }, [retro, notes, users])

  return {
    isLoading,
    retro,
    notes,
    users,
    me
  }
}

export default useRetro