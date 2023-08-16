import { query } from './_generated/server'
import { v } from 'convex/values'

export const getRetroNotes = query({
  args: { retroId: v.id('retros') },
  handler: async (ctx, args) => ctx.db
    .query('notes')
    .filter((q) => q.eq(q.field('retroId'), args.retroId))
    .collect()
})