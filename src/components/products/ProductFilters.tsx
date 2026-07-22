"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState, useTransition } from "react"

type FilterOption = { handle: string; label: string }

type ProductFiltersProps = {
  collections: FilterOption[]
  tags: string[]
}

export default function ProductFilters({ collections, tags }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const qParam = searchParams.get("q") ?? ""
  const collection = searchParams.get("collection") ?? ""
  const tag = searchParams.get("tag") ?? ""

  const [query, setQuery] = useState(qParam)

  useEffect(() => {
    setQuery(qParam)
  }, [qParam])

  const updateParams = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())

      for (const [key, value] of Object.entries(patch)) {
        if (!value) params.delete(key)
        else params.set(key, value)
      }

      params.delete("offset")

      startTransition(() => {
        const qs = params.toString()
        router.push(qs ? `/products?${qs}` : "/products")
      })
    },
    [router, searchParams]
  )

  // Restart the debounce when filters change so it always navigates from the
  // latest URL instead of overwriting a newer collection or tag selection.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = query.trim()
      if (next === qParam) return
      updateParams({ q: next || null })
    }, 300)

    return () => window.clearTimeout(handle)
  }, [qParam, query, updateParams])

  return (
    <div
      className={`mb-6 grid gap-3 sm:grid-cols-3 ${isPending ? "opacity-70" : ""}`}
    >
      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Search
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products..."
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900 focus:ring-2"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Collection
        </span>
        <select
          value={collection}
          onChange={(event) =>
            updateParams({ collection: event.target.value || null })
          }
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900 focus:ring-2"
        >
          {collections.map((item) => (
            <option key={item.handle || "all"} value={item.handle}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Tag
        </span>
        <select
          value={tag}
          onChange={(event) => updateParams({ tag: event.target.value || null })}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none ring-zinc-900 focus:ring-2"
        >
          {tags.map((value) => (
            <option key={value || "all"} value={value}>
              {value || "All tags"}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
