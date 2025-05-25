import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function generateWhatsAppLink(
  phoneNumber: string,
  message: string
): string {
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat('en-IN').format(num)
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getWhatsAppLink(phone: string, message?: string) {
  const encodedMessage = message ? encodeURIComponent(message) : ''
  return `https://wa.me/${phone.replace(/[^\d]/g, '')}${encodedMessage ? `?text=${encodedMessage}` : ''}`
}

// Smooth scrolling utilities
export function smoothScrollTo(elementId: string, offset: number = 0) {
  const element = document.getElementById(elementId)
  if (element) {
    const elementPosition = element.offsetTop - offset
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    })
  }
}

export function smoothScrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

export function smoothScrollToElement(element: Element, offset: number = 80) {
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset - offset
  window.scrollTo({
    top: elementPosition,
    behavior: 'smooth'
  })
} 