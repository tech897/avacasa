import Image from "next/image"
import Link from "next/link"
import { MapPin, Home, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Location } from "@/types"

interface LocationCardProps {
  location: Location
}

export function LocationCard({ location }: LocationCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-2 border-0 bg-white">
      <div className="relative">
        <Link href={`/locations/${location.slug}`}>
          <div className="aspect-[4/3] overflow-hidden">
            <Image
              src={location.image || "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"}
              alt={location.name}
              width={400}
              height={300}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          </div>
        </Link>
        
        {/* Featured badge */}
        {location.featured && (
          <div className="absolute top-4 left-4">
            <span className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-full font-medium backdrop-blur-sm">
              Featured
            </span>
          </div>
        )}

        {/* Property count overlay */}
        <div className="absolute bottom-4 right-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg">
            <Home className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              {location.propertyCount} Properties
            </span>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <Link href={`/locations/${location.slug}`}>
          <h3 className="text-xl font-semibold mb-3 group-hover:text-gray-700 transition-colors duration-300 text-gray-900">
            {location.name}
          </h3>
        </Link>
        
        <div className="flex items-center text-gray-500 mb-4">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="text-sm">India</span>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-5 leading-relaxed">
          {location.description}
        </p>

        {/* Highlights */}
        {location.highlights && location.highlights.length > 0 && (
          <div className="mb-5">
            <div className="flex flex-wrap gap-2">
              {location.highlights.slice(0, 3).map((highlight, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                >
                  {highlight}
                </span>
              ))}
              {location.highlights.length > 3 && (
                <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                  +{location.highlights.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <Button variant="outline" className="w-full group border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-300" asChild>
          <Link href={`/locations/${location.slug}`}>
            Explore Properties
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
} 