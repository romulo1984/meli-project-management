import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { asyncMap, toPublicUser } from './lib/relationships'
import { Doc } from './_generated/dataModel'

const unknownUser = {
  name: 'Unknown',
}

// Custom column labels are short display strings; clamp to keep storage bounded
// and headers readable. Rendered through React (auto-escaped), never raw markup.
const MAX_COLUMN_LABEL_LENGTH = 30

export const get = query({
  args: { id: v.id('retros') },
  handler: async (ctx, args) => {
    const retro = await ctx.db.get(args.id)
    const notes = await ctx.db
      .query('notes')
      .withIndex('by_retro_id', q => q.eq('retroId', args.id))
      .collect()
    const usersRetro = await ctx.db
      .query('users_retro')
      .withIndex('by_retro_id', q => q.eq('retroId', args.id))
      .collect()

    const owner = retro
      ? toPublicUser(await ctx.db.get(retro?.ownerId))
      : unknownUser

    return {
      ...retro,
      owner,
      notes,
      users: await asyncMap(usersRetro, async user => {
        return toPublicUser(await ctx.db.get(user.userId))
      }),
    }
  },
})

export const myRetros = query({
  args: { userId: v.optional(v.id('users')) },
  handler: async (ctx, args) => {
    const { userId } = args

    if (!userId) return undefined

    const usersRetro = await ctx.db
      .query('users_retro')
      .withIndex('by_user_id', q => q.eq('userId', userId))
      .collect()

    return asyncMap(usersRetro, async userRetro => {
      const retro = await ctx.db.get(userRetro.retroId)
      let users: Doc<'users_retro'>[] = []

      if (retro) {
        users = await ctx.db
          .query('users_retro')
          .withIndex('by_retro_id', q => q.eq('retroId', retro._id))
          .collect()
      }

      const owner = retro
        ? toPublicUser(await ctx.db.get(retro?.ownerId))
        : unknownUser

      return {
        ...retro,
        owner,
        users: await asyncMap(users, async user => {
          return toPublicUser(await ctx.db.get(user.userId))
        }),
      }
    })
  },
})

export const store = mutation({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_token', q => q.eq('tokenIdentifier', args.ownerId))
      .unique()

    const payload = {
      name: `Retrô ${new Date().toDateString()}`,
      timer: 45000,
      ownerId: user?._id!,
    }

    const retroId = await ctx.db.insert('retros', payload)

    await ctx.db.insert('users_retro', {
      retroId: retroId,
      userId: user?._id!,
    })

    return retroId
  },
})

export const update = mutation({
  args: { id: v.id('retros'), name: v.string() },
  handler: async (ctx, args) => {
    const retro = await ctx.db.get(args.id)

    if (retro) {
      await ctx.db.patch(retro._id, { name: args.name })
    }
  },
})

export const updateTimer = mutation({
  args: {
    id: v.id('retros'),
    timer: v.optional(v.number()),
    startTimer: v.optional(v.number()),
    timerStatus: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...args }) => {
    const retro = await ctx.db.get(id)

    if (retro) {
      await ctx.db.patch(retro._id, args)
    }
  },
})

export const updateNotesShowingStatus = mutation({
  args: { id: v.id('retros'), status: v.string() },
  handler: async (ctx, args) => {
    const retro = await ctx.db.get(args.id)

    if (retro) {
      await ctx.db.patch(retro._id, { notesShowingStatus: args.status })
    }
  },
})

export const updateStatus = mutation({
  args: { id: v.id('retros'), status: v.string() },
  handler: async (ctx, args) => {
    const retro = await ctx.db.get(args.id)

    if (retro) {
      await ctx.db.patch(retro._id, { status: args.status })
    }
  },
})

export const updateColumnLabel = mutation({
  // `column` is an allowlist of the fixed pipeline values (least-permissive
  // validation); `label` is trimmed and length-clamped below before storage.
  args: {
    id: v.id('retros'),
    column: v.union(v.literal('good'), v.literal('bad'), v.literal('action')),
    label: v.string(),
  },
  handler: async (ctx, args) => {
    const retro = await ctx.db.get(args.id)

    if (retro) {
      const label = args.label.trim().slice(0, MAX_COLUMN_LABEL_LENGTH)

      if (args.column === 'good') {
        await ctx.db.patch(retro._id, { goodLabel: label })
      } else if (args.column === 'bad') {
        await ctx.db.patch(retro._id, { badLabel: label })
      } else {
        await ctx.db.patch(retro._id, { actionLabel: label })
      }
    }
  },
})
