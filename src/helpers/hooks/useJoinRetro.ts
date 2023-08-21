import { useEffect, useState } from 'react'
import useRetro from '@/helpers/hooks/useRetro'
import { Id } from '@convex/_generated/dataModel'
import { useUser } from '@clerk/clerk-react'
import { useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'

interface JoinRetroProps {
  retroId: Id<'retros'>
}

const useJoinRetro = (props: JoinRetroProps) => {
  const { retroId } = props
  const [joined, setJoined] = useState(false)
  const { user, isSignedIn } = useUser()
  const { users, retro } = useRetro({ retroId })
  const Join = useMutation(api.users_retro.join)

  const me = users?.find((u) => u?.tokenIdentifier === user?.id)

  useEffect(() => {
    if (isSignedIn && retro && users && !me) {
      Join({ retroId, userId: user.id })
      setJoined(true)
    }
  }, [me, user, retroId, Join, retro, isSignedIn, users])

  return joined
}

export {
  useJoinRetro
}