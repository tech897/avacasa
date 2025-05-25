"use client"

import React, { Suspense } from "react"
import PropertiesPageContent from "./properties-content"

// Force dynamic rendering to avoid SSG issues with event handlers
export const dynamic = 'force-dynamic'

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <PropertiesPageContent />
    </Suspense>
  )
} 