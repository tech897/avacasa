"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CallButton } from "@/components/common/call-button"
import { OptimizedSearch } from "@/components/search/optimized-search"
import { useAuth } from "@/contexts/auth-context"
import { AuthModal } from "@/components/auth/auth-modal"
import { UserAvatar } from "@/components/auth/user-avatar"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Properties", href: "/properties" },
  { name: "Locations", href: "/locations" },
  { name: "About", href: "/about" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
]

interface HeaderProps {
  showSearch?: boolean
}

export function Header({ showSearch = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin')
  
  const { user, loading } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const openAuthModal = (tab: 'signin' | 'signup') => {
    setAuthModalTab(tab)
    setAuthModalOpen(true)
  }

  return (
    <>
      {/* Glass Navigation Bar */}
      <header className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
        isScrolled ? 'w-[95%] max-w-6xl' : 'w-[90%] max-w-5xl'
      }`}>
        <div className={`bg-white/80 backdrop-blur-md rounded-full border border-white/20 shadow-lg transition-all duration-500 ${
          isScrolled ? 'shadow-xl bg-white/90' : ''
        }`}>
          <div className="flex items-center justify-between px-6 py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center group-hover:bg-gray-800 transition-colors duration-300">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors duration-300 hidden sm:block">
                Avacasa
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-300 relative group text-sm"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            {/* Search Bar (when enabled) */}
            {showSearch && (
              <div className="hidden md:block flex-1 max-w-md mx-4">
                <OptimizedSearch 
                  variant="header"
                  placeholder="Search properties..."
                  showPropertyType={false}
                  className="w-full"
                />
              </div>
            )}

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center space-x-3">
              <CallButton 
                variant="ghost" 
                size="sm" 
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/50"
                showText={true}
              />
              
              {loading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ) : user ? (
                <UserAvatar />
              ) : (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => openAuthModal('signin')}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    Sign In
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => openAuthModal('signup')}
                    className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-6"
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-full text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 transition-all duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 bg-white/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            <div className="px-6 py-4 space-y-3">
              {/* Mobile Search */}
              {showSearch && (
                <div className="pb-3 border-b border-gray-200/50">
                  <OptimizedSearch 
                    variant="page"
                    placeholder="Search properties..."
                    showPropertyType={false}
                    className="w-full"
                  />
                </div>
              )}
              
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-gray-700 hover:text-gray-900 font-medium py-2 transition-colors duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200/50 space-y-3">
                <CallButton 
                  variant="outline" 
                  className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full"
                  showText={true}
                />
                
                {loading ? (
                  <div className="w-full h-10 bg-gray-200 rounded-full animate-pulse"></div>
                ) : user ? (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-full">
                    <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {user.name?.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  </div>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full"
                      onClick={() => {
                        openAuthModal('signin')
                        setMobileMenuOpen(false)
                      }}
                    >
                      Sign In
                    </Button>
                    <Button 
                      className="w-full bg-gray-900 hover:bg-gray-800 rounded-full"
                      onClick={() => {
                        openAuthModal('signup')
                        setMobileMenuOpen(false)
                      }}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>


      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </>
  )
} 