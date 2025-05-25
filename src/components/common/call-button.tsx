"use client"

import { useState, useEffect } from "react"
import { Phone, X, CheckCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useSettings } from "@/contexts/settings-context"

interface CallButtonProps {
  variant?: "default" | "ghost" | "outline"
  size?: "sm" | "default" | "lg"
  className?: string
  showText?: boolean
}

export function CallButton({ 
  variant = "ghost", 
  size = "sm", 
  className = "",
  showText = true 
}: CallButtonProps) {
  const { settings } = useSettings()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: ""
  })
  const [errors, setErrors] = useState({
    name: "",
    phone: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Reset form when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setFormData({ name: "", phone: "" })
      setErrors({ name: "", phone: "" })
      setShowSuccess(false)
    }
  }, [isModalOpen])

  const validateForm = () => {
    const newErrors = { name: "", phone: "" }
    let isValid = true

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
      isValid = false
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
      isValid = false
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^\d{10}$/
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
      isValid = false
    } else if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Please enter a valid 10-digit phone number"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handlePhoneChange = (value: string) => {
    // Only allow digits and limit to 10 characters
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10)
    handleInputChange('phone', digitsOnly)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Track form submission start
      if (typeof window !== 'undefined') {
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'FORM_START',
            resource: 'callback_request_form',
            metadata: { formType: 'callback_request', page: window.location.pathname }
          })
        }).catch(() => {}) // Silent fail for tracking
      }

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: '', // Optional for phone inquiries
          phone: formData.phone,
          subject: 'Call Back Request',
          message: `Call back request from ${formData.name.trim()}. Phone: ${formData.phone}`,
          type: 'PHONE_INQUIRY',
          source: 'callback_request'
        })
      })

      const data = await response.json()

      if (data.success) {
        setShowSuccess(true)
        
        // Track successful form completion
        if (typeof window !== 'undefined') {
          fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'FORM_COMPLETE',
              resource: 'callback_request_form',
              metadata: { 
                formType: 'callback_request', 
                success: true,
                submissionId: data.submissionId,
                page: window.location.pathname
              }
            })
          }).catch(() => {}) // Silent fail for tracking
          
          // Track contact submission
          fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'CONTACT_SUBMIT',
              resource: 'PHONE_INQUIRY',
              metadata: { 
                contactType: 'callback_request',
                submissionId: data.submissionId,
                conversionSource: window.location.pathname
              }
            })
          }).catch(() => {}) // Silent fail for tracking
        }
        
        // Auto close after 3 seconds
        setTimeout(() => {
          setIsModalOpen(false)
        }, 3000)
      } else {
        console.error('Failed to submit call request:', data.error)
        
        // Track failed form completion
        if (typeof window !== 'undefined') {
          fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'FORM_COMPLETE',
              resource: 'callback_request_form',
              metadata: { 
                formType: 'callback_request', 
                success: false,
                error: data.error,
                page: window.location.pathname
              }
            })
          }).catch(() => {}) // Silent fail for tracking
        }
      }
    } catch (error) {
      console.error('Error submitting call request:', error)
      
      // Track error
      if (typeof window !== 'undefined') {
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'FORM_COMPLETE',
            resource: 'callback_request_form',
            metadata: { 
              formType: 'callback_request', 
              success: false,
              error: 'Network error',
              page: window.location.pathname
            }
          })
        }).catch(() => {}) // Silent fail for tracking
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.name.trim().length >= 2 && 
                     /^\d{10}$/.test(formData.phone.replace(/\D/g, ''))

  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        className={className}
        onClick={() => setIsModalOpen(true)}
      >
        <Phone className="w-4 h-4 mr-2" />
        {showText && <span className="hidden lg:inline">Call</span>}
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          {!showSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Request a Call Back
                </DialogTitle>
                <DialogDescription>
                  Please provide your details and we'll call you back shortly.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit phone number"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={errors.phone ? "border-red-500" : ""}
                    maxLength={10}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    We'll call you on this number
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Submitting...
                      </>
                    ) : (
                      "Request Call Back"
                    )}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircleIcon className="w-5 h-5" />
                  Request Submitted!
                </DialogTitle>
                <DialogDescription>
                  Thank you! We'll call you back shortly.
                </DialogDescription>
              </DialogHeader>

              <div className="text-center py-6">
                <div className="bg-green-50 rounded-lg p-6 mb-4 border border-green-200">
                  <p className="text-sm text-green-700 mb-2">
                    Your call back request has been submitted successfully.
                  </p>
                  <p className="text-sm text-green-600">
                    We'll call you on <strong>{formData.phone}</strong> shortly.
                  </p>
                </div>
                {settings.contactPhone && (
                  <p className="text-xs text-gray-500">
                    You can also call us directly at {settings.contactPhone}
                  </p>
                )}
              </div>

              <Button
                onClick={() => setIsModalOpen(false)}
                className="w-full"
              >
                Close
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
} 