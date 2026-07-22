"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { getProduct } from "@/lib/api"
import { formatMoney } from "@/lib/format"
import { useBodyScrollLock } from "@/lib/useBodyScrollLock"
import {
  findVariant,
  getDefaultOptionSelection,
  isInStock,
} from "@/lib/variants"
import { useCart } from "@/store/cart"
import type { Product } from "@/types/product"

type QuickViewModalProps = {
  productId: string | null
  onClose: () => void
}

export default function QuickViewModal({ productId, onClose }: QuickViewModalProps) {
  const { addItem } = useCart()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [activeImage, setActiveImage] = useState(0)

  const isOpen = productId !== null
  useBodyScrollLock(isOpen)

  // Open/close the native <dialog>
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (isOpen) {
      if (!dialog.open) dialog.showModal()
    } else {
      dialog.close()
      setProduct(null)
      setError(null)
      setSelectedOptions({})
      setActiveImage(0)
    }
  }, [isOpen])

  // Fetch product data
  useEffect(() => {
    if (!productId) return

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getProduct(productId!)
        if (cancelled) return
        setProduct(data)
        setSelectedOptions(getDefaultOptionSelection(data))
        setActiveImage(0)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load product")
          setProduct(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [productId])

  const variant = useMemo(
    () => (product ? findVariant(product, selectedOptions) : undefined),
    [product, selectedOptions]
  )

  const price = variant?.prices[0]
  const inStock = isInStock(variant)
  const images = useMemo(() => {
    if (!product) return []
    const urls = [product.thumbnail, ...product.images.map((image) => image.url)]
    return [...new Set(urls.filter(Boolean))]
  }, [product])

  const onSelectOption = useCallback((optionId: string, value: string) => {
    setSelectedOptions((current) => ({ ...current, [optionId]: value }))
  }, [])

  const onAddToCart = useCallback(() => {
    if (!product || !variant || !price || !inStock) return

    addItem({
      productId: product.id,
      variantId: variant.id,
      title: product.title,
      variantTitle: variant.title,
      thumbnail: product.thumbnail,
      unitPrice: price.amount,
      currencyCode: price.currency_code,
      maxQuantity: variant.inventory_quantity,
    })
    onClose()
  }, [addItem, inStock, onClose, price, product, variant])

  // Handle native dialog cancel (Escape key fires this)
  const onDialogCancel = useCallback(
    (e: React.SyntheticEvent<HTMLDialogElement>) => {
      e.preventDefault()
      onClose()
    },
    [onClose]
  )

  // Handle backdrop click via the dialog element itself
  const onDialogClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onClose()
      }
    },
    [onClose]
  )

  return (
    <dialog
      ref={dialogRef}
      className="m-0 mx-auto my-auto max-h-[90vh] w-full max-w-3xl overflow-visible rounded-lg bg-transparent p-0 backdrop:bg-black/40"
      aria-labelledby="quick-view-title"
      onCancel={onDialogCancel}
      onClick={onDialogClick}
    >
      <div className="flex max-h-[90vh] flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
          <h2 id="quick-view-title" className="text-lg font-semibold text-zinc-900">
            Quick View
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {loading && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="aspect-square animate-pulse rounded-lg bg-zinc-100" />
              <div className="space-y-3">
                <div className="h-7 w-3/4 animate-pulse rounded bg-zinc-100" />
                <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-100" />
                <div className="h-10 w-full animate-pulse rounded bg-zinc-100" />
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {!loading && !error && product && (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="overflow-hidden rounded-lg bg-zinc-100">
                  <Image
                    src={images[activeImage] ?? product.thumbnail}
                    alt={product.title}
                    width={600}
                    height={600}
                    className="aspect-square w-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {images.map((url, index) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => setActiveImage(index)}
                        className={`h-14 w-14 shrink-0 overflow-hidden rounded border-2 ${
                          activeImage === index
                            ? "border-zinc-900"
                            : "border-transparent"
                        }`}
                      >
                        <Image
                          src={url}
                          alt=""
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <h3 className="text-xl font-semibold text-zinc-900">{product.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {product.description}
                </p>

                <div className="mt-5 space-y-4">
                  {product.options.map((option) => (
                    <fieldset key={option.id}>
                      <legend className="mb-2 text-sm font-medium text-zinc-800">
                        {option.title}
                      </legend>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => {
                          const selected = selectedOptions[option.id] === value
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => onSelectOption(option.id, value)}
                              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                                selected
                                  ? "border-zinc-900 bg-zinc-900 text-white"
                                  : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
                              }`}
                            >
                              {value}
                            </button>
                          )
                        })}
                      </div>
                    </fieldset>
                  ))}
                </div>

                <div className="mt-5 flex items-baseline justify-between gap-3">
                  <p className="text-2xl font-semibold text-zinc-900">
                    {price
                      ? formatMoney(price.amount, price.currency_code)
                      : "Unavailable"}
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      inStock ? "text-emerald-700" : "text-red-600"
                    }`}
                  >
                    {variant
                      ? inStock
                        ? `In stock (${variant.inventory_quantity})`
                        : "Out of stock"
                      : "Select options"}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!variant || !inStock}
                  onClick={onAddToCart}
                  className="mt-4 w-full rounded-md bg-zinc-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </dialog>
  )
}
