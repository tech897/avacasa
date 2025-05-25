"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { User, LogOut, Heart } from 'lucide-react'
import Link from 'next/link'

export function UserAvatar() {
  const { user, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  if (!user) return null

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || 'User'}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
            {getInitials(user.name || 'U')}
          </div>
        )}
        <span className="hidden md:block text-sm font-medium text-gray-700">
          {user.name?.split(' ')[0] || 'User'}
        </span>
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center text-lg font-medium">
                    {getInitials(user.name || 'U')}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <Link 
                href="/profile" 
                className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Profile</span>
              </Link>
              
              <Link 
                href="/favorites" 
                className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                <Heart className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Favorites</span>
              </Link>
              
              <hr className="my-2" />
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-red-50 rounded-md transition-colors text-red-600"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 