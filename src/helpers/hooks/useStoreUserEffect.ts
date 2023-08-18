import { useUser } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'

const useStoreUserEffect = () => {
  const { isSignedIn, user } = useUser()
  const [userId, setUserId] = useState<Id<'users'> | null>(null)
  const storeUser = useMutation(api.users.store)

  useEffect(() => {
    if (!isSignedIn) return
    
    async function createUser() {
      const id = await storeUser({
        userId: user?.id || '',
        userName: user?.fullName || '',
        avatar: user?.imageUrl || '',
      })
      setUserId(id)
    }

    createUser()
    return () => setUserId(null)

  }, [isSignedIn, storeUser, user?.id, user?.fullName, user?.imageUrl])

  return userId
}

export {
  useStoreUserEffect
}