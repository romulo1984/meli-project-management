import { query, mutation } from './_generated/server'
import { v } from 'convex/values'

export const get = query({
  args: { id: v.id('retros') },
  handler: async (ctx, args) => ctx.db
    .query('retros')
    .filter(q => q.eq(q.field('_id'), args.id))
    .unique()
})

export const myRetros = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const usersRetro = await ctx.db
      .query('users_retro')
      .withIndex('by_user_id', (q) =>
        q.eq('userId', args.userId)
      )
      .collect()

      return Promise.all(usersRetro.map((userRetro) => {
        return ctx.db.get(userRetro.retroId)
      }))
  }
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

export const update = mutation({
  args: { id: v.id('retros'), name: v.string() },
  handler: async (ctx, args) => {
    const retro = await ctx.db.get(args.id)

    if (retro) {
      await ctx.db.patch(retro._id, { name: args.name })
    }
  }
})