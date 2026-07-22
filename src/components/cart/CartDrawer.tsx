"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Minus, Plus, X } from "lucide-react"
import CheckoutForm from "@/components/cart/CheckoutForm"
import { formatMoney } from "@/lib/format"
import { useBodyScrollLock } from "@/lib/useBodyScrollLock"
import { useCart } from "@/store/cart"
import type { CheckoutFormData } from "@/types/cart"

type DrawerView = "cart" | "checkout" | "success"

export default function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    itemCount,
    subtotal,
    currencyCode,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart()

  const dialogRef = useRef<HTMLDialogElement>(null)
  const [view, setView] = useState<DrawerView>("cart")
  const [orderName, setOrderName] = useState("")

  useBodyScrollLock(isOpen)

  // Open/close the native <dialog>
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) dialog.showModal()
    } else {
      dialog.close()
      setView("cart")
      setOrderName("")
    }
  }, [isOpen])

  // Handle native dialog cancel (Escape key fires this)
  const onDialogCancel = useCallback(
    (e: React.SyntheticEvent<HTMLDialogElement>) => {
      e.preventDefault()
      closeCart()
    },
    [closeCart]
  )

  // Handle backdrop click
  const onDialogClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        closeCart()
      }
    },
    [closeCart]
  )

  function handleSuccess(data: CheckoutFormData) {
    setOrderName(data.fullName)
    clearCart()
    setView("success")
  }

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-0 h-dvh max-h-dvh w-full max-w-md ml-auto bg-transparent p-0 backdrop:bg-black/40"
      aria-labelledby="cart-drawer-title"
      onCancel={onDialogCancel}
      onClick={onDialogClick}
    >
      <aside className="flex h-full flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h2 id="cart-drawer-title" className="text-lg font-semibold">
            {view === "cart" && `Cart (${itemCount})`}
            {view === "checkout" && "Checkout"}
            {view === "success" && "Order confirmed"}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {view === "cart" && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <p className="text-sm text-zinc-500">Your cart is empty.</p>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li
                      key={item.variantId}
                      className="flex gap-3 border-b border-zinc-100 pb-4"
                    >
                      <Image
                        src={item.thumbnail}
                        alt=""
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-zinc-500">{item.variantTitle}</p>
                        <p className="mt-1 text-sm">
                          {formatMoney(item.unitPrice, item.currencyCode)}
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                          <div className="inline-flex items-center rounded-md border border-zinc-300">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              className="p-1.5 text-zinc-600 hover:bg-zinc-50"
                              onClick={() =>
                                updateQuantity(item.variantId, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-8 text-center text-sm">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              className="p-1.5 text-zinc-600 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                              onClick={() =>
                                updateQuantity(item.variantId, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.maxQuantity}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {item.quantity >= item.maxQuantity && (
                            <span className="text-xs text-amber-600">Max</span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeItem(item.variantId)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-zinc-200 px-5 py-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-zinc-600">Subtotal</span>
                <span className="font-medium">
                  {formatMoney(subtotal, currencyCode)}
                </span>
              </div>
              <button
                type="button"
                disabled={items.length === 0}
                onClick={() => setView("checkout")}
                className="w-full rounded-md bg-zinc-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                Checkout
              </button>
            </div>
          </>
        )}

        {view === "checkout" && (
          <CheckoutForm onBack={() => setView("cart")} onSuccess={handleSuccess} />
        )}

        {view === "success" && (
          <div className="flex flex-1 flex-col px-5 py-8">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-5">
              <p className="text-base font-semibold text-emerald-900">
                Thank you{orderName ? `, ${orderName}` : ""}!
              </p>
              <p className="mt-2 text-sm text-emerald-800">
                Your order was placed successfully. This is a demo confirmation —
                no payment was processed.
              </p>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="mt-6 w-full rounded-md bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </dialog>
  )
}
