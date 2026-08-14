import { query, mutation } from './_generated/server'
import { v } from 'convex/values'
import { asyncMap, toPublicUser } from './lib/relationships'
import { Doc } from './_generated/dataModel'

const unknownUser = {
  name: 'Unknown',
}

// Custom column labels are short display strings; clamp to keep storage bounded
// and headers readable. Rendered through React (auto-escaped), never raw markup.
const MAX_COLUMN_LABEL_LENGTH = 30

// Per-person like/vote budget bounds. `DEFAULT_MAX_LIKES` is used whenever a
// retro has no explicit value (backward-compatible). Keep in sync with the
// clamp in convex/notes.ts likeToggle and the client stepper bounds.
const MIN_MAX_LIKES = 1
const MAX_MAX_LIKES = 20
export const DEFAULT_MAX_LIKES = 3

// Clamp an untrusted numeric budget to [MIN_MAX_LIKES, MAX_MAX_LIKES]. Guards
// against NaN/Infinity/floats coming from the client (CWE-190 / CWE-841): the
// value is floored and bounded, and falls back to the default when not finite.
export const clampMaxLikes = (value: number | undefined): number => {
  if (value === undefined || !Number.isFinite(value)) return DEFAULT_MAX_LIKES
  return Math.min(MAX_MAX_LIKES, Math.max(MIN_MAX_LIKES, Math.floor(value)))
}

export const get = query({
  args: { id: v.id('retros') },
  handler: async (ctx, args) => {
    const retro = await ctx.db.get(args.id)
    const notes = await ctx.db
      .query('notes')
      .withIndex('by_retro_id', q => q.eq('retroId', args.id))
      .collect()
    const usersRetro = await ctx.db
      .query('users_retro')
      .withIndex('by_retro_id', q => q.eq('retroId', args.id))
      .collect()

    const owner = retro
      ? toPublicUser(await ctx.db.get(retro?.ownerId))
      : unknownUser

    return {
      ...retro,
      owner,
      notes,
      users: await asyncMap(usersRetro, async user => {
        return toPublicUser(await ctx.db.get(user.userId))
      }),
    }
  },
})

export const myRetros = query({
  args: { userId: v.optional(v.id('users')) },
  handler: async (ctx, args) => {
    const { userId } = args

    if (!userId) return undefined

    const usersRetro = await ctx.db
      .query('users_retro')
      .withIndex('by_user_id', q => q.eq('userId', userId))
      .collect()

    return asyncMap(usersRetro, async userRetro => {
      const retro = await ctx.db.get(userRetro.retroId)
      let users: Doc<'users_retro'>[] = []

      if (retro) {
        users = await ctx.db
          .query('users_retro')
          .withIndex('by_retro_id', q => q.eq('retroId', retro._id))
          .collect()
      }

      const owner = retro
        ? toPublicUser(await ctx.db.get(retro?.ownerId))
        : unknownUser

      return {
        ...retro,
        owner,
        users: await asyncMap(users, async user => {
          return toPublicUser(await ctx.db.get(user.userId))
        }),
      }
    })
  },
})

export const store = mutation({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_token', q => q.eq('tokenIdentifier', args.ownerId))
      .unique()

    const payload = {
      name: `Retrô ${new Date().toDateString()}`,
      timer: 45000,
      ownerId: user?._id!,
    }

    const retroId = await ctx.db.insert('retros', payload)

    await ctx.db.insert('users_retro', {
      retroId: retroId,
      userId: user?._id!,
    })

    return retroId
  },
})

export const update = mutation({
  args: { id: v.id('retros'), name: v.string() },
  handler: async (ctx, args) => {
    const retro = await ctx.db.get(args.id)

    if (retro) {
      // Trim + clamp defensively; ignore an empty name (keep the current one).
      const name = args.name.trim().slice(0, 60)
      if (name) {
        await ctx.db.patch(retro._id, { name })
      }
    }
  },
})

export const updateTimer = mutation({
  args: {
    id: v.id('retros'),
    timer: v.optional(v.number()),
    startTimer: v.optional(v.number()),
    timerStatus: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...args }) => {
    const retro = await ctx.db.get(id)

    if (retro) {
      await ctx.db.patch(retro._id, args)
    }
  },
})

export const updateNotesShowingStatus = mutation({
  args: { id: v.id('retros'), status: v.string() },
  handler: async (ctx, args) => {
    const retro = await ctx.db.get(args.id)

    if (retro) {
      await ctx.db.patch(retro._id, { notesShowingStatus: args.status })
    }
  },
})

export const updateStatus = mutation({
  args: { id: v.id('retros'), status: v.string() },
  handler: async (ctx, args) => {
    const retro = await ctx.db.get(args.id)

    if (retro) {
      await ctx.db.patch(retro._id, { status: args.status })
    }
  },
})

// Set the per-person like/vote budget for the retro. The incoming number is
// UNTRUSTED — clamp it to [1, 20] server-side (never rely on the client's own
// min/max). The budget itself is enforced in convex/notes.ts likeToggle.
export const updateMaxLikes = mutation({
  args: { id: v.id('retros'), maxLikes: v.number() },
  handler: async (ctx, args) => {
    const retro = await ctx.db.get(args.id)

    if (retro) {
      await ctx.db.patch(retro._id, { maxLikes: clampMaxLikes(args.maxLikes) })
    }
  },
})

// Toggle the "sort by most voted" ordering for the retro. Shared across every
// participant; the actual re-sorting happens client-side in the board page.
export const updateSortByVotes = mutation({
  args: { id: v.id('retros'), sortByVotes: v.boolean() },
  handler: async (ctx, args) => {
    const retro = await ctx.db.get(args.id)

    if (retro) {
      await ctx.db.patch(retro._id, { sortByVotes: args.sortByVotes })
    }
  },
})

// --- Highlight mode -------------------------------------------------------
//
// Only ONE participant may drive highlighting at a time. Control is a lock
// stored on the retro document and enforced SERVER-SIDE against persisted
// state — the client never gets to assert "I'm the controller" (CWE-639 /
// CWE-862 / CWE-841). Convex mutations run in a serializable transaction, so
// each read-check-write below is atomic: concurrent claims conflict on the
// same retro document and only one can win (race-safe, no extra locking).

// Acquire the highlight-control lock. Succeeds only when no one holds it, or
// when the caller already holds it (idempotent re-claim). Returns whether the
// caller controls highlighting after the call.
export const claimHighlightControl = mutation({
  args: { id: v.id('retros'), userId: v.id('users') },
  handler: async (ctx, args) => {
    const retro = await ctx.db.get(args.id)
    if (!retro) return false

    const controllerId = retro.highlightControllerId
    // Someone else is in control → refuse (do not steal the lock).
    if (controllerId && controllerId !== args.userId) {
      return false
    }

    await ctx.db.patch(retro._id, { highlightControllerId: args.userId })
    return true
  },
})

// Release the highlight-control lock and clear the highlight. Only the current
// controller may release it (checked against stored state, not client claim).
export const releaseHighlightControl = mutation({
  args: { id: v.id('retros'), userId: v.id('users') },
  handler: async (ctx, args) => {
    const retro = await ctx.db.get(args.id)
    if (!retro) return false

    if (retro.highlightControllerId !== args.userId) {
      return false
    }

    await ctx.db.patch(retro._id, {
      highlightControllerId: undefined,
      highlightedNoteId: undefined,
    })
    return true
  },
})

// Set (or clear, when `noteId` is omitted) the highlighted card. Only the
// current controller may do this, and a provided note must belong to THIS
// retro — both verified against the database, never trusting the caller.
export const setHighlightedNote = mutation({
  args: {
    id: v.id('retros'),
    userId: v.id('users'),
    noteId: v.optional(v.id('notes')),
  },
  handler: async (ctx, args) => {
    const retro = await ctx.db.get(args.id)
    if (!retro) return false

    // Authorization: caller must be the current controller.
    if (retro.highlightControllerId !== args.userId) {
      return false
    }

    // Clearing the highlight is always allowed for the controller.
    if (!args.noteId) {
      await ctx.db.patch(retro._id, { highlightedNoteId: undefined })
      return true
    }

    // Validate the note exists and belongs to this retro (prevents pointing the
    // shared highlight at a card from another board).
    const note = await ctx.db.get(args.noteId)
    if (!note || note.retroId !== retro._id) {
      return false
    }

    await ctx.db.patch(retro._id, { highlightedNoteId: args.noteId })
    return true
  },
})

export const updateColumnLabel = mutation({
  // `column` is an allowlist of the fixed pipeline values (least-permissive
  // validation); `label` is trimmed and length-clamped below before storage.
  args: {
    id: v.id('retros'),
    column: v.union(v.literal('good'), v.literal('bad'), v.literal('action')),
    label: v.string(),
  },
  handler: async (ctx, args) => {
    const retro = await ctx.db.get(args.id)

    if (retro) {
      const label = args.label.trim().slice(0, MAX_COLUMN_LABEL_LENGTH)

      if (args.column === 'good') {
        await ctx.db.patch(retro._id, { goodLabel: label })
      } else if (args.column === 'bad') {
        await ctx.db.patch(retro._id, { badLabel: label })
      } else {
        await ctx.db.patch(retro._id, { actionLabel: label })
      }
    }
  },
})
