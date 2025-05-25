"use client"

import { useState, useEffect } from 'react'

export interface CallInquiry {
  id: string
  name: string
  phone: string
  timestamp: string
}

export function useCallInquiries() {
  const [inquiries, setInquiries] = useState<CallInquiry[]>([])
  const [loading, setLoading] = useState(true)

  // Load inquiries from localStorage on mount
  useEffect(() => {
    loadInquiries()
  }, [])

  const loadInquiries = () => {
    try {
      const stored = localStorage.getItem('callInquiries')
      if (stored) {
        const parsedInquiries = JSON.parse(stored)
        setInquiries(parsedInquiries)
      }
    } catch (error) {
      console.error('Error loading inquiries from localStorage:', error)
    } finally {
      setLoading(false)
    }
  }

  const addInquiry = (inquiry: Omit<CallInquiry, 'id'>) => {
    try {
      const newInquiry: CallInquiry = {
        id: Date.now().toString(),
        ...inquiry
      }
      const updatedInquiries = [newInquiry, ...inquiries]
      localStorage.setItem('callInquiries', JSON.stringify(updatedInquiries))
      setInquiries(updatedInquiries)
      return newInquiry
    } catch (error) {
      console.error('Error adding inquiry:', error)
      return null
    }
  }

  const removeInquiry = (id: string) => {
    try {
      const updatedInquiries = inquiries.filter(inquiry => inquiry.id !== id)
      localStorage.setItem('callInquiries', JSON.stringify(updatedInquiries))
      setInquiries(updatedInquiries)
      return true
    } catch (error) {
      console.error('Error removing inquiry:', error)
      return false
    }
  }

  const clearAllInquiries = () => {
    try {
      localStorage.removeItem('callInquiries')
      setInquiries([])
      return true
    } catch (error) {
      console.error('Error clearing inquiries:', error)
      return false
    }
  }

  const getInquiryById = (id: string) => {
    return inquiries.find(inquiry => inquiry.id === id)
  }

  const getInquiriesByPhone = (phone: string) => {
    return inquiries.filter(inquiry => inquiry.phone === phone)
  }

  const getTotalInquiries = () => {
    return inquiries.length
  }

  const getRecentInquiries = (limit: number = 10) => {
    return inquiries.slice(0, limit)
  }

  return {
    inquiries,
    loading,
    addInquiry,
    removeInquiry,
    clearAllInquiries,
    getInquiryById,
    getInquiriesByPhone,
    getTotalInquiries,
    getRecentInquiries,
    refreshInquiries: loadInquiries
  }
} 