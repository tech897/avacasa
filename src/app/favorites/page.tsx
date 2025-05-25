import { Suspense } from "react"
import FavoritesPageContent from "./favorites-content"

// Force dynamic rendering to avoid SSG issues with event handlers
export const dynamic = 'force-dynamic'

export default function FavoritesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <FavoritesPageContent />
    </Suspense>
  )
} 