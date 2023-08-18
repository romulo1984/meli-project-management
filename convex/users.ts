import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const getRetroUsers = query({
  args: { retroId: v.id('retros') },
  handler: async (ctx, args) => {
    const usersRetro = await ctx.db
      .query('users_retro')
      .withIndex('by_retro_id', (q) =>
          q.eq('retroId', args.retroId)
        )
      .collect()

    return Promise.all(usersRetro.map((userRetro) => {
      return ctx.db.get(userRetro.userId)
    }))
  }
})

export const get = query({
  args: { id: v.id('users') },
  handler: async (ctx, args) => ctx.db.get(args.id)
})

export const store = mutation({
  args: { userId: v.string(), userName: v.string(), avatar: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) =>
        q.eq('tokenIdentifier', args.userId)
      )
      .unique()
    if (user !== null) {
      if (user.name !== args.userName || user.avatar !== args.avatar) {
        await ctx.db.patch(user._id, { name: args.userName, avatar: args.avatar })
      }
      return user._id
    }
    
    return await ctx.db.insert('users', {
      name: args.userName!,
      avatar: args.avatar!,
      tokenIdentifier: args.userId,
    })
  },
})