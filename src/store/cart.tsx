"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react"
import type { CartLineItem } from "@/types/cart"

const CART_STORAGE_KEY = "youleap_cart_v1"

type CartState = {
  items: CartLineItem[]
  isOpen: boolean
  hydrated: boolean
}

type AddItemInput = Omit<CartLineItem, "quantity"> & { quantity?: number }

type CartAction =
  | { type: "HYDRATE"; payload: CartLineItem[] }
  | { type: "ADD_ITEM"; payload: AddItemInput }
  | { type: "REMOVE_ITEM"; payload: { variantId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { variantId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "TOGGLE_CART" }

type CartContextValue = {
  items: CartLineItem[]
  isOpen: boolean
  itemCount: number
  subtotal: number
  currencyCode: string
  addItem: (item: AddItemInput) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, items: action.payload, hydrated: true }
    case "ADD_ITEM": {
      const quantity = action.payload.quantity ?? 1
      const existing = state.items.find(
        (item) => item.variantId === action.payload.variantId
      )

      if (existing) {
        const newQty = Math.min(
          existing.quantity + quantity,
          existing.maxQuantity
        )
        return {
          ...state,
          isOpen: true,
          items: state.items.map((item) =>
            item.variantId === action.payload.variantId
              ? { ...item, quantity: newQty }
              : item
          ),
        }
      }

      const maxQuantity = action.payload.maxQuantity
      return {
        ...state,
        isOpen: true,
        items: [
          ...state.items,
          { ...action.payload, quantity: Math.min(quantity, maxQuantity), maxQuantity },
        ],
      }
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.variantId !== action.payload.variantId),
      }
    case "UPDATE_QUANTITY": {
      const item = state.items.find((i) => i.variantId === action.payload.variantId)
      if (!item) return state
      const quantity = Math.max(1, Math.min(action.payload.quantity, item.maxQuantity))
      return {
        ...state,
        items: state.items.map((i) =>
          i.variantId === action.payload.variantId
            ? { ...i, quantity }
            : i
        ),
      }
    }
    case "CLEAR_CART":
      return { ...state, items: [] }
    case "OPEN_CART":
      return { ...state, isOpen: true }
    case "CLOSE_CART":
      return { ...state, isOpen: false }
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen }
    default:
      return state
  }
}

function loadCartFromStorage(): CartLineItem[] {
  if (typeof window === "undefined") return []
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY)
    if (!saved) return []
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function initializeCart(): CartState {
  return { items: [], isOpen: false, hydrated: false }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, initializeCart)

  useEffect(() => {
    dispatch({ type: "HYDRATE", payload: loadCartFromStorage() })
  }, [])

  // Persist items to localStorage on every change
  useEffect(() => {
    if (!state.hydrated) return
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items))
    } catch {
      // localStorage may be full or unavailable — silently ignore
    }
  }, [state.hydrated, state.items])

  const addItem = useCallback((item: AddItemInput) => {
    dispatch({ type: "ADD_ITEM", payload: item })
  }, [])

  const removeItem = useCallback((variantId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { variantId } })
  }, [])

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { variantId, quantity } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" })
  }, [])

  const openCart = useCallback(() => {
    dispatch({ type: "OPEN_CART" })
  }, [])

  const closeCart = useCallback(() => {
    dispatch({ type: "CLOSE_CART" })
  }, [])

  const toggleCart = useCallback(() => {
    dispatch({ type: "TOGGLE_CART" })
  }, [])

  const value = useMemo<CartContextValue>(() => {
    const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = state.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    )
    const currencyCode = state.items[0]?.currencyCode ?? "ILS"

    return {
      items: state.items,
      isOpen: state.isOpen,
      itemCount,
      subtotal,
      currencyCode,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
    }
  }, [
    state.items,
    state.isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
  ])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
