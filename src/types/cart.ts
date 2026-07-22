export type CartLineItem = {
  productId: string
  variantId: string
  title: string
  variantTitle: string
  thumbnail: string
  unitPrice: number
  currencyCode: string
  quantity: number
  maxQuantity: number
}

export type CheckoutFormData = {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
}
