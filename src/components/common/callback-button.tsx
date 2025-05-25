"use client"

import { useState } from "react"
import { PhoneIcon } from "lucide-react"
import CallbackModal from "./callback-modal"

interface CallbackButtonProps {
  propertyId?: string
  propertyTitle?: string
  variant?: "primary" | "secondary" | "outline"
  size?: "sm" | "md" | "lg"
  className?: string
  children?: React.ReactNode
}

export default function CallbackButton({ 
  propertyId, 
  propertyTitle, 
  variant = "primary",
  size = "md",
  className = "",
  children
}: CallbackButtonProps) {
  const [showModal, setShowModal] = useState(false)

  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
  
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500"
  }

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      >
        <PhoneIcon className={`${iconSizes[size]} mr-2`} />
        {children || "Request Call Back"}
      </button>

      <CallbackModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        propertyId={propertyId}
        propertyTitle={propertyTitle}
      />
    </>
  )
} 