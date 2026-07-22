"use client"

export default function ProductsError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-800">
        <h1 className="text-lg font-semibold">Could not load products</h1>
        <p className="mt-1 text-sm">Please try again in a moment.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-md bg-red-800 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    </main>
  )
}
