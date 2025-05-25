"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, MapPin, Home, ArrowRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OptimizedSearch } from "@/components/search/optimized-search"

export function Hero() {
  const scrollToNextSection = () => {
    const nextSection = document.querySelector('section:nth-of-type(2)')
    if (nextSection) {
      nextSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden ">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Beautiful holiday home in scenic location"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white pt-20 pb-16">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
            Own a Dream Home in the{" "}
            <span className="text-gray-300">Hills</span>,{" "}
            <span className="text-gray-200">Coast</span> or{" "}
            <span className="text-gray-100">Countryside</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-gray-200 leading-relaxed px-4 max-w-4xl mx-auto">
            Explore curated holiday homes and managed farmlands handpicked for lifestyle and returns.
          </p>

          {/* Optimized Search Bar */}
          <div className="max-w-4xl mx-auto mb-8">
            <OptimizedSearch 
              variant="hero"
              placeholder="Search destinations, property types, or keywords..."
              showPropertyType={true}
              className="w-full"
            />
          </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12">
            <Button size="lg" className="h-12 px-6 sm:px-8 bg-gray-900 hover:bg-gray-800 transition-all duration-300 text-sm sm:text-base" asChild>
              <Link href="/properties">
                <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Explore Properties
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-6 sm:px-8 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300 text-sm sm:text-base" asChild>
              <Link href="/locations">
                View Locations
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-3xl mx-auto">
            <div className="text-center group">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1 group-hover:scale-110 transition-transform duration-300">500+</div>
              <div className="text-xs sm:text-sm text-gray-300">Properties</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1 group-hover:scale-110 transition-transform duration-300">25+</div>
              <div className="text-xs sm:text-sm text-gray-300">Locations</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1 group-hover:scale-110 transition-transform duration-300">1000+</div>
              <div className="text-xs sm:text-sm text-gray-300">Happy Owners</div>
            </div>
            <div className="text-center group">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1 group-hover:scale-110 transition-transform duration-300">5+</div>
              <div className="text-xs sm:text-sm text-gray-300">Years Experience</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <button 
        onClick={scrollToNextSection}
        className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hover:animate-none transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full p-2"
        aria-label="Scroll to next section"
      >
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/50 rounded-full flex justify-center hover:border-white/80 transition-colors duration-300">
          <div className="w-1 h-2 sm:h-3 bg-white/50 rounded-full mt-1.5 sm:mt-2 animate-pulse hover:bg-white/80 transition-colors duration-300" />
        </div>
      </button>
    </section>
  )
}