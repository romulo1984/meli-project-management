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
  args: {
    body: v.string(),
    pipeline: v.string(),
    userId: v.id('users'),
    retroId: v.id('retros'),
    anonymous: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const noteId = await ctx.db.insert('notes', {
      body: args.body,
      pipeline: args.pipeline,
      userId: args.userId,
      retroId: args.retroId,
      anonymous: args.anonymous || false,
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

export const likeToggle = mutation({
  args: { noteId: v.id('notes'), userId: v.id('users') },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId)
    if (note) {
      const likes = note.likes || []
      const index = likes.indexOf(args.userId)
      if (index === -1) {
        likes.push(args.userId)
      } else {
        likes.splice(index, 1)
      }
      await ctx.db.patch(note._id, { likes })
      return likes
    }
    return []
  }
})

export const updatePositions = mutation({
  args: {
    notes: v.array(v.object({
      id: v.id('notes'),
      position: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    for (const note of args.notes) {
      await ctx.db.patch(note.id, { position: note.position })
    }
    return true
  }
})

export const assigne = mutation({
  args: { noteId: v.id('notes'), userId: v.id('users') },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId)
    if (note) {
      await ctx.db.patch(note._id, { assignedTo: args.userId })
      return true
    }
    return false
  }
})

export const unnasign = mutation({
  args: { noteId: v.id('notes') },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId)
    if (note) {
      await ctx.db.patch(note._id, { assignedTo: undefined })
      return true
    }
    return false
  }
})

export const update = mutation({
  args: {
    noteId: v.id('notes'),
    body: v.string(),
    anonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId)
    if (!note) {
      return false
    }

    await ctx.db.patch(note._id, {
      body: args.body,
      anonymous: args.anonymous,
    })
  }
})

export const merge = mutation({
  args: {
    sourceId: v.id('notes'),
    parentId: v.id('notes'),
  },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.sourceId)
    if (!source) {
      return false
    }

    const parent = await ctx.db.get(args.parentId)
    if (!parent) {
      return false
    }

    await ctx.db.patch(source._id, {
      mergeParentId: parent._id,
    })
  }
})