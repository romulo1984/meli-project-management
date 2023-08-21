import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const getRetroNotes = query({
  args: { retroId: v.id('retros') },
  handler: async (ctx, args) => ctx.db
    .query('notes')
    .filter((q) => q.eq(q.field('retroId'), args.retroId))
    .collect()
})

export const store = mutation({
  args: { body: v.string(), pipeline: v.string(), userId: v.id('users'), retroId: v.id('retros') },
  handler: async (ctx, args) => {
    const noteId = await ctx.db.insert('notes', {
      body: args.body,
      pipeline: args.pipeline,
      userId: args.userId,
      retroId: args.retroId,
    })
    return noteId
  }
})

export const remove = mutation({
  args: { id: v.id('notes') },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.id)
    if (note) await ctx.db.delete(note._id)
    return note
  }
})