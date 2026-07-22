"use client"

import Image from "next/image"
import type { Product } from "@/types/product"
import { getStartingPrice } from "@/lib/variants"
import { formatMoney } from "@/lib/format"

type ProductCardProps = {
  product: Product
  onQuickView: (productId: string) => void
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const startingPrice = getStartingPrice(product)

  return (
    <article className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <Image
        src={product.thumbnail}
        alt={product.title}
        width={400}
        height={400}
        className="h-64 w-full object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-medium text-zinc-900">{product.title}</h3>
        <p className="mt-1 text-zinc-600">
          {startingPrice
            ? `From ${formatMoney(startingPrice.amount, startingPrice.currency_code)}`
            : "Price unavailable"}
        </p>
        <button
          type="button"
          onClick={() => onQuickView(product.id)}
          className="mt-3 w-full rounded-md bg-zinc-900 py-2 text-sm text-white transition-colors hover:bg-zinc-700"
        >
          Quick View
        </button>
      </div>
    </article>
  )
}
