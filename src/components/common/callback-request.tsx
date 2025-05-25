"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PhoneIcon, CheckCircleIcon, X } from "lucide-react"

interface CallbackRequestProps {
  propertyId?: string
  propertyTitle?: string
  onClose?: () => void
  className?: string
}

export default function CallbackRequest({ 
  propertyId, 
  propertyTitle, 
  onClose,
  className = ""
}: CallbackRequestProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    preferredTime: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [notificationType, setNotificationType] = useState<"success" | "error">("success")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const subject = propertyTitle 
        ? `Call Back Request - ${propertyTitle}`
        : "Call Back Request"
      
      const message = `
Call Back Request Details:
- Name: ${formData.name}
- Phone: ${formData.phone}
- Email: ${formData.email}
- Preferred Time: ${formData.preferredTime || "Any time"}
- Message: ${formData.message || "No additional message"}
${propertyId ? `- Property Interest: ${propertyTitle} (ID: ${propertyId})` : ""}

Please call back at the earliest convenience.
      `.trim()

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: subject,
          message: message,
          type: 'PHONE_INQUIRY',
          source: 'callback_request',
          propertyInterest: propertyId
        })
      })

      const data = await response.json()

      if (data.success) {
        setNotificationType("success")
        setNotificationMessage("Thank you! We'll call you back shortly.")
        setShowNotification(true)
        
        // Reset form
        setFormData({
          name: "",
          phone: "",
          email: "",
          preferredTime: "",
          message: ""
        })

        // Auto close after 3 seconds
        setTimeout(() => {
          setShowNotification(false)
          if (onClose) onClose()
        }, 3000)
      } else {
        setNotificationType("error")
        setNotificationMessage(data.error || "Failed to submit request. Please try again.")
        setShowNotification(true)
      }
    } catch (error) {
      console.error('Callback request error:', error)
      setNotificationType("error")
      setNotificationMessage("Failed to submit request. Please try again.")
      setShowNotification(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <PhoneIcon className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Request a Call Back</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <p className="text-gray-600 mb-6">
        Please provide your details and we'll call you back shortly.
      </p>

      {/* Success/Error Notification */}
      {showNotification && (
        <div className={`mb-4 p-4 rounded-md flex items-center ${
          notificationType === "success" 
            ? "bg-green-50 text-green-800 border border-green-200" 
            : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {notificationType === "success" && (
            <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
          )}
          <span>{notificationMessage}</span>
          <button
            onClick={() => setShowNotification(false)}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <Input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter your phone number"
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter your email address"
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Call Time
          </label>
          <Input
            id="preferredTime"
            type="text"
            value={formData.preferredTime}
            onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
            placeholder="e.g., Morning 10-12 PM, Evening 6-8 PM"
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Message
          </label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Any specific requirements or questions..."
            rows={3}
            className="w-full"
          />
        </div>

        {propertyTitle && (
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Property Interest:</strong> {propertyTitle}
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <PhoneIcon className="h-4 w-4 mr-2" />
              Request Call Back
            </div>
          )}
        </Button>
      </form>
    </div>
  )
} 