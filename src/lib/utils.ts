import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency = 'INR'): string {
  if (currency !== 'INR') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

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

export function getMinListingPrice(listingStatus: 'buy' | 'rent'): number {
  return listingStatus === 'rent' ? 3_000 : 1_00_000
}

export function isValidListingPrice(price: number, listingStatus: 'buy' | 'rent'): boolean {
  return Number.isFinite(price) && price >= getMinListingPrice(listingStatus)
}

export function formatListingPrice(
  price: number,
  listingStatus: 'buy' | 'rent',
  currency = 'INR',
): string {
  if (!isValidListingPrice(price, listingStatus)) {
    return 'Price on request'
  }

  return listingStatus === 'rent'
    ? `${formatPrice(price, currency)}/mo`
    : formatPrice(price, currency)
}
