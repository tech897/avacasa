"use client"

import { useState } from "react"
import CallbackRequest from "./callback-request"

interface CallbackModalProps {
  isOpen: boolean
  onClose: () => void
  propertyId?: string
  propertyTitle?: string
}

export default function CallbackModal({ 
  isOpen, 
  onClose, 
  propertyId, 
  propertyTitle 
}: CallbackModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 xl:w-2/5 shadow-lg rounded-md bg-white">
        <CallbackRequest
          propertyId={propertyId}
          propertyTitle={propertyTitle}
          onClose={onClose}
          className="shadow-none p-0"
        />
      </div>
    </div>
  )
} 