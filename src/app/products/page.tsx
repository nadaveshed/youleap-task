import { Suspense } from "react"
import ProductFilters from "@/components/products/ProductFilters"
import ProductGrid from "@/components/products/ProductGrid"
import ProductPagination from "@/components/products/ProductPagination"
import { PAGE_SIZE } from "@/lib/constants"
import { getProducts, getFilterOptions } from "@/lib/api"

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="h-80 animate-pulse rounded-lg bg-zinc-100"
        />
      ))}
    </div>
  )
}

type SearchParams = Promise<Record<string, string | undefined>>

async function ProductsContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const q = params.q ?? undefined
  const collection = params.collection ?? undefined
  const tag = params.tag ?? undefined
  const rawOffset = Number(params.offset ?? 0)
  const offset = Number.isFinite(rawOffset) ? Math.max(0, Math.floor(rawOffset)) : 0

  const [data, filterOptions] = await Promise.all([
    getProducts({ limit: PAGE_SIZE, offset, q, collection, tag }),
    getFilterOptions(),
  ])

  return (
    <>
      <div className="mb-2 flex items-end justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900">Products</h1>
        <p className="text-sm text-zinc-500">
          {data.count} result{data.count === 1 ? "" : "s"}
        </p>
      </div>

      <ProductFilters
        collections={filterOptions.collections}
        tags={filterOptions.tags}
      />

      <ProductGrid products={data.products} />

      {data.count > PAGE_SIZE && (
        <ProductPagination count={data.count} />
      )}
    </>
  )
}

export default function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  return (
    <main className="mx-auto max-w-7xl p-6">
      <Suspense
        fallback={
          <>
            <div className="mb-2 flex items-end justify-between gap-4">
              <h1 className="text-2xl font-bold text-zinc-900">Products</h1>
              <p className="text-sm text-zinc-500">Loading…</p>
            </div>
            <div className="mb-6 grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-md bg-zinc-100" />
              ))}
            </div>
            <GridSkeleton />
          </>
        }
      >
        <ProductsContent searchParams={searchParams} />
      </Suspense>
    </main>
  )
}
