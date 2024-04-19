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
    likes: v.optional(v.array(v.id('users'))),
    position: v.optional(v.number()),
    assignedTo: v.optional(v.id('users')),
  }).index('by_retro_id', ['retroId']),
  retros: defineTable({
    name: v.string(),
    ownerId: v.id('users'),
    timer: v.optional(v.number()),
    startTimer: v.optional(v.number()),
    timerStatus: v.optional(v.string()),
  }).index('by_owner_id', ['ownerId']),
  users_retro: defineTable({
    userId: v.id('users'),
    retroId: v.id('retros'),
  })
  .index('by_retro_id', ['retroId'])
  .index('by_user_id', ['userId'])
})