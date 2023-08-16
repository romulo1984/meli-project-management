'use client'
import { RedirectToSignIn, SignedIn, SignedOut, UserProfile } from '@clerk/clerk-react'

interface LoginProps {
  searchParams: URLSearchParams & { redirect_url: string }
}

export default function Login(props: LoginProps) {
  const { searchParams } = props

  return (
    <main className="flex min-h-screen justify-center gap-6 p-24">
      <SignedIn>
        <UserProfile />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn redirectUrl={searchParams?.redirect_url} />
      </SignedOut>
    </main>
  )
}