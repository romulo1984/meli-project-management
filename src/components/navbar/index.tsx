'use client'
import { useUser, SignInButton, UserButton } from '@clerk/nextjs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/free-regular-svg-icons'
import Link from 'next/link'
import { DynamicImport } from '@/helpers/dynamicImport'

import { FC } from 'react'

const OlvyWidget: FC<OlvyWidgetProps> = DynamicImport(
  'OlvyWidget',
  () => import('@olvyhq/widget-react'),
) as FC<OlvyWidgetProps>

export default function Navbar() {
  const { isSignedIn } = useUser()

  return (
    <nav className="container mx-auto max-w-screen-xl py-6 px-6 flex justify-between">
      <h1 className="text-2xl md:text-3xl font-bold">
        <a href="/">
          <span className="text-slate-400">/</span>
          <span className="text-slate-600">retro</span>
          <span className="text-pink-400">spec</span>
          <span className="text-indigo-400">tool</span>
        </a>
      </h1>
      <div className="flex justify-end items-center">
        {isSignedIn ? (
          <>
            <Link
              className="mr-6 text-slate-600 hover:text-slate-400 transition-colors"
              href="/new"
            >
              New
            </Link>
            <Link
              className="mr-6 text-slate-600 hover:text-slate-400 transition-colors"
              href="/retros"
            >
              My Retros
            </Link>
            <OlvyWidget
              config={{ workspaceAlias: 'retrospectool' }}
              targetElement={
                <div
                  id="olvy-whats-new"
                  className="mr-6 text-slate-600 hover:text-slate-400 transition-colors cursor-pointer"
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
    </nav>
  )
}
