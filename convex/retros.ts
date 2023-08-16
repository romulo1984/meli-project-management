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
    const payload = {
      name: `Retrô ${new Date().toDateString()}`,
      ownerId: args.ownerId,
    }
    return await ctx.db.insert('retros', payload)
  }
})