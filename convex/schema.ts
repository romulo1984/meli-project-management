import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  notes: defineTable({
    body: v.string(),
    userId: v.id('users'),
    retroId: v.id('retros'),
  }),
  users: defineTable({
    name: v.string(),
    retroId: v.id('retros'),
    tokenIdentifier: v.optional(v.string()),
  }).index('by_token', ['tokenIdentifier']),
  retros: defineTable({
    name: v.string(),
    ownerId: v.string(),
  })
})