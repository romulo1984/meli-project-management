'use client'
import { useStoreUserEffect } from '@/helpers/hooks/useStoreUserEffect'

const InitUser = () => {
  useStoreUserEffect()
  return null
}

export {
  InitUser
}