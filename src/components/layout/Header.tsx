"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/store/cart"

export default function Header() {
  const { isOpen, itemCount, toggleCart } = useCart()

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900">
          Youleap Store
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/products"
            className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
          >
            Products
          </Link>

          <button
            type="button"
            onClick={toggleCart}
            className="relative inline-flex items-center justify-center rounded-md border border-zinc-200 p-2 text-zinc-700 transition-colors hover:bg-zinc-50"
            aria-label={`${isOpen ? "Close" : "Open"} cart (${itemCount} items)`}
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1 text-[11px] font-medium text-white">
                {itemCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  )
}
