import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const join = mutation({
  args: { retroId: v.id('retros'), userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_token', q => q.eq('tokenIdentifier', args.userId))
      .unique()

    const existingUserInRetro = await ctx.db
      .query('users_retro')
      .withIndex('by_retro_id', q => q.eq('retroId', args.retroId))
      .filter(q => q.eq('userId', args.userId))
      .unique()

    if (user && !existingUserInRetro) {
      return ctx.db.insert('users_retro', {
        retroId: args.retroId,
        userId: user._id,
      })
    }
  },
})
