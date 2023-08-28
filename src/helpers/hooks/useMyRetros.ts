import { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { useUser } from '@clerk/clerk-react'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'

const useMyRetros = () => {
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()

  const me = useQuery(api.users.getByToken, { tokenIdentifier: user?.id || '' })
  const retros = useQuery(api.retros.myRetros, { userId: me?._id as Id<'users'> })

  useEffect(() => {
    if (retros) {
      setIsLoading(false)
    }
  }, [retros])

  return {
    isLoading,
    retros: retros?.sort((a, b) => (b?._creationTime || 0) - (a?._creationTime || 0)) || [],
    me
  }
}

export default useMyRetros