/**
 * Application feature flags.
 *
 * CLERK_AUTH_ENABLED — master switch for Clerk-based authentication.
 *
 * As of the anonymous-identity migration this is OFF: the app runs fully
 * anonymous with a local (localStorage) identity and nothing is routed through
 * Clerk. All Clerk integration code is intentionally preserved behind this flag
 * (see ConvexClientProvider, middleware, Navbar, sign-in/sign-up pages,
 * InitUser/useStoreUserEffect, and the /api/generate-actions auth check) so the
 * login flow can be revived by flipping this back to `true` and restoring the
 * Clerk environment variables.
 *
 * NOTE: flipping this to `true` also requires the Clerk env vars documented in
 * env.example / AGENTS.md to be present at build and runtime.
 */
export const CLERK_AUTH_ENABLED = false
