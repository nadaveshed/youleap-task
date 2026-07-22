import type { Product, ProductsResponse, ProductResponse } from "@/types/product"

export type ProductsQuery = {
  limit?: number
  offset?: number
  q?: string
  collection?: string
  tag?: string
}

export type FilterOptions = {
  collections: { handle: string; label: string }[]
  tags: string[]
}

function toSearchParams(query: ProductsQuery = {}) {
  const params = new URLSearchParams()

  if (query.limit != null) params.set("limit", String(query.limit))
  if (query.offset != null) params.set("offset", String(query.offset))
  if (query.q) params.set("q", query.q)
  if (query.collection) params.set("collection", query.collection)
  if (query.tag) params.set("tag", query.tag)

  return params
}

function getBaseUrl() {
  if (typeof window !== "undefined") return ""

  const configuredUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_BASE_URL
  if (configuredUrl) return configuredUrl.replace(/\/$/, "")

  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL
  if (vercelUrl) return `https://${vercelUrl}`

  return `http://localhost:${process.env.PORT ?? "3000"}`
}

type ProductsRequestOptions = {
  revalidate?: number
}

export async function getProducts(
  query: ProductsQuery = {},
  options: ProductsRequestOptions = {}
): Promise<ProductsResponse> {
  const params = toSearchParams(query)
  const qs = params.toString()
  const url = `${getBaseUrl()}/api/products${qs ? `?${qs}` : ""}`

  const res = await fetch(
    url,
    options.revalidate == null
      ? { cache: "no-store" }
      : { next: { revalidate: options.revalidate } }
  )
  if (!res.ok) {
    throw new Error(`Failed to fetch products (${res.status})`)
  }

  return res.json()
}

export async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`${getBaseUrl()}/api/products/${id}`, { cache: "no-store" })
  if (!res.ok) {
    throw new Error(`Failed to fetch product ${id} (${res.status})`)
  }

  const data: ProductResponse = await res.json()
  return data.product
}

/**
 * Fetches all products (unpaginated) and derives unique collection/tag values.
 * In production this would be a dedicated endpoint; here we reuse the products list.
 */
export async function getFilterOptions(): Promise<FilterOptions> {
  const data = await getProducts(
    { limit: Number.MAX_SAFE_INTEGER, offset: 0 },
    { revalidate: 3600 }
  )

  const collectionMap = new Map<string, string>()
  const tagSet = new Set<string>()

  for (const product of data.products) {
    if (product.collection?.handle) {
      collectionMap.set(product.collection.handle, product.collection.title)
    }
    for (const tag of product.tags) {
      if (tag.value) tagSet.add(tag.value)
    }
  }

  const collections = [
    { handle: "", label: "All collections" },
    ...Array.from(collectionMap, ([handle, label]) => ({ handle, label })).sort((a, b) =>
      a.label.localeCompare(b.label)
    ),
  ]

  const tags = ["", ...Array.from(tagSet).sort()]

  return { collections, tags }
}
