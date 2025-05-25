"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar,
  Phone,
  Mail,
  Heart,
  Share2,
  Download,
  Car,
  Wifi,
  Shield,
  Waves,
  Trees,
  Dumbbell,
  ChefHat,
  Snowflake,
  Building,
  GraduationCap,
  Hospital,
  ShoppingBag,
  Plane,
  Coffee
} from "lucide-react"
import type { Property } from "@/types"
import { useTracking } from "@/hooks/use-tracking"
import { CallButton } from "@/components/common/call-button"

const amenityIcons: Record<string, React.ComponentType<any>> = {
  parking: Car,
  wifi: Wifi,
  security: Shield,
  pool: Waves,
  garden: Trees,
  gym: Dumbbell,
  kitchen: ChefHat,
  ac: Snowflake,
  coffee: Coffee
}

export default function PropertyPage() {
  const params = useParams()
  const slug = params.slug as string
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  
  const { trackPageView, trackPropertyView } = useTracking()

  useEffect(() => {
    if (slug) {
      fetchProperty()
    }
  }, [slug])

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${slug}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setProperty(result.data)
          trackPageView(`/properties/${slug}`)
          trackPropertyView(result.data.id, result.data.title)
        }
      }
    } catch (error) {
      console.error('Error fetching property:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share && property) {
      try {
        await navigator.share({
          title: property.title,
          text: property.description,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
    // TODO: Implement favorite functionality with API
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="bg-gray-200 h-8 rounded"></div>
              <div className="bg-gray-200 h-6 rounded"></div>
              <div className="bg-gray-200 h-20 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h1>
          <p className="text-gray-600">The property you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const getAmenityIcon = (iconName: string) => {
    const IconComponent = amenityIcons[iconName] || Building
    return <IconComponent className="w-5 h-5" />
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-30">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image
                  src={property.images[selectedImage] || '/placeholder-property.jpg'}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-white/90">
                    {property.propertyType.replace('_', ' ')}
                  </Badge>
                </div>
                {property.featured && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-500">Featured</Badge>
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-6 gap-2">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-16 rounded overflow-hidden border-2 ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${property.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleFavorite}
                      className={isFavorite ? 'text-red-500' : ''}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{property.location.name}</span>
                </div>

                <div className="text-3xl font-bold text-blue-600 mb-4">
                  ₹{property.price.toLocaleString()}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center">
                    <Bed className="w-5 h-5 text-gray-400 mr-2" />
                    <span>{property.bedrooms} Bedrooms</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="w-5 h-5 text-gray-400 mr-2" />
                    <span>{property.bathrooms} Bathrooms</span>
                  </div>
                  <div className="flex items-center">
                    <Square className="w-5 h-5 text-gray-400 mr-2" />
                    <span>{property.area} sqft</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-6">{property.description}</p>

                <div className="flex gap-4">
                  <CallButton 
                    variant="default" 
                    className="flex-1"
                  />
                  <Button variant="outline" className="flex-1">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Inquiry
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 text-black">
            <TabsTrigger value="overview" className="text-black">Overview</TabsTrigger>
            <TabsTrigger value="units">Units</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* About the Project */}
              {property.aboutProject && (
                <Card>
                  <CardHeader>
                    <CardTitle>About the Project</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{property.aboutProject}</p>
                  </CardContent>
                </Card>
              )}

              {/* Property Management */}
              {property.propertyManagement && (
                <Card>
                  <CardHeader>
                    <CardTitle>Property Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {property.propertyManagement.company && (
                      <div>
                        <span className="font-medium">Company: </span>
                        <span className="text-gray-600">{property.propertyManagement.company}</span>
                      </div>
                    )}
                    {property.propertyManagement.services && (
                      <div>
                        <span className="font-medium">Services: </span>
                        <span className="text-gray-600">{property.propertyManagement.services.join(', ')}</span>
                      </div>
                    )}
                    {property.propertyManagement.charges && (
                      <div>
                        <span className="font-medium">Charges: </span>
                        <span className="text-gray-600">{property.propertyManagement.charges}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Financial Returns */}
              {property.financialReturns && (
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Returns & Investment Benefits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {property.financialReturns.expectedROI && (
                      <div>
                        <span className="font-medium">Expected ROI: </span>
                        <span className="text-green-600 font-semibold">{property.financialReturns.expectedROI}</span>
                      </div>
                    )}
                    {property.financialReturns.rentalYield && (
                      <div>
                        <span className="font-medium">Rental Yield: </span>
                        <span className="text-green-600 font-semibold">{property.financialReturns.rentalYield}</span>
                      </div>
                    )}
                    {property.financialReturns.appreciationRate && (
                      <div>
                        <span className="font-medium">Appreciation Rate: </span>
                        <span className="text-green-600 font-semibold">{property.financialReturns.appreciationRate}</span>
                      </div>
                    )}
                    {property.investmentBenefits && property.investmentBenefits.length > 0 && (
                      <div>
                        <span className="font-medium">Investment Benefits:</span>
                        <ul className="list-disc list-inside mt-2 text-gray-600">
                          {property.investmentBenefits.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="units" className="mt-6">
            {property.unitConfiguration ? (
              <Card>
                <CardHeader>
                  <CardTitle>Unit Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-2 text-left">Unit Type</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Area</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Availability</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(property.unitConfiguration).map(([unitType, details]) => (
                          <tr key={unitType}>
                            <td className="border border-gray-300 px-4 py-2 font-medium">{unitType}</td>
                            <td className="border border-gray-300 px-4 py-2">{details.area}</td>
                            <td className="border border-gray-300 px-4 py-2 font-semibold text-blue-600">{details.price}</td>
                            <td className="border border-gray-300 px-4 py-2">
                              <Badge variant={details.availability === 'Available' ? 'default' : 'secondary'}>
                                {details.availability}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">Unit configuration details not available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="amenities" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      {getAmenityIcon(amenity.icon || 'building')}
                      <span className="text-sm font-medium">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legal" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Legal Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                {property.legalApprovals && property.legalApprovals.length > 0 ? (
                  <div className="space-y-4">
                    {property.legalApprovals.map((approval, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{approval.name}</h4>
                          {approval.authority && (
                            <p className="text-sm text-gray-600">Authority: {approval.authority}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant={approval.status === 'Approved' ? 'default' : 'secondary'}>
                            {approval.status}
                          </Badge>
                          {approval.date && (
                            <p className="text-sm text-gray-600 mt-1">{approval.date}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Legal approval details not available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Registration Costs */}
              {property.registrationCosts && (
                <Card>
                  <CardHeader>
                    <CardTitle>Registration Costs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {property.registrationCosts.stampDuty && (
                      <div className="flex justify-between">
                        <span>Stamp Duty:</span>
                        <span className="font-semibold">{property.registrationCosts.stampDuty}</span>
                      </div>
                    )}
                    {property.registrationCosts.registrationFee && (
                      <div className="flex justify-between">
                        <span>Registration Fee:</span>
                        <span className="font-semibold">{property.registrationCosts.registrationFee}</span>
                      </div>
                    )}
                    {property.registrationCosts.legalCharges && (
                      <div className="flex justify-between">
                        <span>Legal Charges:</span>
                        <span className="font-semibold">{property.registrationCosts.legalCharges}</span>
                      </div>
                    )}
                    {property.registrationCosts.total && (
                      <div className="flex justify-between border-t pt-3 font-bold">
                        <span>Total:</span>
                        <span>{property.registrationCosts.total}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* EMI Options */}
              {property.emiOptions && (
                <Card>
                  <CardHeader>
                    <CardTitle>EMI Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {property.emiOptions.interestRates && (
                      <div>
                        <span className="font-medium">Interest Rates: </span>
                        <span className="text-green-600 font-semibold">{property.emiOptions.interestRates}</span>
                      </div>
                    )}
                    {property.emiOptions.maxTenure && (
                      <div>
                        <span className="font-medium">Max Tenure: </span>
                        <span>{property.emiOptions.maxTenure}</span>
                      </div>
                    )}
                    {property.emiOptions.bankPartners && (
                      <div>
                        <span className="font-medium">Bank Partners: </span>
                        <span>{property.emiOptions.bankPartners.join(', ')}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="location" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Nearby Infrastructure */}
              {property.nearbyInfrastructure && (
                <>
                  {property.nearbyInfrastructure.educational && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <GraduationCap className="w-5 h-5 mr-2" />
                          Educational Institutions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {property.nearbyInfrastructure.educational.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{item.name}</span>
                              <span className="text-gray-600">{item.distance}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {property.nearbyInfrastructure.healthcare && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Hospital className="w-5 h-5 mr-2" />
                          Healthcare
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {property.nearbyInfrastructure.healthcare.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{item.name}</span>
                              <span className="text-gray-600">{item.distance}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {property.nearbyInfrastructure.transportation && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Plane className="w-5 h-5 mr-2" />
                          Transportation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {property.nearbyInfrastructure.transportation.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{item.name}</span>
                              <span className="text-gray-600">{item.distance}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {property.nearbyInfrastructure.shopping && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <ShoppingBag className="w-5 h-5 mr-2" />
                          Shopping & Entertainment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {property.nearbyInfrastructure.shopping.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{item.name}</span>
                              <span className="text-gray-600">{item.distance}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 