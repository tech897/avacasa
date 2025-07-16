"use client"

import { useState } from "react"
import { OptimizedSearch } from "@/components/search/optimized-search"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Search, MapPin, Home, DollarSign, Bed } from "lucide-react"

// Force dynamic rendering to avoid SSG issues with event handlers
export const dynamic = 'force-dynamic'

interface SearchResult {
  query: string
  parsed: any
  summary: string
  confidence: number
  searchParams: any
}

const exampleQueries = [
  "2bhk holiday home in Assagao under 2cr",
  "3 bedroom villa in Siolim above 1 crore",
  "plot in Jaipur between 50 lakh to 1 crore",
  "apartment in Karjat under 75 lakh",
  "4bhk villa in Vagator",
  "plot in Ashwem under 50 lakh",
  "holiday home in Parra with swimming pool",
  "2 bedroom villa in Assagao under 1.5 cr"
]

export default function NaturalLanguageSearchDemo() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (query: string, filters?: any) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/search/natural-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const result: SearchResult = {
            query,
            parsed: data.data.parsed,
            summary: data.data.summary,
            confidence: data.data.confidence,
            searchParams: data.data.searchParams
          }
          setSearchResults(prev => [result, ...prev.slice(0, 4)]) // Keep last 5 results
        }
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const testQuery = async (query: string) => {
    await handleSearch(query)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 mt-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Natural Language Search Demo
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience intelligent property search using natural language queries. 
            Type queries like "2bhk holiday home in Assagao under 2cr" and watch the AI parse your intent.
          </p>
        </div>

        {/* Main Search Interface */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Natural Language Search
            </CardTitle>
            <p className="text-gray-600">
              Try typing complete sentences describing what you're looking for. 
              The system will automatically detect and parse natural language patterns.
            </p>
          </CardHeader>
          <CardContent>
            <OptimizedSearch 
              variant="page"
              placeholder="Try: '2bhk holiday home in Assagao under 2cr' or '3 bedroom villa in Siolim above 1 crore'"
              enableNaturalLanguage={true}
              showParsedQuery={true}
              onSearch={handleSearch}
              showPropertyType={false}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Example Queries */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Try These Examples</CardTitle>
            <p className="text-gray-600">
              Click any example below to test the natural language parsing:
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exampleQueries.map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => testQuery(query)}
                  disabled={isLoading}
                  className="text-left justify-start h-auto py-3 px-4 whitespace-normal"
                >
                  <div className="text-sm">{query}</div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Parsing Results</CardTitle>
              <p className="text-gray-600">
                See how your natural language queries are interpreted:
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {searchResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-1">
                          "{result.query}"
                        </div>
                        <div className="text-sm text-gray-600">
                          {result.summary}
                        </div>
                      </div>
                      <Badge 
                        variant={result.confidence > 70 ? "default" : result.confidence > 50 ? "secondary" : "outline"}
                        className="ml-3"
                      >
                        {result.confidence}% confidence
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {result.parsed.bedrooms && (
                        <div className="flex items-center gap-2">
                          <Bed className="w-4 h-4 text-gray-500" />
                          <span>{result.parsed.bedrooms} bedrooms</span>
                        </div>
                      )}
                      {result.parsed.propertyType && (
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-gray-500" />
                          <span>{result.parsed.propertyType.replace('_', ' ').toLowerCase()}</span>
                        </div>
                      )}
                      {result.parsed.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>{result.parsed.location}</span>
                        </div>
                      )}
                      {(result.parsed.minPrice || result.parsed.maxPrice) && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span>
                            {result.parsed.minPrice && result.parsed.maxPrice 
                              ? `₹${formatPrice(result.parsed.minPrice)} - ₹${formatPrice(result.parsed.maxPrice)}`
                              : result.parsed.maxPrice 
                              ? `Under ₹${formatPrice(result.parsed.maxPrice)}`
                              : `Above ₹${formatPrice(result.parsed.minPrice)}`
                            }
                          </span>
                        </div>
                      )}
                    </div>

                    {result.parsed.keywords && result.parsed.keywords.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 mb-1">Additional Keywords:</div>
                        <div className="flex flex-wrap gap-1">
                          {result.parsed.keywords.map((keyword: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {Object.keys(result.searchParams).length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-xs text-gray-500 mb-2">Generated Search Parameters:</div>
                        <div className="text-xs font-mono bg-gray-100 p-2 rounded">
                          {new URLSearchParams(result.searchParams).toString()}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Natural Language Processing Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Bed className="w-4 h-4" />
                  Bedroom Detection
                </h3>
                <p className="text-gray-600 text-sm">
                  Recognizes "2bhk", "3 bedroom", "single bed", etc.
                </p>
                <div className="text-xs text-gray-500">
                  Examples: 2bhk, 3 bedroom, four bed, single bedroom
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Property Types
                </h3>
                <p className="text-gray-600 text-sm">
                  Identifies villas, apartments, farmland, plots, holiday homes
                </p>
                <div className="text-xs text-gray-500">
                  Examples: villa, holiday home, farmland, independent house
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location Parsing
                </h3>
                <p className="text-gray-600 text-sm">
                  Extracts locations from "in Goa", "near Mumbai", etc.
                </p>
                <div className="text-xs text-gray-500">
                  Examples: in goa, near bangalore, around coorg
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Price Ranges
                </h3>
                <p className="text-gray-600 text-sm">
                  Understands "under 2cr", "between 1-2 crore", "above 50 lakh"
                </p>
                <div className="text-xs text-gray-500">
                  Examples: under 2cr, above 1 crore, between 50L to 1cr
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">🎯 Smart Confidence</h3>
                <p className="text-gray-600 text-sm">
                  Calculates confidence based on successfully parsed elements
                </p>
                <div className="text-xs text-gray-500">
                  Higher confidence = more accurate parsing
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">🔍 Fallback Search</h3>
                <p className="text-gray-600 text-sm">
                  Falls back to keyword search for low-confidence queries
                </p>
                <div className="text-xs text-gray-500">
                  Ensures all searches return relevant results
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Pattern Recognition</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Uses regex patterns to identify real estate-specific terms and structures:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Bedroom patterns: /(\d+)\s*bhk/gi, /(\d+)\s*bedroom/gi</li>
                  <li>• Price patterns: /under|below|above|over|between/gi</li>
                  <li>• Location patterns: /(?:in|at|near)\s+([a-zA-Z\s]+)/gi</li>
                  <li>• Property type mapping with 60+ variations</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Processing Pipeline</h3>
                <ol className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>1. <strong>Detection:</strong> Identify if query contains natural language patterns</li>
                  <li>2. <strong>Parsing:</strong> Extract structured data (bedrooms, type, location, price)</li>
                  <li>3. <strong>Confidence:</strong> Calculate confidence score based on parsed elements</li>
                  <li>4. <strong>Mapping:</strong> Convert to database query parameters</li>
                  <li>5. <strong>Fallback:</strong> Use keyword search if confidence is too low</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">API Endpoints</h3>
                <div className="space-y-2">
                  <div>
                    <code className="text-sm bg-gray-100 p-2 rounded block">
                      POST /api/search/natural-language
                    </code>
                    <p className="text-xs text-gray-500 mt-1">
                      Parses natural language queries and returns structured data
                    </p>
                  </div>
                  <div>
                    <code className="text-sm bg-gray-100 p-2 rounded block">
                      GET /api/search/natural-language?q=query&limit=20
                    </code>
                    <p className="text-xs text-gray-500 mt-1">
                      Full search with natural language parsing and property results
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper function to format price
function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `${(price / 10000000).toFixed(1)} Cr`
  } else if (price >= 100000) {
    return `${(price / 100000).toFixed(1)} L`
  } else if (price >= 1000) {
    return `${(price / 1000).toFixed(1)} K`
  }
  return price.toString()
} 