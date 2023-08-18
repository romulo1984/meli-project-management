import { useMutation, useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'

interface useRetroProps {
  retroId: Id<'retros'>
}

const useRetro = (props: useRetroProps) => {
  const { retroId } = props

  const retro = useQuery(api.retros.get, { id: retroId })
  const notes = useQuery(api.notes.getRetroNotes, { retroId: retroId })
  const users = useQuery(api.users.getRetroUsers, { retroId: retroId })

  return {
    retro,
    notes,
    users,
  }
}

export default useRetro