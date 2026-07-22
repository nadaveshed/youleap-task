import type { Product, ProductVariant } from "@/types/product"

/**
 * Mock data encodes multi-option variants as titles joined by " - "
 * in the same order as `product.options` (e.g. "500ml - White").
 */
export function buildVariantTitle(
  product: Product,
  selected: Record<string, string>
): string {
  return product.options.map((option) => selected[option.id]).join(" - ")
}

export function findVariant(
  product: Product,
  selected: Record<string, string>
): ProductVariant | undefined {
  const title = buildVariantTitle(product, selected)
  return product.variants.find((variant) => variant.title === title)
}

export function getDefaultOptionSelection(product: Product): Record<string, string> {
  const preferred =
    product.variants.find((variant) => variant.inventory_quantity > 0) ??
    product.variants[0]

  if (!preferred) return {}

  const parts = preferred.title.split(" - ")
  const selected: Record<string, string> = {}

  product.options.forEach((option, index) => {
    selected[option.id] = parts[index] ?? option.values[0] ?? ""
  })

  return selected
}

export function isInStock(variant: ProductVariant | undefined) {
  return (variant?.inventory_quantity ?? 0) > 0
}

export function getStartingPrice(product: Product): ProductVariant["prices"][number] | null {
  const amounts = product.variants.flatMap((v) => v.prices)
  if (amounts.length === 0) return null
  return amounts.reduce((min, price) => (price.amount < min.amount ? price : min))
}
