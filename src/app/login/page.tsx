'use client'
import { RedirectToSignIn, SignedIn, SignedOut, UserProfile } from '@clerk/clerk-react'

export default function Login() {
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