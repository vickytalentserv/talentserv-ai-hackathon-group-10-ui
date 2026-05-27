import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency = 'INR'): string {
  if (currency === 'INR') {
    if (amount >= 10_000_000) {
      return `₹${(amount / 10_000_000).toFixed(2)} Cr`
    }
    if (amount >= 100_000) {
      return `₹${(amount / 100_000).toFixed(2)} L`
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}
