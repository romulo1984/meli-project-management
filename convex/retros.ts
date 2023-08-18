import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const get = query({
  args: { id: v.id('retros') },
  handler: async (ctx, args) => ctx.db
    .query('retros')
    .filter(q => q.eq(q.field('_id'), args.id))
    .unique()
})

export const store = mutation({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_token', (q) =>
        q.eq('tokenIdentifier', args.ownerId)
      )
      .unique()

    const payload = {
      name: `Retrô ${new Date().toDateString()}`,
      ownerId: user?._id!,
    }

    const retroId = await ctx.db.insert('retros', payload)

    await ctx.db.insert('users_retro', {
      retroId: retroId,
      userId: user?._id!,
    })

    return retroId
  }
})