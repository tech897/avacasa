"use client"

import { useState, useEffect } from "react"
import { useCallInquiries } from "@/hooks/use-call-inquiries"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Phone, 
  Search, 
  Trash2, 
  Download, 
  Calendar,
  User,
  RefreshCw
} from "lucide-react"
import ContactSubmissions from '@/components/admin/contact-submissions'

export default function InquiriesPage() {
  const { 
    inquiries, 
    loading, 
    removeInquiry, 
    clearAllInquiries, 
    getTotalInquiries,
    refreshInquiries 
  } = useCallInquiries()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredInquiries, setFilteredInquiries] = useState(inquiries)

  // Filter inquiries based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredInquiries(inquiries)
    } else {
      const filtered = inquiries.filter(inquiry => 
        inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.phone.includes(searchTerm)
      )
      setFilteredInquiries(filtered)
    }
  }, [inquiries, searchTerm])

  const handleDeleteInquiry = (id: string) => {
    if (confirm("Are you sure you want to delete this inquiry?")) {
      removeInquiry(id)
    }
  }

  const handleClearAll = () => {
    if (confirm("Are you sure you want to delete all inquiries? This action cannot be undone.")) {
      clearAllInquiries()
    }
  }

  const handleExportData = () => {
    const dataStr = JSON.stringify(inquiries, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `call-inquiries-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">  
      <ContactSubmissions />
    </div>
  )
} 