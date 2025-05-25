"use client"

import { useEffect } from 'react'
import { useTracking } from '@/hooks/use-tracking'

interface HomePageWrapperProps {
  children: React.ReactNode
}

export function HomePageWrapper({ children }: HomePageWrapperProps) {
  const { trackPageView } = useTracking()

  useEffect(() => {
    trackPageView('/')
  }, [trackPageView])

  return <>{children}</>
} 