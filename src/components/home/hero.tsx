"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Home, ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedSearch } from "@/components/search/optimized-search";

export function Hero() {
  const scrollToNextSection = () => {
    const nextSection = document.querySelector("section:nth-of-type(2)");
    if (nextSection) {
      nextSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <section className="relative h-[70vh] min-h-[600px] max-h-[800px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Beautiful holiday home in scenic location"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
            Find Your Dream Holiday Home
          </h1>

          <p className="text-lg md:text-xl mb-8 text-gray-100 leading-relaxed max-w-3xl mx-auto">
            Explore curated holiday homes and managed farmlands handpicked for
            lifestyle and returns.
          </p>

          <p className="text-base md:text-lg mb-10 text-white font-medium">
            Seamless ownership. Expert advisory. Exceptional experiences
          </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto mb-12">
            <OptimizedSearch
              variant="page"
              placeholder="Try: '2bhk holiday home in goa under 2cr' or search by type, location..."
              showPropertyType={false}
              enableNaturalLanguage={true}
              showParsedQuery={true}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <button
        onClick={scrollToNextSection}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hover:animate-none transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full p-2"
        aria-label="Scroll to next section"
      >
        <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center hover:border-white/80 transition-colors duration-300">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse hover:bg-white/80 transition-colors duration-300" />
        </div>
      </button>
    </section>
  );
}
