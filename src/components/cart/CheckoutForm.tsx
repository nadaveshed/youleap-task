"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { z } from "zod"
import type { CheckoutFormData } from "@/types/cart"

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  email: z.email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number is required")
    .regex(/^[0-9+\-\s()]+$/, "Enter a valid phone number")
    .refine(
      (value) => value.replace(/\D/g, "").length >= 7,
      "Enter a valid phone number"
    ),
  address: z.string().trim().min(3, "Address is required"),
  city: z.string().trim().min(2, "City is required"),
  postalCode: z.string().trim().min(3, "Postal code is required"),
  country: z.string().trim().min(2, "Country is required"),
})

type FieldErrors = Partial<Record<keyof CheckoutFormData, string>>

const emptyForm: CheckoutFormData = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  country: "Israel",
}

type CheckoutFormProps = {
  onBack: () => void
  onSuccess: (data: CheckoutFormData) => void
}

export default function CheckoutForm({ onBack, onSuccess }: CheckoutFormProps) {
  const [form, setForm] = useState<CheckoutFormData>(emptyForm)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const submitTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (submitTimerRef.current !== null) {
        window.clearTimeout(submitTimerRef.current)
      }
    }
  }, [])

  const fields = useMemo(
    () =>
      [
        { key: "fullName", label: "Full name", type: "text", autoComplete: "name" },
        { key: "email", label: "Email", type: "email", autoComplete: "email" },
        { key: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
        { key: "address", label: "Address", type: "text", autoComplete: "street-address" },
        { key: "city", label: "City", type: "text", autoComplete: "address-level2" },
        { key: "postalCode", label: "Postal code", type: "text", autoComplete: "postal-code" },
        { key: "country", label: "Country", type: "text", autoComplete: "country-name" },
      ] as const,
    []
  )

  function updateField<K extends keyof CheckoutFormData>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const result = checkoutSchema.safeParse(form)

    if (!result.success) {
      const next: FieldErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0]
        if (typeof key === "string" && !(key in next)) {
          next[key as keyof CheckoutFormData] = issue.message
        }
      }
      setErrors(next)
      return
    }

    setSubmitting(true)
    // Simulated checkout — no backend required by the assignment.
    submitTimerRef.current = window.setTimeout(() => {
      submitTimerRef.current = null
      onSuccess(result.data)
      setSubmitting(false)
    }, 350)
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col" noValidate>
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="text-sm text-zinc-500 hover:text-zinc-900"
        >
          ← Back to cart
        </button>

        <h3 className="text-base font-semibold text-zinc-900">Shipping details</h3>

        {fields.map((field) => (
          <label key={field.key} className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
              {field.label}
            </span>
            <input
              type={field.type}
              autoComplete={field.autoComplete}
              value={form[field.key]}
              onChange={(event) => updateField(field.key, event.target.value)}
              className={`w-full rounded-md border px-3 py-2 text-sm outline-none ring-zinc-900 focus:ring-2 ${
                errors[field.key] ? "border-red-400" : "border-zinc-300"
              }`}
            />
            {errors[field.key] && (
              <span className="mt-1 block text-xs text-red-600">{errors[field.key]}</span>
            )}
          </label>
        ))}
      </div>

      <div className="border-t border-zinc-200 px-5 py-4">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-zinc-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:bg-zinc-400"
        >
          {submitting ? "Placing order…" : "Place order"}
        </button>
      </div>
    </form>
  )
}
