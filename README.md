# /retrospectool

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

A real-time, collaborative **agile retrospective** tool. Create a board, share the link,
and run your team's retro together on three columns — **Good** (what went well),
**Bad** (what to improve), and **Actions** (action items) — with everything syncing live
for every participant.

> The repository is named `meli-project-management`, but the product it ships is
> `/retrospectool`. It is a personal open-source project.

## Features

- 🟢🔴🟣 **Three-column retro board** — Good / Bad / Actions.
- ⚡ **Real-time collaboration** — all changes sync instantly via Convex.
- 🙋 **No sign-up** — pick a display name and go; anyone with the link can join. Your
  identity is stored locally and you can rename yourself anytime.
- 🙈 **Anonymous notes** and a **hide/blur mode** to keep notes hidden until reveal.
- 👍 **Likes**, **assign action items** to participants, and **drag & drop** to reorder.
- 🧲 **Merge notes** — drag one card onto another, or multi-select and merge.
- ⏱️ **Per-board timer** to keep the session on track.
- ✨ **AI-generated action items** from your "Bad" notes (OpenAI / Anthropic via the
  Vercel AI SDK).
- 🔊 **Text-to-speech** playback of a note (ElevenLabs).

## Tech stack

- **[Next.js 13](https://nextjs.org/)** (App Router) + **React 18** + **TypeScript**
- **[Convex](https://convex.dev/)** — reactive database and serverless backend
- **Anonymous local identity** (localStorage) — no auth provider needed.
  [Clerk](https://clerk.com/) login is preserved but deprecated behind a feature flag.
- **[Vercel AI SDK](https://sdk.vercel.ai/)** with OpenAI & Anthropic providers
- **[ElevenLabs](https://elevenlabs.io/)** — text-to-speech
- **Tailwind CSS** + **[shadcn/ui](https://ui.shadcn.com/)** (Radix UI), **dnd-kit**, Lottie

## Prerequisites

- **Node.js `24.x`** (see [`.nvmrc`](./.nvmrc)) — `nvm use` if you have nvm.
- A free **[Convex](https://convex.dev/)** account.
- *(Optional)* OpenAI / Anthropic and ElevenLabs API keys for the AI and speech features.

## Setup

Install dependencies:

```shell
npm ci
```

### 1. Create a Convex project

Sign up at [convex.dev](https://convex.dev) and create a new project. No auth provider or
Clerk setup is needed — the app is anonymous.

### 2. Configure local environment variables

Copy the example file:

```shell
cp env.example .env.local
```

| Variable                | Where        | Purpose                                        |
| ----------------------- | ------------ | ---------------------------------------------- |
| `CONVEX_DEPLOYMENT`     | `.env.local` | Written automatically by `npm run convex:dev`. |
| `NEXT_PUBLIC_CONVEX_URL`| `.env.local` | Convex endpoint (public).                      |
| `OPENAI_API_KEY`        | `.env.local` | Optional — AI action items (**secret**).       |
| `ANTHROPIC_API_KEY`     | `.env.local` | Optional — AI action items (**secret**).       |
| `ELEVEN_LABS_API_KEY`   | `.env.local` | Optional — text-to-speech (**secret**).        |

> `.env.local` is gitignored — never commit real secret values. `NEXT_PUBLIC_*` values
> are inlined into the client bundle and are public by design.

<details>
<summary>Reviving Clerk login (optional / legacy)</summary>

Login is deprecated: `CLERK_AUTH_ENABLED` in `src/config/features.ts` is `false`. To bring
it back, set it to `true` and provide the Clerk env vars
(`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `CLERK_JWT_ISSUER_DOMAIN` in
the Convex dashboard). The original Clerk setup (create a Clerk app with Google, add a
Convex JWT template) is still wired in the codebase and its screenshots live in `docs/`.

</details>

### 3. Start the dev servers

In one terminal:

```shell
npm run dev
```

In another terminal:

```shell
npm run convex:dev
```

The first `convex dev` run finishes wiring up `.env.local` for you.

### You're all set!

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script                  | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Start the Next.js dev server.            |
| `npm run convex:dev`    | Start the Convex dev server (watch mode).|
| `npm run build`         | Production build.                        |
| `npm run start`         | Serve the production build.              |
| `npm run lint`          | Run ESLint (`next lint`).                |

There is no automated test suite yet; validate changes with `npm run lint` and a manual
browser smoke test.

## Project structure

```
convex/   # Backend: schema + serverless queries/mutations (data lives here)
src/app/  # Next.js App Router pages and API routes
src/components, src/helpers, src/services, src/contexts  # UI, hooks, integrations
```

See **[AGENTS.md](./AGENTS.md)** for a detailed architecture overview, data model, and
conventions.

## For AI coding agents

This repo is set up for AI coding assistants. Start with **[AGENTS.md](./AGENTS.md)**
(canonical context) and **[CLAUDE.md](./CLAUDE.md)** (Claude Code notes).

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://mercadolivre.com.br"><img src="https://avatars.githubusercontent.com/u/1641962?v=4?s=100" width="100px;" alt="Rômulo Guimarães"/><br /><sub><b>Rômulo Guimarães</b></sub></a><br /><a href="https://github.com/romulo1984/meli-project-management/commits?author=romulo1984" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://jorgeemanoel.com"><img src="https://avatars.githubusercontent.com/u/22504189?v=4?s=100" width="100px;" alt="Jorge Emanoel"/><br /><sub><b>Jorge Emanoel</b></sub></a><br /><a href="https://github.com/romulo1984/meli-project-management/commits?author=JorgeEmanoel" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
