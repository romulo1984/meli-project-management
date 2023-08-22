import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    name: v.string(),
    avatar: v.optional(v.string()),
    tokenIdentifier: v.string(),
  }).index('by_token', ['tokenIdentifier']),
  notes: defineTable({
    body: v.string(),
    pipeline: v.string(),
    userId: v.id('users'),
    retroId: v.id('retros'),
    anonymous: v.optional(v.boolean()),
  }),
  retros: defineTable({
    name: v.string(),
    ownerId: v.id('users'),
  }),
  users_retro: defineTable({
    userId: v.id('users'),
    retroId: v.id('retros'),
  }).index('by_retro_id', ['retroId']),
})