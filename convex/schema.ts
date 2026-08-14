import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    name: v.string(),
    avatar: v.optional(v.string()),
    tokenIdentifier: v.string(),
    // Optional, unused by the current app (feature/encrypted-notes compat) — see notes table.
    publicKey: v.optional(v.string()),
    encryptedPrivateKey: v.optional(v.string()),
    encryptedPrivateKeyRecovery: v.optional(v.string()),
  }).index('by_token', ['tokenIdentifier']),
  notes: defineTable({
    body: v.string(),
    pipeline: v.string(),
    userId: v.id('users'),
    retroId: v.id('retros'),
    anonymous: v.optional(v.boolean()),
    mergeParentId: v.optional(v.id('notes')),
    likes: v.optional(v.array(v.id('users'))),
    position: v.optional(v.number()),
    assignedTo: v.optional(v.id('users')),
    // Optional, unused by the current app. Present so `convex dev` schema
    // validation passes against pre-existing encrypted-notes documents in the
    // dev deployment (from the feature/encrypted-notes experiment).
    ciphertext: v.optional(v.string()),
    iv: v.optional(v.string()),
    keyVersion: v.optional(v.number()),
  }).index('by_retro_id', ['retroId']),
  retros: defineTable({
    name: v.string(),
    ownerId: v.id('users'),
    timer: v.optional(v.number()),
    startTimer: v.optional(v.number()),
    timerStatus: v.optional(v.string()),
    notesShowingStatus: v.optional(v.string()),
    status: v.optional(v.string()),
    // Highlight mode: a single participant controls highlighting at a time.
    // `highlightControllerId` is the current controller (a server-enforced lock);
    // `highlightedNoteId` is the card everyone should see highlighted. Both are
    // optional/backward-compatible (undefined = highlight mode off / nothing highlighted).
    highlightControllerId: v.optional(v.id('users')),
    highlightedNoteId: v.optional(v.id('notes')),
    // Optional custom display labels for the three columns. When unset/empty the
    // client falls back to the hardcoded defaults ("Good"/"Bad"/"Actions").
    goodLabel: v.optional(v.string()),
    badLabel: v.optional(v.string()),
    actionLabel: v.optional(v.string()),
    // Per-person like/vote budget for the whole retro (classic dot-voting).
    // Optional/backward-compatible: treat undefined as the default of 3. The
    // value is clamped to [1, 20] server-side (see convex/retros.ts) and the
    // budget is enforced in convex/notes.ts likeToggle — never trusted from the
    // client.
    maxLikes: v.optional(v.number()),
    // When true, each column's top-level cards are ordered by total group votes
    // (descending) instead of manual position. Optional/backward-compatible
    // (undefined = off). Owner-toggled, shared across everyone on the board.
    sortByVotes: v.optional(v.boolean()),
    // Optional, unused by the current app (feature/encrypted-notes compat) — see notes table.
    encryptionEnabled: v.optional(v.boolean()),
    keyVersion: v.optional(v.number()),
  }).index('by_owner_id', ['ownerId']),
  users_retro: defineTable({
    userId: v.id('users'),
    retroId: v.id('retros'),
  })
    .index('by_retro_id', ['retroId'])
    .index('by_user_id', ['userId']),
})
