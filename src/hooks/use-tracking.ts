"use client"

import { useCallback, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { usePathname } from 'next/navigation'

// Function to safely serialize metadata and avoid circular references
const safeSerialize = (obj: any): any => {
  const seen = new WeakSet()
  
  const serialize = (value: any): any => {
    // Handle null and primitive values
    if (value === null || value === undefined) {
      return value
    }
    
    if (typeof value !== 'object') {
      return value
    }
    
    // Handle DOM elements and other objects that can't be serialized
    if (value instanceof HTMLElement) {
      return {
        tagName: value.tagName || 'Unknown',
        id: value.id || undefined,
        className: value.className || undefined,
        type: 'HTMLElement'
      }
    }
    
    // Handle other Node types
    if (value instanceof Node) {
      return {
        nodeType: value.nodeType,
        nodeName: value.nodeName || 'Unknown',
        type: 'Node'
      }
    }
    
    // Handle Event objects
    if (value instanceof Event) {
      return {
        type: value.type,
        target: value.target ? serialize(value.target) : undefined,
        eventType: 'Event'
      }
    }
    
    // Handle Functions
    if (typeof value === 'function') {
      return {
        type: 'Function',
        name: value.name || 'anonymous'
      }
    }
    
    // Handle circular references
    if (seen.has(value)) {
      return { type: 'CircularReference' }
    }
    
    seen.add(value)
    
    try {
      // Handle Arrays
      if (Array.isArray(value)) {
        return value.map(item => serialize(item))
      }
      
      // Handle Date objects
      if (value instanceof Date) {
        return value.toISOString()
      }
      
      // Handle RegExp objects
      if (value instanceof RegExp) {
        return {
          type: 'RegExp',
          source: value.source,
          flags: value.flags
        }
      }
      
      // Handle Error objects
      if (value instanceof Error) {
        return {
          type: 'Error',
          name: value.name,
          message: value.message,
          stack: value.stack
        }
      }
      
      // Handle plain objects
      const result: any = {}
      for (const [key, val] of Object.entries(value)) {
        // Skip properties that might cause issues
        if (key.startsWith('__react') || key.startsWith('_react') || key.includes('Fiber')) {
          continue
        }
        
        try {
          result[key] = serialize(val)
        } catch (error) {
          // If serializing a property fails, skip it
          result[key] = { type: 'SerializationError', error: 'Failed to serialize' }
        }
      }
      return result
    } catch (error) {
      return { type: 'SerializationError', error: 'Failed to serialize object' }
    }
  }
  
  return serialize(obj)
}

export function useTracking() {
  const { user } = useAuth()
  const pathname = usePathname()
  const startTimeRef = useRef<number>(Date.now())
  const scrollDepthRef = useRef<number>(0)
  const lastScrollRef = useRef<number>(0)

  const track = useCallback(async (
    action: string,
    resource?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      // Safely serialize metadata to avoid circular references
      const safeMetadata = safeSerialize({
        ...metadata,
        userId: user?.id,
        userEmail: user?.email,
        page: window.location.pathname,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        sessionId: getSessionId()
      })

      await fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          resource,
          metadata: safeMetadata
        })
      })
    } catch (error) {
      console.error('Tracking failed:', error)
    }
  }, [user])

  const getSessionId = useCallback(() => {
    let sessionId = sessionStorage.getItem('tracking-session-id')
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
      sessionStorage.setItem('tracking-session-id', sessionId)
    }
    return sessionId
  }, [])

  const trackPageView = useCallback((page?: string) => {
    const currentPage = page || window.location.pathname
    startTimeRef.current = Date.now()
    scrollDepthRef.current = 0
    
    track('PAGE_VIEW', currentPage, {
      title: document.title,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })
  }, [track])

  const trackPageExit = useCallback((page?: string) => {
    const timeSpent = Date.now() - startTimeRef.current
    const currentPage = page || window.location.pathname
    
    track('PAGE_EXIT', currentPage, {
      timeSpent,
      maxScrollDepth: scrollDepthRef.current,
      exitType: 'navigation'
    })
  }, [track])

  const trackScrollDepth = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercent = Math.round((scrollTop / documentHeight) * 100)
    
    if (scrollPercent > scrollDepthRef.current) {
      scrollDepthRef.current = scrollPercent
      
      // Track milestone scroll depths
      if (scrollPercent >= 25 && lastScrollRef.current < 25) {
        track('SCROLL_DEPTH', window.location.pathname, { depth: 25 })
      } else if (scrollPercent >= 50 && lastScrollRef.current < 50) {
        track('SCROLL_DEPTH', window.location.pathname, { depth: 50 })
      } else if (scrollPercent >= 75 && lastScrollRef.current < 75) {
        track('SCROLL_DEPTH', window.location.pathname, { depth: 75 })
      } else if (scrollPercent >= 90 && lastScrollRef.current < 90) {
        track('SCROLL_DEPTH', window.location.pathname, { depth: 90 })
      }
      
      lastScrollRef.current = scrollPercent
    }
  }, [track])

  const trackPropertyView = useCallback((propertyId: string, propertyTitle?: string) => {
    track('PROPERTY_VIEW', propertyId, {
      propertyTitle,
      viewStartTime: Date.now()
    })
  }, [track])

  const trackPropertyInquiry = useCallback((propertyId: string, inquiryType?: string) => {
    track('PROPERTY_INQUIRY', propertyId, {
      inquiryType,
      conversionPath: getConversionPath()
    })
  }, [track])

  const trackSearch = useCallback((query: string, filters?: Record<string, any>, results?: number) => {
    track('PROPERTY_SEARCH', undefined, {
      query,
      filters,
      results,
      searchTime: Date.now()
    })
  }, [track])

  const trackLocationView = useCallback((locationId: string, locationName?: string) => {
    track('LOCATION_VIEW', locationId, {
      locationName
    })
  }, [track])

  const trackBlogView = useCallback((blogId: string, blogTitle?: string) => {
    track('BLOG_VIEW', blogId, {
      blogTitle
    })
  }, [track])

  const trackDownload = useCallback((resource: string, fileName?: string) => {
    track('DOWNLOAD', resource, {
      fileName,
      downloadSource: window.location.pathname
    })
  }, [track])

  const trackContact = useCallback((contactType: string, metadata?: Record<string, any>) => {
    track('CONTACT_SUBMIT', contactType, {
      ...metadata,
      conversionPath: getConversionPath()
    })
  }, [track])

  const trackButtonClick = useCallback((buttonName: string, location: string) => {
    track('BUTTON_CLICK', buttonName, {
      location,
      page: window.location.pathname
    })
  }, [track])

  const trackFormStart = useCallback((formName: string) => {
    track('FORM_START', formName, {
      page: window.location.pathname
    })
  }, [track])

  const trackFormComplete = useCallback((formName: string, success: boolean) => {
    track('FORM_COMPLETE', formName, {
      success,
      page: window.location.pathname
    })
  }, [track])

  const trackUserRegistration = useCallback((method: string) => {
    track('USER_REGISTER', method, {
      registrationSource: window.location.pathname
    })
  }, [track])

  const trackUserLogin = useCallback((method: string) => {
    track('USER_LOGIN', method, {
      loginSource: window.location.pathname
    })
  }, [track])

  const trackEmailSubscribe = useCallback((source: string) => {
    track('EMAIL_SUBSCRIBE', source, {
      subscriptionSource: window.location.pathname
    })
  }, [track])

  const getConversionPath = useCallback(() => {
    const path = sessionStorage.getItem('user-journey') || '[]'
    try {
      return JSON.parse(path)
    } catch {
      return []
    }
  }, [])

  const updateUserJourney = useCallback((page: string) => {
    const journey = getConversionPath()
    journey.push({
      page,
      timestamp: Date.now(),
      title: document.title
    })
    
    // Keep only last 20 pages
    if (journey.length > 20) {
      journey.shift()
    }
    
    sessionStorage.setItem('user-journey', JSON.stringify(journey))
  }, [getConversionPath])

  // Auto-track page views and user journey
  useEffect(() => {
    trackPageView()
    updateUserJourney(pathname)
    
    // Track scroll depth
    const handleScroll = () => trackScrollDepth()
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Track page exit
    const handleBeforeUnload = () => trackPageExit()
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      trackPageExit()
    }
  }, [pathname, trackPageView, trackPageExit, trackScrollDepth, updateUserJourney])

  return {
    track,
    trackPageView,
    trackPageExit,
    trackScrollDepth,
    trackPropertyView,
    trackPropertyInquiry,
    trackSearch,
    trackLocationView,
    trackBlogView,
    trackDownload,
    trackContact,
    trackButtonClick,
    trackFormStart,
    trackFormComplete,
    trackUserRegistration,
    trackUserLogin,
    trackEmailSubscribe,
    getConversionPath
  }
} 