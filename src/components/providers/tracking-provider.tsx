"use client"

import { createContext, useContext, useEffect, ReactNode, Suspense } from 'react'
import { useTracking } from '@/hooks/use-tracking'
import { usePathname, useSearchParams } from 'next/navigation'

interface TrackingContextType {
  trackEvent: (action: string, resource?: string, metadata?: Record<string, any>) => void
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined)

interface TrackingProviderProps {
  children: ReactNode
}

function TrackingProviderContent({ children }: TrackingProviderProps) {
  const {
    track,
    trackPageView,
    trackButtonClick,
    trackFormStart,
    trackFormComplete,
    trackSearch,
    trackPropertyView,
    trackLocationView,
    trackContact,
    trackEmailSubscribe
  } = useTracking()
  
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Track page views automatically
  useEffect(() => {
    // Skip tracking for admin routes - they have their own tracking logic
    if (pathname.startsWith('/admin')) {
      return
    }
    
    // Track page view with search parameters
    const fullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    trackPageView(fullPath)
    
    // Track specific page types
    if (pathname.startsWith('/properties/')) {
      const propertySlug = pathname.split('/').pop()
      if (propertySlug && propertySlug !== 'properties') {
        // This will be enhanced when we have property data
        trackPropertyView(propertySlug, `Property: ${propertySlug}`)
      }
    } else if (pathname.startsWith('/locations/')) {
      const locationSlug = pathname.split('/').pop()
      if (locationSlug && locationSlug !== 'locations') {
        trackLocationView(locationSlug, `Location: ${locationSlug}`)
      }
    } else if (pathname.startsWith('/blog/')) {
      const blogSlug = pathname.split('/').pop()
      if (blogSlug && blogSlug !== 'blog') {
        track('BLOG_VIEW', blogSlug, { blogSlug })
      }
    }
  }, [pathname, searchParams, trackPageView, trackPropertyView, trackLocationView, track])

  // Global click tracking
  useEffect(() => {
    // Skip tracking for admin routes - they have their own tracking logic
    if (pathname.startsWith('/admin')) {
      return
    }
    
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      // Track button clicks
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.tagName === 'BUTTON' ? target : target.closest('button')
        const buttonText = button?.textContent?.trim() || 'Unknown Button'
        const buttonId = button?.id || button?.className || 'unknown'
        
        trackButtonClick(buttonText, pathname)
      }
      
      // Track link clicks
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.tagName === 'A' ? target as HTMLAnchorElement : target.closest('a')
        const href = link?.href
        const linkText = link?.textContent?.trim() || 'Unknown Link'
        
        if (href) {
          track('LINK_CLICK', href, {
            linkText,
            currentPage: pathname,
            isExternal: !href.includes(window.location.hostname)
          })
        }
      }
      
      // Track CTA clicks
      if (target.closest('[data-track="cta"]')) {
        const ctaElement = target.closest('[data-track="cta"]') as HTMLElement
        const ctaName = ctaElement.dataset.ctaName || 'Unknown CTA'
        
        track('CTA_CLICK', ctaName, {
          currentPage: pathname,
          ctaPosition: ctaElement.dataset.ctaPosition || 'unknown'
        })
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [pathname, trackButtonClick, track])

  // Form tracking
  useEffect(() => {
    // Skip tracking for admin routes - they have their own tracking logic
    if (pathname.startsWith('/admin')) {
      return
    }
    
    const handleFormSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement
      const formName = form.name || form.id || form.className || 'Unknown Form'
      
      // Extract safe form data instead of passing the form element
      const formData = {
        formName,
        formAction: form.action || undefined,
        formMethod: form.method || undefined,
        formId: form.id || undefined,
        formClassName: form.className || undefined
      }
      
      // Pass the safe form data as metadata
      track('FORM_COMPLETE', formName, formData)
    }

    const handleFormFocus = (event: Event) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        const form = target.closest('form')
        if (form) {
          const formName = form.name || form.id || form.className || 'Unknown Form'
          
          // Extract safe form data
          const formData = {
            formName,
            fieldType: (target as HTMLInputElement).type || target.tagName,
            fieldName: (target as HTMLInputElement).name || undefined,
            fieldId: target.id || undefined
          }
          
          // Pass the safe form data as metadata
          track('FORM_START', formName, formData)
        }
      }
    }

    document.addEventListener('submit', handleFormSubmit)
    document.addEventListener('focusin', handleFormFocus)
    
    return () => {
      document.removeEventListener('submit', handleFormSubmit)
      document.removeEventListener('focusin', handleFormFocus)
    }
  }, [track])

  // Search tracking
  useEffect(() => {
    const searchQuery = searchParams.get('search') || searchParams.get('q')
    if (searchQuery) {
      const filters = {
        location: searchParams.get('location'),
        type: searchParams.get('type'),
        minPrice: searchParams.get('minPrice'),
        maxPrice: searchParams.get('maxPrice'),
        bedrooms: searchParams.get('bedrooms')
      }
      
      // Remove null values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== null)
      )
      
      trackSearch(searchQuery, cleanFilters)
    }
  }, [searchParams, trackSearch])

  const trackEvent = (action: string, resource?: string, metadata?: Record<string, any>) => {
    track(action, resource, metadata)
  }

  return (
    <TrackingContext.Provider value={{ trackEvent }}>
      {children}
    </TrackingContext.Provider>
  )
}

export function TrackingProvider({ children }: TrackingProviderProps) {
  return (
    <Suspense fallback={<div>{children}</div>}>
      <TrackingProviderContent>
        {children}
      </TrackingProviderContent>
    </Suspense>
  )
}

export function useTrackingContext() {
  const context = useContext(TrackingContext)
  if (context === undefined) {
    throw new Error('useTrackingContext must be used within a TrackingProvider')
  }
  return context
} 