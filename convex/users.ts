import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const getRetroUsers = query({
  args: { retroId: v.id('retros') },
  handler: async (ctx, args) => ctx.db
    .query('users')
    .filter((q) => q.eq(q.field('retroId'), args.retroId))
    .collect()
})

export const get = query({
  args: { id: v.id('users') },
  handler: async (ctx, args) => ctx.db.get(args.id)
})

export const store = mutation({
  args: { retroId: v.id('retros') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('Called storeUser without authentication present')
    }

    // Check if we've already stored this identity before.
    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) =>
        q.eq('tokenIdentifier', identity.tokenIdentifier)
      )
      .unique();
    if (user !== null) {
      if (user.name !== identity.name) {
        await ctx.db.patch(user._id, { name: identity.name })
      }
      return user._id;
    }
    
    return await ctx.db.insert('users', {
      name: identity.name!,
      retroId: args.retroId,
      tokenIdentifier: identity.tokenIdentifier,
    })
  },
})