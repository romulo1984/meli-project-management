'use client'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/clerk-react'
import { useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { useEffect } from 'react'
import lootieAnimation from '../../animations/animation.json'
import Lottie from 'react-lottie-player'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

export default function New() {
  const { isSignedIn, user, isLoaded } = useUser()
  const router = useRouter()
  const StoreRetro = useMutation(api.retros.store)

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      router.push('/login?r=/new')
      return
    }
    
    (async () => {
      const retroId = await StoreRetro({ ownerId: user.id })
      router.push(`/retro/${retroId}`)
    })()
  }, [user, isSignedIn, isLoaded])

  return (
    <main className="container max-w-screen-xl mx-auto columns-2 flex items-center px-6">
      <div className='w-2/4'>
        <h2 className='text-5xl font-semibold mb-3 text-indigo-400'>
          Creating a new retro
          <FontAwesomeIcon icon={faSpinner} spin={true} className="ml-4 h-10 w-10" />
        </h2>
      </div>
      <div className='w-full'>
        <Lottie loop animationData={lootieAnimation} play style={{ height: 800 }}/>
      </div>
    </main>
  )
}