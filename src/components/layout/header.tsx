"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone, Mail, ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CallButton } from "@/components/common/call-button";
import { OptimizedSearch } from "@/components/search/optimized-search";
import { useAuth } from "@/contexts/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";
import { UserAvatar } from "@/components/auth/user-avatar";

const navigation = [
  { name: "Home", href: "/" },
  { name: "All Properties", href: "/properties" },
  { name: "Forums", href: "/forums" },
  { name: "Blogs", href: "/blog" },
  { name: "About Us", href: "/about" },
  { name: "Resources", href: "/resources" },
];

const propertyTypes = [
  { name: "Holiday Homes", href: "/properties?type=holiday-home" },
  { name: "Managed Farmlands", href: "/properties?type=managed-farmland" },
  { name: "Plots", href: "/properties?type=plot" },
  { name: "Villas", href: "/properties?type=villa" },
  { name: "Apartments", href: "/properties?type=apartment" },
  { name: "Residential Plots", href: "/properties?type=residential-plot" },
];

interface HeaderProps {
  showSearch?: boolean;
}

export function Header({ showSearch = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup">(
    "signin"
  );
  const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false);

  const { user, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openAuthModal = (tab: "signin" | "signup") => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  return (
    <>
      {/* Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center group-hover:bg-orange-600 transition-colors duration-300">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
                Avacasa
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-300 relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}

              {/* Property Type Dropdown */}
              <div className="relative">
                <button
                  className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 font-medium transition-colors duration-300"
                  onClick={() => setPropertyDropdownOpen(!propertyDropdownOpen)}
                >
                  <span>Property Type</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {propertyDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
                    {propertyTypes.map((type) => (
                      <Link
                        key={type.name}
                        href={type.href}
                        className="block px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setPropertyDropdownOpen(false)}
                      >
                        {type.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ) : user ? (
                <UserAvatar />
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    onClick={() => openAuthModal("signin")}
                    className="text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Login / Register
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300"
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
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-4 space-y-3">
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

              {/* Mobile Property Types */}
              <div className="border-t border-gray-100 pt-3">
                <div className="text-sm font-medium text-gray-500 mb-2">
                  Property Types
                </div>
                {propertyTypes.map((type) => (
                  <Link
                    key={type.name}
                    href={type.href}
                    className="block text-gray-700 hover:text-gray-900 py-2 pl-4 transition-colors duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {type.name}
                  </Link>
                ))}
              </div>

              {/* Mobile Auth */}
              <div className="border-t border-gray-100 pt-3">
                {loading ? (
                  <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                ) : user ? (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {user.name
                        ?.split(" ")
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "U"}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user.name}
                    </span>
                  </div>
                ) : (
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
                    onClick={() => {
                      openAuthModal("signin");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Login / Register
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16"></div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </>
  );
}
