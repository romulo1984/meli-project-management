/**
 * Client-side avatar image processing.
 *
 * Turns a user-selected image file into a small, self-contained data URI that
 * is safe to persist in localStorage and in the `users.avatar` string field.
 *
 * Security notes (this is untrusted file handling — be strict):
 * - **Input MIME allowlist** (png/jpeg/webp/gif) — anything else is rejected,
 *   including `image/svg+xml`, because an SVG can carry executable script
 *   (CWE-79). We validate against an allowlist and reject; we never sanitize.
 * - **Input size cap** (5 MB) so a huge upload can't exhaust memory (CWE-400).
 * - **Always re-encode through a <canvas>** — we never store the raw uploaded
 *   bytes. Drawing the decoded pixels onto a canvas and exporting via
 *   `toDataURL` rasterizes the image only: EXIF metadata and any embedded
 *   script/markup payload are dropped. (A GIF is flattened to its first frame.)
 * - **Output size cap** so the persisted string stays small; PNG is tried
 *   first and JPEG is used as a smaller fallback before rejecting.
 */

import { MAX_AVATAR_DATA_URI_LENGTH } from './localIdentity'

/** Longest side of the stored avatar, in pixels (aspect ratio is preserved). */
export const AVATAR_MAX_DIMENSION = 128

/** Maximum accepted input file size (5 MB). */
export const AVATAR_MAX_INPUT_BYTES = 5 * 1024 * 1024

/**
 * Input MIME allowlist. `image/svg+xml` is intentionally excluded — an SVG can
 * execute script — and anything not listed here is rejected outright.
 */
export const AVATAR_ACCEPTED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const

/** `accept` attribute for the file <input> (a UX hint, not a security control). */
export const AVATAR_ACCEPT_ATTR = AVATAR_ACCEPTED_MIME_TYPES.join(',')

export type AvatarProcessResult =
  | { ok: true; dataUri: string }
  | { ok: false; error: string }

const fail = (error: string): AvatarProcessResult => ({ ok: false, error })

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('decode-failed'))
    img.src = src
  })

/**
 * Validate and re-encode a user-selected image into a small avatar data URI,
 * entirely client-side. Returns a discriminated result so the caller can show a
 * friendly error instead of throwing.
 */
export const processAvatarFile = async (
  file: File,
): Promise<AvatarProcessResult> => {
  if (typeof document === 'undefined') {
    return fail("Image processing isn't available here.")
  }

  // 1. MIME allowlist — reject everything that isn't an approved raster type
  //    (this is what keeps image/svg+xml out; CWE-79).
  if (!(AVATAR_ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return fail('Unsupported image type. Please use PNG, JPEG, WebP, or GIF.')
  }

  // 2. Size cap — bound resource usage before we even decode (CWE-400).
  if (file.size > AVATAR_MAX_INPUT_BYTES) {
    return fail('That image is too large (max 5 MB).')
  }

  // Decode via an object URL (no intermediate base64 of the raw bytes).
  const objectUrl = URL.createObjectURL(file)
  let img: HTMLImageElement
  try {
    img = await loadImage(objectUrl)
  } catch {
    return fail("That image couldn't be read. Please try another file.")
  } finally {
    URL.revokeObjectURL(objectUrl)
  }

  const { width, height } = img
  if (!width || !height) {
    return fail("That image couldn't be read. Please try another file.")
  }

  // 3. Resize to fit within AVATAR_MAX_DIMENSION, preserving aspect ratio and
  //    never upscaling.
  const scale = Math.min(1, AVATAR_MAX_DIMENSION / Math.max(width, height))
  const targetWidth = Math.max(1, Math.round(width * scale))
  const targetHeight = Math.max(1, Math.round(height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return fail("Image processing isn't supported in this browser.")
  }
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // 4. Re-encode through the canvas — this is the security-critical step: only
  //    raster pixels survive, so EXIF and any script/markup payload are gone.
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

  let dataUri = canvas.toDataURL('image/png')
  if (dataUri.length > MAX_AVATAR_DATA_URI_LENGTH) {
    // PNG too big for a detailed image — JPEG is much smaller for photos.
    dataUri = canvas.toDataURL('image/jpeg', 0.82)
  }

  // 5. Output cap — keep the persisted string small.
  if (
    !dataUri.startsWith('data:image/') ||
    dataUri.length > MAX_AVATAR_DATA_URI_LENGTH
  ) {
    return fail('That image is too detailed to store. Try a simpler image.')
  }

  return { ok: true, dataUri }
}
