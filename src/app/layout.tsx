import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"
import CartDrawer from "@/components/cart/CartDrawer"
import { CartProvider } from "@/store/cart"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata = {
  title: "Youleap Store — Dev Test",
  description: "Browse and shop products from the Youleap storefront",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-zinc-50 font-sans text-zinc-900 antialiased">
        <CartProvider>
          <Header />
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}
