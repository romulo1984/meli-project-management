import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const join = mutation({
  args: { retroId: v.id('retros'), userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_token', q => q.eq('tokenIdentifier', args.userId))
      .unique()

    if (!user) return

    // Dedup against the resolved Convex user id. (The previous version compared
    // the join row's `userId` id-field to the raw token string, so it never
    // matched and every visit inserted a duplicate membership row.)
    const existingUserInRetro = await ctx.db
      .query('users_retro')
      .withIndex('by_retro_id', q => q.eq('retroId', args.retroId))
      .filter(q => q.eq(q.field('userId'), user._id))
      .unique()

    if (!existingUserInRetro) {
      return ctx.db.insert('users_retro', {
        retroId: args.retroId,
        userId: user._id,
      })
    }
  },
})
