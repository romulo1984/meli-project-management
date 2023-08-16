'use client'
import { useUser, SignInButton, UserButton } from '@clerk/clerk-react'

export default function Navbar() {
  const { isSignedIn } = useUser()

  return (
    <nav className='container mx-auto max-w-screen-xl py-6 px-6 flex justify-between'>
      <h1 className='text-2xl font-thin text-slate-600'>
        <a href='/'>#time-do-fernando</a>
      </h1>
      {isSignedIn ? <UserButton /> : <SignInButton mode='modal' />}
    </nav>
  )
}