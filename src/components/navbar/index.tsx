'use client'
import { useUser, SignInButton, UserButton } from '@clerk/nextjs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/free-regular-svg-icons'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { FC, useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
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
  // On hover the color of the font itself animates: the letters turn
  // transparent to reveal a gradient clipped to the text, which sweeps
  // across the wordmark. No background — just the font color moving.
  return (
    <h1 className="text-2xl md:text-3xl font-bold">
      <a
        href="/"
        className="group inline-block bg-gradient-to-r from-indigo-500 via-pink-500 to-indigo-500 bg-[length:200%_auto] bg-clip-text hover:animate-[logoGradient_2.5s_linear_infinite]"
      >
        <span className="text-slate-400 transition-colors duration-300 group-hover:text-transparent">
          /
        </span>
        <span className="text-slate-600 transition-colors duration-300 group-hover:text-transparent">
          retro
        </span>
        <span className="text-pink-400 transition-colors duration-300 group-hover:text-transparent">
          spec
        </span>
        <span className="text-indigo-400 transition-colors duration-300 group-hover:text-transparent">
          tool
        </span>
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
  // Mobile-only collapsible menu. Desktop (md+) keeps the original inline row.
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const closeMenu = () => setMenuOpen(false)

  // Close the mobile menu when clicking anywhere outside it.
  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [menuOpen])

  return (
    <>
      {/* Desktop navigation — unchanged from the desktop design (md and up). */}
      <div className="hidden md:flex justify-end items-center gap-4 sm:gap-5">
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
              className="flex items-center gap-2 rounded-full border border-zinc-200/70 pl-1 pr-3 py-1 hover:bg-zinc-100 transition-colors"
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

      {/* Mobile navigation — a hamburger that drops the same links down as a
          full-width sheet under the (sticky) header. */}
      <div ref={menuRef} className="md:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-zinc-100"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {menuOpen && (
          <div className="absolute inset-x-0 top-full border-b border-zinc-100 bg-white shadow-lg">
            <div className="container mx-auto max-w-screen-xl px-6 py-3 flex flex-col gap-1">
              {ready &&
                (hasName ? (
                  <button
                    type="button"
                    onClick={() => {
                      openRename()
                      closeMenu()
                    }}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-zinc-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatar}
                      alt={name}
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded-full object-cover object-center"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                      {name}
                    </span>
                    <span className="text-xs text-zinc-400">Edit</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      promptName()
                      closeMenu()
                    }}
                    className="rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-500"
                  >
                    Set your name
                  </button>
                ))}
              <Link
                href="/new"
                onClick={closeMenu}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
              >
                + New retro
              </Link>
              <Link
                href="/retros"
                onClick={closeMenu}
                className="rounded-lg px-2 py-2.5 text-sm text-slate-600 transition-colors hover:bg-zinc-100"
              >
                My Retros
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
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
