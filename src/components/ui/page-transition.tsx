"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    // Smooth scroll to top on route change
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [pathname])

  return (
    <div className="transition-opacity duration-300 ease-in-out">
      {children}
    </div>
  )
} 