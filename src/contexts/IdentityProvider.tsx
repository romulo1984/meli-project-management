'use client'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import {
  ensureAnonId,
  generateAvatarDataUri,
  getStoredAvatar,
  getStoredName,
  isValidName,
  normalizeName,
  persistAvatar,
  persistName,
} from '@/helpers/localIdentity'
import NameModal from '@/components/name-modal'

type NameModalMode = 'welcome' | 'edit'

interface IdentityContextValue {
  /** True once the client has read localStorage and ensured an anon id. */
  ready: boolean
  /** Stable local id (localStorage). Null during SSR / first paint. */
  anonId: string | null
  /** Current display name ('' until the user sets one). */
  name: string
  /** Whether a usable display name has been set. */
  hasName: boolean
  /** Convex users._id for this identity (null until upserted). */
  userId: Id<'users'> | null
  /**
   * Avatar data URI for the current identity — the custom uploaded image when
   * present, otherwise the generated letter avatar.
   */
  avatar: string
  /** Custom uploaded avatar data URI, or null when using the generated letter. */
  customAvatar: string | null
  /**
   * Persist + upsert a new display name (identity id stays the same). Pass
   * `avatar` to also set (string) or clear (null) the custom uploaded avatar;
   * omit it to keep the current avatar untouched.
   */
  saveName: (name: string, avatar?: string | null) => Promise<Id<'users'> | null>
  /**
   * Resolve the Convex user id for this device, prompting for a name first if
   * one hasn't been set. Resolves `null` if the user dismisses the prompt.
   * Use this before any action that needs an identity (create/join a retro).
   */
  ensureIdentity: () => Promise<Id<'users'> | null>
  /** Open the welcome modal if no name is set yet (no-op otherwise). */
  promptName: () => void
  /** Open the modal in "edit" mode to change the display name. */
  openRename: () => void
  isNameModalOpen: boolean
  nameModalMode: NameModalMode
  closeNameModal: () => void
}

const IdentityContext = createContext<IdentityContextValue | null>(null)

export function IdentityProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [anonId, setAnonId] = useState<string | null>(null)
  const [name, setNameState] = useState('')
  const [customAvatar, setCustomAvatar] = useState<string | null>(null)
  const [userId, setUserId] = useState<Id<'users'> | null>(null)
  const [isNameModalOpen, setIsNameModalOpen] = useState(false)
  const [nameModalMode, setNameModalMode] = useState<NameModalMode>('welcome')
  const pendingResolveRef = useRef<((id: Id<'users'> | null) => void) | null>(
    null,
  )

  const storeUser = useMutation(api.users.store)

  const hasName = isValidName(name)
  // Custom uploaded image wins; otherwise fall back to the generated letter
  // avatar (which updates its initial/color as the name changes).
  const avatar = customAvatar || (anonId ? generateAvatarDataUri(anonId, name) : '')

  const upsert = useCallback(
    async (
      id: string,
      displayName: string,
      customAvatarValue: string | null,
    ): Promise<Id<'users'> | null> => {
      const normalized = normalizeName(displayName)
      if (!id || normalized.length === 0) return null
      const convexId = await storeUser({
        userId: id,
        userName: normalized,
        // Persist the custom avatar when set, else the generated letter avatar.
        avatar: customAvatarValue || generateAvatarDataUri(id, normalized),
      })
      setUserId(convexId)
      return convexId
    },
    [storeUser],
  )

  // Client-only bootstrap: read/create the local identity after mount so the
  // server and first client render agree (ready === false) → no hydration gap.
  useEffect(() => {
    const id = ensureAnonId()
    const storedName = getStoredName()
    const storedAvatar = getStoredAvatar()
    setAnonId(id)
    setNameState(storedName)
    setCustomAvatar(storedAvatar)
    setReady(true)
    if (isValidName(storedName)) {
      upsert(id, storedName, storedAvatar).catch(() => undefined)
    }
  }, [upsert])

  const saveName = useCallback(
    async (
      raw: string,
      avatar?: string | null,
    ): Promise<Id<'users'> | null> => {
      const normalized = normalizeName(raw)
      if (!isValidName(normalized)) return null
      const { anonId: id } = persistName(normalized)
      // `avatar === undefined` keeps the current avatar; a string sets it and
      // null clears it back to the generated letter avatar.
      let nextAvatar = customAvatar
      if (avatar !== undefined) {
        persistAvatar(avatar)
        nextAvatar = avatar
        setCustomAvatar(avatar)
      }
      setAnonId(id)
      setNameState(normalized)
      const convexId = await upsert(id, normalized, nextAvatar)
      setIsNameModalOpen(false)
      const resolve = pendingResolveRef.current
      pendingResolveRef.current = null
      resolve?.(convexId)
      return convexId
    },
    [upsert, customAvatar],
  )

  const ensureIdentity = useCallback(async (): Promise<Id<'users'> | null> => {
    if (userId) return userId
    const id = ensureAnonId()
    const storedName = getStoredName()
    if (isValidName(storedName)) {
      return upsert(id, storedName, getStoredAvatar())
    }
    return new Promise<Id<'users'> | null>(resolve => {
      pendingResolveRef.current = resolve
      setNameModalMode('welcome')
      setIsNameModalOpen(true)
    })
  }, [userId, upsert])

  const promptName = useCallback(() => {
    if (isValidName(getStoredName())) return
    setNameModalMode('welcome')
    setIsNameModalOpen(true)
  }, [])

  const openRename = useCallback(() => {
    setNameModalMode('edit')
    setIsNameModalOpen(true)
  }, [])

  const closeNameModal = useCallback(() => {
    const resolve = pendingResolveRef.current
    pendingResolveRef.current = null
    setIsNameModalOpen(false)
    resolve?.(null)
  }, [])

  const value: IdentityContextValue = {
    ready,
    anonId,
    name,
    hasName,
    userId,
    avatar,
    customAvatar,
    saveName,
    ensureIdentity,
    promptName,
    openRename,
    isNameModalOpen,
    nameModalMode,
    closeNameModal,
  }

  return (
    <IdentityContext.Provider value={value}>
      {children}
      <NameModal />
    </IdentityContext.Provider>
  )
}

export function useIdentity(): IdentityContextValue {
  const ctx = useContext(IdentityContext)
  if (!ctx) {
    throw new Error('useIdentity must be used within an IdentityProvider')
  }
  return ctx
}
