/**
 * Local (anonymous) identity helpers.
 *
 * Since Clerk is deprecated (see src/config/features.ts), a user is identified
 * purely locally: a random, unguessable id persisted in localStorage plus a
 * display name they can change at any time. The id is stable for the life of
 * the browser profile, so the same person keeps the same identity (and the
 * retros they created/joined) even after renaming.
 *
 * Security notes:
 * - The id is generated with crypto.randomUUID() (CSPRNG, UUID v4) — never
 *   Math.random() and never a predictable/sequential value (CWE-338).
 * - The id is a local *bearer capability*: whoever holds it "is" that user.
 *   It is kept in localStorage and never rendered or broadcast to other
 *   clients, which is what keeps casual impersonation off the table in an
 *   otherwise unauthenticated (anonymous) app (CWE-639).
 * - The generated avatar embeds only a sanitized [A-Z0-9] initial and an
 *   id-derived color — no raw user input — so it is safe to use as an <img>
 *   src even though it is an inline SVG (CWE-79).
 */

const STORAGE_KEY = 'retrospectool.identity.v1'
export const MAX_NAME_LENGTH = 40

/**
 * Max length of a stored custom-avatar data URI (~100KB). The uploaded image is
 * re-encoded to a small canvas before storage (see helpers/avatarImage.ts), so
 * this keeps both the localStorage record and the persisted DB string small.
 */
export const MAX_AVATAR_DATA_URI_LENGTH = 100 * 1024

export interface StoredIdentity {
  anonId: string
  name: string
  /** Optional custom uploaded avatar (base64 raster data URI). */
  avatar?: string
}

/**
 * Accept only a small, base64-encoded raster data URI as a stored avatar. This
 * is an allowlist (png/jpeg/webp), so it rejects `data:image/svg+xml,...`
 * (SVG can execute script), oversized strings, and any other junk — defense in
 * depth against a tampered localStorage record.
 */
const isStoredAvatar = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length <= MAX_AVATAR_DATA_URI_LENGTH &&
  /^data:image\/(png|jpeg|webp);base64,/.test(value)

const isBrowser = (): boolean => typeof window !== 'undefined'

/** Cryptographically-strong random id (UUID v4). Falls back safely if needed. */
const randomId = (): string => {
  if (isBrowser() && window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }
  // Fallback: 16 CSPRNG bytes as hex (still not Math.random).
  if (isBrowser() && window.crypto?.getRandomValues) {
    const bytes = new Uint8Array(16)
    window.crypto.getRandomValues(bytes)
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
  }
  throw new Error('Secure RNG unavailable: cannot create a local identity')
}

/** Uniform-ish random integer in [0, maxExclusive) using a CSPRNG (no Math.random). */
const cryptoRandomInt = (maxExclusive: number): number => {
  if (maxExclusive <= 0) return 0
  if (isBrowser() && window.crypto?.getRandomValues) {
    const arr = new Uint32Array(1)
    window.crypto.getRandomValues(arr)
    return arr[0] % maxExclusive
  }
  return 0
}

const readStorage = (): StoredIdentity | null => {
  if (!isBrowser()) return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredIdentity>
    if (!parsed || typeof parsed.anonId !== 'string' || !parsed.anonId) return null
    // Backward compatible: older records had no `avatar` key (undefined here).
    return {
      anonId: parsed.anonId,
      name: normalizeName(parsed.name ?? ''),
      avatar: isStoredAvatar(parsed.avatar) ? parsed.avatar : undefined,
    }
  } catch {
    return null
  }
}

const writeStorage = (identity: StoredIdentity): void => {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identity))
  } catch {
    // localStorage may be unavailable (private mode / disabled) — degrade
    // gracefully; identity simply won't persist across reloads.
  }
}

/** Ensure a stable anon id exists in storage, creating one on first use. */
export const ensureAnonId = (): string => {
  const existing = readStorage()
  if (existing) return existing.anonId
  const anonId = randomId()
  writeStorage({ anonId, name: '' })
  return anonId
}

export const getStoredName = (): string => readStorage()?.name ?? ''

/** Current custom uploaded avatar, or null when using the generated letter. */
export const getStoredAvatar = (): string | null => readStorage()?.avatar ?? null

/**
 * Persist the display name against the existing anon id (creating id if absent).
 * A previously uploaded custom avatar is preserved — renaming must not wipe it.
 */
export const persistName = (name: string): StoredIdentity => {
  const existing = readStorage()
  const anonId = existing?.anonId ?? ensureAnonId()
  const identity: StoredIdentity = {
    anonId,
    name: normalizeName(name),
    avatar: existing?.avatar,
  }
  writeStorage(identity)
  return identity
}

/**
 * Persist (or clear, when null) the custom uploaded avatar against the existing
 * identity, preserving the display name. Pass null to fall back to the
 * generated letter avatar. The value is re-validated on write (defense in
 * depth) so only a small raster data URI is ever stored.
 */
export const persistAvatar = (avatar: string | null): StoredIdentity => {
  const existing = readStorage()
  const anonId = existing?.anonId ?? ensureAnonId()
  const identity: StoredIdentity = {
    anonId,
    name: existing?.name ?? '',
    avatar: isStoredAvatar(avatar) ? avatar : undefined,
  }
  writeStorage(identity)
  return identity
}

/** Replace ASCII control characters (C0 range + DEL) with spaces. */
const stripControlChars = (value: string): string => {
  let out = ''
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i)
    out += code < 0x20 || code === 0x7f ? ' ' : value[i]
  }
  return out
}

/**
 * Normalize a user-supplied display name: strip control characters, collapse
 * whitespace, trim, and cap length. This is the input-validation allowlist
 * step — the UI should reject the result if `isValidName` is false.
 */
export const normalizeName = (raw: string): string => {
  if (typeof raw !== 'string') return ''
  return stripControlChars(raw).replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH)
}

export const isValidName = (raw: string): boolean => normalizeName(raw).length >= 1

/** Deterministic non-negative hash (djb2). Not security-sensitive. */
const hashString = (value: string): number => {
  let hash = 5381
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i)
  }
  return Math.abs(hash)
}

/** First [A-Z0-9] character of the name, uppercased; safe to embed in SVG. */
const safeInitial = (name: string): string => {
  const match = normalizeName(name).toUpperCase().match(/[A-Z0-9]/)
  return match ? match[0] : '?'
}

/**
 * Build a deterministic, self-contained avatar as an SVG data URI.
 * Color is derived from `seed` (stable per identity); the single initial is
 * sanitized to [A-Z0-9?] so no user-controlled string is ever interpolated
 * into markup (XSS-safe as an <img> src).
 */
export const generateAvatarDataUri = (seed: string, name: string): string => {
  const hue = hashString(seed || 'anon') % 360
  const c1 = `hsl(${hue}, 68%, 56%)`
  const c2 = `hsl(${(hue + 40) % 360}, 68%, 46%)`
  const initial = safeInitial(name)
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='72' height='72' viewBox='0 0 72 72'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/></linearGradient></defs><rect width='72' height='72' rx='36' fill='url(#g)'/><text x='36' y='47' font-family='Roboto, Arial, sans-serif' font-size='32' font-weight='600' fill='#ffffff' text-anchor='middle'>${initial}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const NAME_SUGGESTIONS = [
  'Curious Panda',
  'Brave Otter',
  'Calm Falcon',
  'Witty Fox',
  'Bold Koala',
  'Swift Heron',
  'Chill Lynx',
  'Merry Tapir',
  'Nimble Wren',
  'Sunny Ibis',
]

/** A friendly default name suggestion (crypto-random pick, never Math.random). */
export const suggestName = (): string =>
  NAME_SUGGESTIONS[cryptoRandomInt(NAME_SUGGESTIONS.length)]
