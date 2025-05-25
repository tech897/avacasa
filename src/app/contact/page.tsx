import { Suspense } from "react"
import ContactPageContent from "./contact-content"

// Force dynamic rendering to avoid SSG issues with event handlers
export const dynamic = 'force-dynamic'

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <ContactPageContent />
    </Suspense>
  )
} 