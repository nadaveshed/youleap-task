export function formatMoney(amount: number, currencyCode = "ILS") {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: currencyCode,
  }).format(amount / 100)
}
