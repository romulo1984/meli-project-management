'use client'
import { RedirectToSignIn, SignedIn, SignedOut, UserProfile } from '@clerk/clerk-react'
import { useUser } from '@clerk/clerk-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function Login() {
  const searchParams = useSearchParams()
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    const redirect = searchParams.get('r')

    if (redirect && isSignedIn) {
      router.push(decodeURI(redirect))
    }

  }, [isSignedIn, isLoaded])

  return (
    <main className="flex min-h-screen justify-center gap-6 p-24">
      <SignedIn>
        <UserProfile />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </main>
  )
}