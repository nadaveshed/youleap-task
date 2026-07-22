"use client"

import { useCallback, useState } from "react"
import ProductCard from "@/components/ProductCard"
import QuickViewModal from "@/components/products/QuickViewModal"
import type { Product } from "@/types/product"

type ProductGridProps = {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [quickViewId, setQuickViewId] = useState<string | null>(null)

  const onQuickView = useCallback((productId: string) => {
    setQuickViewId(productId)
  }, [])

  return (
    <>
      {products.length === 0 ? (
        <p className="text-zinc-500">No products match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      )}

      <QuickViewModal
        productId={quickViewId}
        onClose={() => setQuickViewId(null)}
      />
    </>
  )
}
