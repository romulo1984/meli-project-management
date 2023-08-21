import { useQuery } from 'convex/react'
import { useUser } from '@clerk/clerk-react'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'

interface useRetroProps {
  retroId: Id<'retros'>
}

const useRetro = (props: useRetroProps) => {
  const { retroId } = props
  const { user } = useUser()

  const retro = useQuery(api.retros.get, { id: retroId })
  const notes = useQuery(api.notes.getRetroNotes, { retroId: retroId })
  const users = useQuery(api.users.getRetroUsers, { retroId: retroId })

  const me = users?.find((u) => u?.tokenIdentifier === user?.id)

  return {
    retro,
    notes,
    users,
    me
  }
}

export default useRetro