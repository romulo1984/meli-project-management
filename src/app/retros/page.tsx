'use client'
import useMyRetros from '@/helpers/hooks/useMyRetros'
import Loading from '@/components/loading'

import { api } from '@convex/_generated/api'
import { useMutation } from 'convex/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { Id } from '@convex/_generated/dataModel'
import RetroCard from '@/components/retro-card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Retros() {
  const router = useRouter()
  const { retros, isLoading, me } = useMyRetros()
  const ArchiveRetro = useMutation(api.retros.updateStatus)

  const isOwner = (retro: any) => retro?.ownerId === me?._id

  const setStatus = (
    retroId: Id<'retros'> | undefined,
    status: 'active' | 'archived',
  ) => {
    if (retroId) ArchiveRetro({ id: retroId, status })
  }

  const activeRetros = retros.filter(
    retro => retro.status === 'active' || retro.status === undefined,
  )
  const archivedRetros = retros.filter(retro => retro.status === 'archived')

  const renderGrid = (list: any[], archived: boolean) =>
    list.length > 0 ? (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map(retro => (
          <RetroCard
            key={retro._id}
            retro={retro}
            isOwner={isOwner}
            archived={archived}
            onOpen={() => router.push(`/retro/${retro._id}`)}
            onToggleArchive={() =>
              setStatus(retro._id, archived ? 'active' : 'archived')
            }
          />
        ))}
      </div>
    ) : (
      <div className="rounded-2xl border border-dashed border-zinc-200 py-16 text-center">
        <p className="text-sm font-medium text-zinc-500">
          {archived ? 'No archived retros' : 'No active retros yet'}
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          {archived
            ? 'Retros you archive will show up here.'
            : 'Create your first board to get started.'}
        </p>
        {!archived && (
          <Link
            href="/new"
            className="mt-5 inline-flex rounded-2xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            Create a retro
          </Link>
        )}
      </div>
    )

  return (
    <div className="container mx-auto min-h-screen max-w-screen-xl py-8 px-6 flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-slate-700">My retros</h1>
          <p className="text-sm text-zinc-400">
            Your active and archived boards.
          </p>
        </div>
        <Link
          href="/new"
          className="inline-flex items-center justify-center self-start rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 sm:self-auto"
        >
          + New retro
        </Link>
      </div>
      {isLoading ? (
        <Loading />
      ) : (
        <Tabs defaultValue="active">
          <TabsList className="mb-4">
            <TabsTrigger value="active">
              Active ({activeRetros.length})
            </TabsTrigger>
            <TabsTrigger value="archived">
              Archived ({archivedRetros.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            {renderGrid(activeRetros, false)}
          </TabsContent>
          <TabsContent value="archived">
            {renderGrid(archivedRetros, true)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
