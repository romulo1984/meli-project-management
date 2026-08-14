import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { toPublicUser } from './lib/relationships'

// Defensive server-side cap on display-name length (the client caps at 40).
const MAX_NAME_LENGTH = 80

// Defensive cap on the avatar data URI (~200KB). The client re-encodes uploads
// to a small (<=100KB) data URI, so this only guards against an abusive client
// trying to persist a huge string in the users.avatar field.
const MAX_AVATAR_LENGTH = 200 * 1024

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
    // Defensive guard: ignore an oversized avatar so a huge value can't be persisted.
    const safeAvatar =
      typeof args.avatar === 'string' && args.avatar.length <= MAX_AVATAR_LENGTH
        ? args.avatar
        : undefined

    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) =>
        q.eq('tokenIdentifier', args.userId)
      )
      .unique()
    if (user !== null) {
      // Keep the existing avatar if the incoming one is missing or was rejected.
      const nextAvatar = safeAvatar ?? user.avatar
      if (user.name !== name || user.avatar !== nextAvatar) {
        await ctx.db.patch(user._id, { name, avatar: nextAvatar })
      }
      return user._id
    }

    return await ctx.db.insert('users', {
      name: name!,
      avatar: safeAvatar,
      tokenIdentifier: args.userId,
    })
  },
})