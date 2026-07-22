"use client"

import { useEffect } from "react"

/**
 * Locks body scroll when `locked` is true.
 * Uses a ref-count approach so nested locks don't conflict.
 */
let lockCount = 0

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return

    lockCount++
    if (lockCount === 1) {
      document.body.style.overflow = "hidden"
    }

    return () => {
      lockCount--
      if (lockCount === 0) {
        document.body.style.overflow = ""
      }
    }
  }, [locked])
}
