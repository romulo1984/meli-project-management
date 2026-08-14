import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { toPublicUser } from './lib/relationships'

// Defensive server-side cap on display-name length (the client caps at 40).
const MAX_NAME_LENGTH = 80

export const getRetroUsers = query({
  args: { retroId: v.id('retros') },
  handler: async (ctx, args) => {
    const usersRetro = await ctx.db
      .query('users_retro')
      .withIndex('by_retro_id', (q) =>
          q.eq('retroId', args.retroId)
        )
      .collect()

    return Promise.all(usersRetro.map(async (userRetro) => {
      return toPublicUser(await ctx.db.get(userRetro.userId))
    }))
  }
})

export const get = query({
  args: { id: v.id('users') },
  handler: async (ctx, args) => ctx.db.get(args.id)
})

export const getByToken = query({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => ctx.db
    .query('users')
    .withIndex('by_token', (q) =>
      q.eq('tokenIdentifier', args.tokenIdentifier)
    )
    .unique()
})

export const store = mutation({
  args: { userId: v.string(), userName: v.string(), avatar: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Defensive clamp: trim and cap length so an oversized name can't be persisted.
    const name = (args.userName || '').trim().slice(0, MAX_NAME_LENGTH)

    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) =>
        q.eq('tokenIdentifier', args.userId)
      )
      .unique()
    if (user !== null) {
      if (user.name !== name || user.avatar !== args.avatar) {
        await ctx.db.patch(user._id, { name, avatar: args.avatar })
      }
      return user._id
    }

    return await ctx.db.insert('users', {
      name: name!,
      avatar: args.avatar!,
      tokenIdentifier: args.userId,
    })
  },
})