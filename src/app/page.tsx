'use client'
import Lottie from 'react-lottie-player'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/clerk-react'
import { useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'

import lootieAnimation from '../animations/animation.json'

export default function Home() {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const StoreRetro = useMutation(api.retros.store)

  const CreateRetro = async () => {
    if (!isSignedIn) {
      router.push('/login?redirect_url="/"')
    } else {
      const retroId = await StoreRetro({ ownerId: user.id })
      router.push(`/retro/${retroId}`)
    }
  }

  return (
    <main className="container max-w-screen-xl mx-auto columns-2 flex items-center px-6">
      <div className='w-2/4'>
        <h2 className='text-5xl font-semibold mb-3 text-slate-600'>
          For a truly one hundred percent boss...
        </h2>
        <h2 className='text-3xl font-medium text-slate-500 mb-6'>
          it&rsquo;s just an <span className='font-semibold'>if</span>
        </h2>
        <button
          onClick={CreateRetro}
          className='text-slate-100 font-medium rounded-3xl px-8 py-3 bg-slate-800'>
          Create a new Retro
        </button>
      </div>
      <div className='w-full'>
        <Lottie loop animationData={lootieAnimation} play style={{ height: 800 }}/>
      </div>
    </main>
  )
}
