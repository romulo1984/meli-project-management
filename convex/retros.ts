import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { asyncMap } from './lib/relationships'
import { Doc } from './_generated/dataModel'

const unknownUser = {
  name: 'Unknown',
}

export const get = query({
  args: { id: v.id('retros') },
  handler: async (ctx, args) => {
    const retro = await ctx.db.get(args.id)
    const notes = await ctx.db
      .query('notes')
      .withIndex('by_retro_id', (q) => q.eq('retroId', args.id))
      .collect()
    const usersRetro = await ctx.db
      .query('users_retro')
      .withIndex('by_retro_id', (q) => q.eq('retroId', args.id))
      .collect()
    
    const owner = retro ? await ctx.db.get(retro?.ownerId) : unknownUser

    return {
      ...retro,
      owner,
      notes,
      users: await asyncMap(usersRetro, (user) => {
        return ctx.db.get(user.userId)
      })
    }
  }
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

      return asyncMap(usersRetro, async (userRetro) => {
        const retro = await ctx.db.get(userRetro.retroId)
        let users: Doc<'users_retro'>[] = []
        
        if (retro) {
          users = await ctx.db
            .query('users_retro')
            .withIndex('by_retro_id', (q) =>
              q.eq('retroId', retro._id)
            )
            .collect()
        }

        const owner = retro ? await ctx.db.get(retro?.ownerId) : unknownUser

        return {
          ...retro,
          owner,
          users: await asyncMap(users, (user) => {
            return ctx.db.get(user.userId)
          })
        }
      })
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