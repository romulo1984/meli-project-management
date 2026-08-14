import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { clampMaxLikes } from './retros'

export const getRetroNotes = query({
  args: { retroId: v.id('retros') },
  handler: async (ctx, args) =>
    ctx.db
      .query('notes')
      .filter(q => q.eq(q.field('retroId'), args.retroId))
      .collect(),
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
  },
})

export const remove = mutation({
  args: { id: v.id('notes') },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.id)

    if (!note) {
      return
    }

    const childrenNotes = await ctx.db
      .query('notes')
      .filter(q => q.eq(q.field('mergeParentId'), note._id))
      .collect()

    if (childrenNotes.length > 0) {
      const firstChild = childrenNotes.shift()

      if (firstChild) {
        await ctx.db.patch(firstChild._id, {
          mergeParentId: undefined,
        })

        for (let childNote of childrenNotes) {
          await ctx.db.patch(childNote._id, {
            mergeParentId: firstChild?._id,
          })
        }
      }
    }

    await ctx.db.delete(note._id)
    return note
  },
})

// Result of a likeToggle attempt. `reason` explains a refusal so the client can
// react (e.g. show a toast when the vote budget is spent).
type LikeToggleResult = { ok: boolean; reason?: 'self' | 'budget' }

// Toggle the current user's like on a note. All voting rules are enforced
// SERVER-SIDE from persisted state (never trust a client-supplied tally):
//   - no self-vote: you cannot like your own card;
//   - per-person budget: adding a like is refused once the user has spent their
//     whole budget (retro.maxLikes, default 3) across the retro;
//   - removing a like is always allowed.
export const likeToggle = mutation({
  args: { noteId: v.id('notes'), userId: v.id('users') },
  handler: async (ctx, args): Promise<LikeToggleResult> => {
    const note = await ctx.db.get(args.noteId)
    if (!note) {
      return { ok: false }
    }

    // No self-vote — checked against the note's real author in the DB, not a
    // client claim (CWE-841 business-logic abuse).
    if (note.userId === args.userId) {
      return { ok: false, reason: 'self' }
    }

    const likes = note.likes || []
    const index = likes.indexOf(args.userId)

    // Removing an existing like is always allowed.
    if (index !== -1) {
      likes.splice(index, 1)
      await ctx.db.patch(note._id, { likes })
      return { ok: true }
    }

    // Adding a like: enforce the per-person budget for the whole retro. Votes
    // already spent are counted from PERSISTED state, so the client cannot
    // over-vote by lying about its remaining budget (CWE-841).
    const retro = await ctx.db.get(note.retroId)
    const maxLikes = clampMaxLikes(retro?.maxLikes)

    const retroNotes = await ctx.db
      .query('notes')
      .withIndex('by_retro_id', q => q.eq('retroId', note.retroId))
      .collect()

    const used = retroNotes.reduce(
      (count, current) =>
        count + ((current.likes || []).includes(args.userId) ? 1 : 0),
      0,
    )

    if (used >= maxLikes) {
      return { ok: false, reason: 'budget' }
    }

    likes.push(args.userId)
    await ctx.db.patch(note._id, { likes })
    return { ok: true }
  },
})

export const updatePositions = mutation({
  args: {
    notes: v.array(
      v.object({
        id: v.id('notes'),
        position: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const note of args.notes) {
      await ctx.db.patch(note.id, { position: note.position })
    }
    return true
  },
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
  },
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
  },
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
  },
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

    const childrenNotes = await ctx.db
      .query('notes')
      .filter(q => q.eq(q.field('mergeParentId'), source._id))
      .collect()

    if (childrenNotes.length > 0) {
      for (let childNote of childrenNotes) {
        await ctx.db.patch(childNote._id, {
          mergeParentId: parent._id,
        })
      }
    }
  },
})

export const unmerge = mutation({
  args: { id: v.id('notes') },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.id)
    if (!note) {
      return false
    }

    await ctx.db.patch(note._id, {
      mergeParentId: undefined,
    })
  },
})

export const unmergeAll = mutation({
  args: { parentId: v.id('notes') },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.parentId)
    if (!note) {
      return false
    }

    const childrenNotes = await ctx.db
      .query('notes')
      .filter(q => q.eq(q.field('mergeParentId'), note._id))
      .collect()

    if (childrenNotes.length > 0) {
      for (let childNote of childrenNotes) {
        await ctx.db.patch(childNote._id, {
          mergeParentId: undefined,
        })
      }
    }
  },
})

export const mergeMultiple = mutation({
  args: {
    sourceIds: v.array(v.id('notes')),
    parentId: v.id('notes'),
  },
  handler: async (ctx, args) => {
    // `parentId` is the first-selected card. Resolve the real group parent so
    // nesting stays SINGLE-LEVEL: if that card already belongs to a group (has
    // a mergeParentId) we merge everything into ITS parent instead. A
    // stand-alone card or an existing group parent becomes the parent itself.
    const firstSelected = await ctx.db.get(args.parentId)
    if (!firstSelected) {
      return false
    }

    const parentId = firstSelected.mergeParentId ?? firstSelected._id

    for (const sourceId of args.sourceIds) {
      // Never make a note its own parent (e.g. a group parent selected
      // alongside one of its own children).
      if (sourceId === parentId) {
        continue
      }

      const source = await ctx.db.get(sourceId)
      if (!source) {
        continue
      }

      // If this card was itself a group parent, flatten its group by moving
      // every child onto the target parent before re-parenting the card — this
      // keeps the tree single-level (no grandchildren).
      const childrenNotes = await ctx.db
        .query('notes')
        .filter(q => q.eq(q.field('mergeParentId'), source._id))
        .collect()

      for (const childNote of childrenNotes) {
        await ctx.db.patch(childNote._id, {
          mergeParentId: parentId,
        })
      }

      await ctx.db.patch(source._id, {
        mergeParentId: parentId,
      })
    }
  },
})
