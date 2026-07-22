"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTransition } from "react"
import { PAGE_SIZE } from "@/lib/constants"

type ProductPaginationProps = {
  count: number
  loading?: boolean
}

export default function ProductPagination({
  count,
  loading = false,
}: ProductPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const rawOffset = Number(searchParams.get("offset") ?? 0)
  const offset = Number.isFinite(rawOffset) ? Math.max(0, Math.floor(rawOffset)) : 0
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))
  const currentPage = Math.min(Math.floor(offset / PAGE_SIZE) + 1, totalPages)
  const rangeStart = count === 0 ? 0 : offset + 1
  const rangeEnd = Math.min(offset + PAGE_SIZE, count)
  const hasPrev = offset > 0
  const hasNext = offset + PAGE_SIZE < count
  const disabled = loading || isPending

  if (count <= PAGE_SIZE) return null

  function goToPage(nextOffset: number) {
    const params = new URLSearchParams(searchParams.toString())

    if (nextOffset <= 0) params.delete("offset")
    else params.set("offset", String(nextOffset))

    startTransition(() => {
      const qs = params.toString()
      router.push(qs ? `/products?${qs}` : "/products")
      window.scrollTo({ top: 0, behavior: "smooth" })
    })
  }

  return (
    <nav
      aria-label="Product pagination"
      className={`mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between ${
        disabled ? "opacity-70" : ""
      }`}
    >
      <p className="text-sm text-zinc-500">
        Showing {rangeStart}–{rangeEnd} of {count}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!hasPrev || disabled}
          onClick={() => goToPage(offset - PAGE_SIZE)}
          className="inline-flex items-center gap-1 rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <span className="min-w-24 text-center text-sm text-zinc-600">
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          disabled={!hasNext || disabled}
          onClick={() => goToPage(offset + PAGE_SIZE)}
          className="inline-flex items-center gap-1 rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  )
}
