# CLAUDE.md

This file gives Claude Code (claude.ai/code) guidance when working in this repository.

**The canonical agent context lives in [AGENTS.md](./AGENTS.md).** Read it first — it
covers the product, tech stack, commands, repository map, data model, conventions,
environment variables, security notes, and gotchas. This file only adds a few
Claude-specific reminders; it does not duplicate that content.

## Quick reference

```bash
npm ci             # install
npm run dev        # Next.js dev server (terminal 1) → http://localhost:3000
npm run convex:dev # Convex dev server (terminal 2)
npm run lint       # ESLint — run before committing
```

Both dev servers must run at the same time. There is no test suite; validate with
`npm run lint` and a manual browser smoke test.

## Working agreements

- **Backend = Convex.** Add data access as queries/mutations in `convex/*.ts`; never edit
  the auto-generated `convex/_generated/` directory.
- **Path aliases**: `@/*` → `src/*`, `@convex/*` → `convex/*`.
- **Auth-gate and input-validate every new `src/app/api/*` route.** Note the existing
  unauthenticated `POST /api/speech` is known tech debt — do not copy that pattern
  (see AGENTS.md → Security notes).
- **Secrets** stay in `.env.local` / the Convex dashboard and are never committed or
  logged. Only `NEXT_PUBLIC_*` values may reach the client bundle.
- Keep changes scoped and match the surrounding style (TypeScript strict, functional
  components, Tailwind-first). Update [AGENTS.md](./AGENTS.md) and [README.md](./README.md)
  when the architecture or setup changes.
