'use client'
import { useUser, SignInButton, UserButton } from '@clerk/nextjs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/free-regular-svg-icons'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { FC } from 'react'
import { CLERK_AUTH_ENABLED } from '@/config/features'
import { useIdentity } from '@/contexts/IdentityProvider'

// Client-only: the Olvy widget touches window/document, so it must not render
// during SSR (it's now shown to everyone, not just signed-in users).
const OlvyWidget: FC<OlvyWidgetProps> = dynamic(
  () => import('@olvyhq/widget-react').then(mod => mod.OlvyWidget),
  { ssr: false },
) as FC<OlvyWidgetProps>

const linkClass =
  'text-slate-600 hover:text-slate-400 transition-colors'

function Brand() {
  return (
    <h1 className="text-2xl md:text-3xl font-bold">
      <a href="/">
        <span className="text-slate-400">/</span>
        <span className="text-slate-600">retro</span>
        <span className="text-pink-400">spec</span>
        <span className="text-indigo-400">tool</span>
      </a>
    </h1>
  )
}

function ChangelogBell() {
  return (
    <OlvyWidget
      config={{ workspaceAlias: 'retrospectool' }}
      targetElement={
        <div
          id="olvy-whats-new"
          className={`cursor-pointer ${linkClass}`}
        >
          <FontAwesomeIcon icon={faBell} />
        </div>
      }
    />
  )
}

/** Active navigation — anonymous local identity (no login). */
function AnonymousNav() {
  const { ready, hasName, name, avatar, openRename, promptName } = useIdentity()

  return (
    <div className="flex justify-end items-center gap-4 sm:gap-5">
      <Link
        href="/new"
        className="rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-100"
      >
        + New
      </Link>
      <Link className={`text-sm ${linkClass}`} href="/retros">
        My Retros
      </Link>
      <ChangelogBell />
      {ready &&
        (hasName ? (
          <button
            type="button"
            onClick={openRename}
            title="Edit your name"
            className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-zinc-100 transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatar}
              alt={name}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover object-center"
            />
            <span className="text-sm text-slate-600 max-w-[10rem] truncate">
              {name}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={promptName}
            className="text-sm rounded-full bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500 transition-colors"
          >
            Set your name
          </button>
        ))}
    </div>
  )
}

/** Legacy Clerk navigation — preserved for when CLERK_AUTH_ENABLED is restored. */
function ClerkNav() {
  const { isSignedIn } = useUser()

  return (
    <div className="flex justify-end items-center">
      {isSignedIn ? (
        <>
          <Link className={`mr-6 ${linkClass}`} href="/new">
            New
          </Link>
          <Link className={`mr-6 ${linkClass}`} href="/retros">
            My Retros
          </Link>
          <OlvyWidget
            config={{ workspaceAlias: 'retrospectool' }}
            targetElement={
              <div
                id="olvy-whats-new"
                className={`mr-6 cursor-pointer ${linkClass}`}
              >
                <FontAwesomeIcon icon={faBell} />
              </div>
            }
          />
          <UserButton />
        </>
      ) : (
        <div className="text-slate-600">
          <SignInButton mode="modal" />
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-100 bg-white/80 backdrop-blur-md">
      <nav className="container mx-auto max-w-screen-xl py-4 px-6 flex justify-between items-center">
        <Brand />
        {CLERK_AUTH_ENABLED ? <ClerkNav /> : <AnonymousNav />}
      </nav>
    </header>
  )
}
