"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, X, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Location {
  id: string
  name: string
  slug: string
}

interface PropertyFormData {
  title: string
  slug: string
  description: string
  price: string
  locationId: string
  propertyType: string
  bedrooms: number
  bathrooms: number
  area: number
  floors: number
  images: string[]
  amenities: { name: string; icon: string }[]
  features: string[]
  coordinates: { lat: number; lng: number } | null
  status: string
  featured: boolean
  active: boolean
  
  // New comprehensive fields
  unitConfiguration: { [key: string]: { area: string; price: string; availability: string } }
  aboutProject: string
  legalApprovals: { name: string; status: string; date?: string; authority?: string }[]
  registrationCosts: {
    stampDuty?: string
    registrationFee?: string
    legalCharges?: string
    otherCharges?: string
    total?: string
  }
  propertyManagement: {
    company?: string
    services?: string[]
    contact?: string
    charges?: string
  }
  financialReturns: {
    expectedROI?: string
    rentalYield?: string
    appreciationRate?: string
    paybackPeriod?: string
  }
  investmentBenefits: string[]
  nearbyInfrastructure: {
    educational?: { name: string; distance: string; type?: string }[]
    healthcare?: { name: string; distance: string; type?: string }[]
    transportation?: { name: string; distance: string; type?: string }[]
    entertainment?: { name: string; distance: string; type?: string }[]
    shopping?: { name: string; distance: string; type?: string }[]
  }
  plotSize: string
  constructionStatus: string
  possessionDate: string
  emiOptions: {
    bankPartners?: string[]
    interestRates?: string
    maxTenure?: string
    processingFee?: string
  }
  metaTitle: string
  metaDescription: string
  tags: string[]
}

const propertyTypes = [
  { value: 'HOLIDAY_HOME', label: 'Holiday Home' },
  { value: 'FARMLAND', label: 'Farmland' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'PLOT', label: 'Plot' },
  { value: 'APARTMENT', label: 'Apartment' }
]

const propertyStatuses = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'UNDER_CONSTRUCTION', label: 'Under Construction' },
  { value: 'COMING_SOON', label: 'Coming Soon' }
]

const commonAmenities = [
  { name: 'Swimming Pool', icon: 'pool' },
  { name: 'Garden', icon: 'garden' },
  { name: 'Parking', icon: 'parking' },
  { name: 'Security', icon: 'security' },
  { name: 'Gym', icon: 'gym' },
  { name: 'Beach Access', icon: 'beach' },
  { name: 'Mountain View', icon: 'mountain' },
  { name: 'WiFi', icon: 'wifi' },
  { name: 'Air Conditioning', icon: 'ac' },
  { name: 'Kitchen', icon: 'kitchen' }
]

export default function AddProperty() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newFeature, setNewFeature] = useState('')
  const [newTag, setNewTag] = useState('')
  const [newBenefit, setNewBenefit] = useState('')
  
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    slug: '',
    description: '',
    price: '',
    locationId: '',
    propertyType: 'HOLIDAY_HOME',
    bedrooms: 1,
    bathrooms: 1,
    area: 0,
    floors: 1,
    images: [],
    amenities: [],
    features: [],
    coordinates: null,
    status: 'AVAILABLE',
    featured: false,
    active: true,
    
    // New fields
    unitConfiguration: {},
    aboutProject: '',
    legalApprovals: [],
    registrationCosts: {},
    propertyManagement: { services: [] },
    financialReturns: {},
    investmentBenefits: [],
    nearbyInfrastructure: {
      educational: [],
      healthcare: [],
      transportation: [],
      entertainment: [],
      shopping: []
    },
    plotSize: '',
    constructionStatus: '',
    possessionDate: '',
    emiOptions: { bankPartners: [] },
    metaTitle: '',
    metaDescription: '',
    tags: []
  })

  useEffect(() => {
    fetchLocations()
  }, [])

  useEffect(() => {
    // Auto-generate slug from title
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.title])

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/admin/locations')
      if (response.ok) {
        const data = await response.json()
        setLocations(data.locations)
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof PropertyFormData] as any),
          [child]: value
        }
      }))
    } else {
    setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()]
      }))
      setNewImageUrl('')
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const toggleAmenity = (amenity: { name: string; icon: string }) => {
    setFormData(prev => {
      const exists = prev.amenities.find(a => a.name === amenity.name)
      if (exists) {
        return {
          ...prev,
          amenities: prev.amenities.filter(a => a.name !== amenity.name)
        }
      } else {
        return {
          ...prev,
          amenities: [...prev.amenities, amenity]
        }
      }
    })
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }))
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData(prev => ({
        ...prev,
        investmentBenefits: [...prev.investmentBenefits, newBenefit.trim()]
      }))
      setNewBenefit('')
    }
  }

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      investmentBenefits: prev.investmentBenefits.filter((_, i) => i !== index)
    }))
  }

  const addUnitType = () => {
    const unitType = prompt('Enter unit type (e.g., 1 BHK, 2 BHK, Studio):')
    if (unitType) {
      setFormData(prev => ({
        ...prev,
        unitConfiguration: {
          ...prev.unitConfiguration,
          [unitType]: { area: '', price: '', availability: 'Available' }
        }
      }))
    }
  }

  const removeUnitType = (unitType: string) => {
    setFormData(prev => {
      const newConfig = { ...prev.unitConfiguration }
      delete newConfig[unitType]
      return { ...prev, unitConfiguration: newConfig }
    })
  }

  const addLegalApproval = () => {
    setFormData(prev => ({
      ...prev,
      legalApprovals: [
        ...prev.legalApprovals,
        { name: '', status: 'Pending', date: '', authority: '' }
      ]
    }))
  }

  const removeLegalApproval = (index: number) => {
    setFormData(prev => ({
      ...prev,
      legalApprovals: prev.legalApprovals.filter((_, i) => i !== index)
    }))
  }

  const addInfrastructureItem = (category: string) => {
    setFormData(prev => ({
      ...prev,
      nearbyInfrastructure: {
        ...prev.nearbyInfrastructure,
        [category]: [
          ...(prev.nearbyInfrastructure[category as keyof typeof prev.nearbyInfrastructure] || []),
          { name: '', distance: '', type: '' }
        ]
      }
    }))
  }

  const removeInfrastructureItem = (category: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      nearbyInfrastructure: {
        ...prev.nearbyInfrastructure,
        [category]: prev.nearbyInfrastructure[category as keyof typeof prev.nearbyInfrastructure]?.filter((_, i) => i !== index) || []
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/admin/dashboard/properties')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create property')
      }
    } catch (error) {
      console.error('Error creating property:', error)
      alert('Failed to create property')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard/properties">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Properties
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Add New Property</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="w-full text-black">
          <TabsList className="grid w-full grid-cols-6 text-black">
            <TabsTrigger value="basic" className="text-black">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="units">Units</TabsTrigger>
            <TabsTrigger value="legal">Legal & Pricing</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle >Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                    <Label htmlFor="title">Property Title *</Label>
              <Input
                      id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter property title"
                required
              />
            </div>
            <div>
                    <Label htmlFor="slug">URL Slug *</Label>
              <Input
                      id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="property-url-slug"
                required
              />
            </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter property description"
                    rows={4}
                required
              />
            </div>

            <div>
                  <Label htmlFor="aboutProject">About the Project</Label>
                  <Textarea
                    id="aboutProject"
                    value={formData.aboutProject}
                    onChange={(e) => handleInputChange('aboutProject', e.target.value)}
                    placeholder="Detailed project description"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Price (₹) *</Label>
              <Input
                      id="price"
                      type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="Enter price"
                required
              />
            </div>
            <div>
                    <Label htmlFor="locationId">Location *</Label>
              <select
                      id="locationId"
                value={formData.locationId}
                onChange={(e) => handleInputChange('locationId', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                      <option value="">Select Location</option>
                      {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
                    <Label htmlFor="propertyType">Property Type *</Label>
              <select
                      id="propertyType"
                value={formData.propertyType}
                onChange={(e) => handleInputChange('propertyType', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                      {propertyTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
                    <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                      id="bedrooms"
                type="number"
                min="0"
                      value={formData.bedrooms}
                      onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
              />
            </div>
            <div>
                    <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                      id="bathrooms"
                type="number"
                min="0"
                      value={formData.bathrooms}
                      onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value))}
              />
            </div>
            <div>
                    <Label htmlFor="area">Area (sqft)</Label>
              <Input
                      id="area"
                type="number"
                min="0"
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', parseInt(e.target.value))}
              />
            </div>
            <div>
                    <Label htmlFor="floors">Floors</Label>
              <Input
                      id="floors"
                type="number"
                min="1"
                      value={formData.floors}
                      onChange={(e) => handleInputChange('floors', parseInt(e.target.value))}
              />
            </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                    <Label htmlFor="status">Status</Label>
              <select
                      id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
              >
                      {propertyStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
                  <div className="flex items-center space-x-4 pt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => handleInputChange('featured', e.target.checked)}
                        className="mr-2"
                      />
                      Featured Property
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => handleInputChange('active', e.target.checked)}
                        className="mr-2"
                      />
                      Active
                    </label>
          </div>
        </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {/* Images Section */}
            <Card>
              <CardHeader>
                <CardTitle>Property Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="flex-1"
              />
              <Button type="button" onClick={addImage}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                    <img
                      src={image}
                        alt={`Property ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                      <Button
                      type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-4 h-4" />
                      </Button>
                  </div>
                ))}
              </div>
              </CardContent>
            </Card>

            {/* Amenities Section */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {commonAmenities.map((amenity) => (
                    <Button
                key={amenity.name}
                type="button"
                      variant={formData.amenities.find(a => a.name === amenity.name) ? "default" : "outline"}
                      size="sm"
                onClick={() => toggleAmenity(amenity)}
                      className="justify-start"
              >
                {amenity.name}
                    </Button>
            ))}
          </div>
              </CardContent>
            </Card>

            {/* Features Section */}
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Enter feature"
                className="flex-1"
              />
              <Button type="button" onClick={addFeature}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {feature}
                      <Button
                      type="button"
                        variant="ghost"
                        size="sm"
                      onClick={() => removeFeature(index)}
                        className="h-auto p-0 ml-1"
                    >
                      <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                ))}
              </div>
              </CardContent>
            </Card>

            {/* Investment Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    placeholder="Enter investment benefit"
                    className="flex-1"
                  />
                  <Button type="button" onClick={addBenefit}>
                    <Plus className="w-4 h-4" />
                  </Button>
          </div>
                <div className="space-y-2">
                  {formData.investmentBenefits.map((benefit, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>{benefit}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBenefit(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
        </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SEO Section */}
            <Card>
              <CardHeader>
                <CardTitle>SEO & Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                    placeholder="SEO meta title"
                  />
                </div>
                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    placeholder="SEO meta description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Enter tag"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addTag}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTag(index)}
                          className="h-auto p-0 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="units" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Unit Configuration
                  <Button type="button" onClick={addUnitType} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Unit Type
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
          <div className="space-y-4">
                  {Object.entries(formData.unitConfiguration).map(([unitType, details]) => (
                    <div key={unitType} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{unitType}</h4>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeUnitType(unitType)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Area</Label>
                          <Input
                            value={details.area}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                unitConfiguration: {
                                  ...prev.unitConfiguration,
                                  [unitType]: { ...details, area: e.target.value }
                                }
                              }))
                            }}
                            placeholder="e.g., 1200 sqft"
                          />
                        </div>
                        <div>
                          <Label>Price</Label>
                          <Input
                            value={details.price}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                unitConfiguration: {
                                  ...prev.unitConfiguration,
                                  [unitType]: { ...details, price: e.target.value }
                                }
                              }))
                            }}
                            placeholder="e.g., ₹45 Lakhs"
                          />
          </div>
                        <div>
                          <Label>Availability</Label>
                          <select
                            value={details.availability}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                unitConfiguration: {
                                  ...prev.unitConfiguration,
                                  [unitType]: { ...details, availability: e.target.value }
                                }
                              }))
                            }}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="Available">Available</option>
                            <option value="Sold Out">Sold Out</option>
                            <option value="Coming Soon">Coming Soon</option>
                          </select>
        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legal" className="space-y-6">
            {/* Legal Approvals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Legal Approvals
                  <Button type="button" onClick={addLegalApproval} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Approval
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.legalApprovals.map((approval, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Approval {index + 1}</h4>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeLegalApproval(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Approval Name</Label>
                          <Input
                            value={approval.name}
                            onChange={(e) => {
                              const newApprovals = [...formData.legalApprovals]
                              newApprovals[index] = { ...approval, name: e.target.value }
                              setFormData(prev => ({ ...prev, legalApprovals: newApprovals }))
                            }}
                            placeholder="e.g., RERA Approval"
                          />
                        </div>
                        <div>
                          <Label>Status</Label>
                          <select
                            value={approval.status}
                            onChange={(e) => {
                              const newApprovals = [...formData.legalApprovals]
                              newApprovals[index] = { ...approval, status: e.target.value }
                              setFormData(prev => ({ ...prev, legalApprovals: newApprovals }))
                            }}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="In Progress">In Progress</option>
                          </select>
                        </div>
                        <div>
                          <Label>Authority</Label>
                          <Input
                            value={approval.authority || ''}
                            onChange={(e) => {
                              const newApprovals = [...formData.legalApprovals]
                              newApprovals[index] = { ...approval, authority: e.target.value }
                              setFormData(prev => ({ ...prev, legalApprovals: newApprovals }))
                            }}
                            placeholder="e.g., Karnataka RERA"
                          />
                        </div>
                        <div>
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={approval.date || ''}
                            onChange={(e) => {
                              const newApprovals = [...formData.legalApprovals]
                              newApprovals[index] = { ...approval, date: e.target.value }
                              setFormData(prev => ({ ...prev, legalApprovals: newApprovals }))
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Registration Costs */}
            <Card>
              <CardHeader>
                <CardTitle>Registration Costs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Stamp Duty</Label>
                    <Input
                      value={formData.registrationCosts.stampDuty || ''}
                      onChange={(e) => handleInputChange('registrationCosts.stampDuty', e.target.value)}
                      placeholder="e.g., 5% of property value"
                    />
                  </div>
                  <div>
                    <Label>Registration Fee</Label>
                    <Input
                      value={formData.registrationCosts.registrationFee || ''}
                      onChange={(e) => handleInputChange('registrationCosts.registrationFee', e.target.value)}
                      placeholder="e.g., 1% of property value"
                    />
                  </div>
                  <div>
                    <Label>Legal Charges</Label>
                    <Input
                      value={formData.registrationCosts.legalCharges || ''}
                      onChange={(e) => handleInputChange('registrationCosts.legalCharges', e.target.value)}
                      placeholder="e.g., ₹50,000"
                    />
                  </div>
                  <div>
                    <Label>Other Charges</Label>
                    <Input
                      value={formData.registrationCosts.otherCharges || ''}
                      onChange={(e) => handleInputChange('registrationCosts.otherCharges', e.target.value)}
                      placeholder="e.g., ₹25,000"
                    />
                  </div>
                  <div>
                    <Label>Total</Label>
                    <Input
                      value={formData.registrationCosts.total || ''}
                      onChange={(e) => handleInputChange('registrationCosts.total', e.target.value)}
                      placeholder="e.g., ₹5,75,000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* EMI Options */}
            <Card>
              <CardHeader>
                <CardTitle>EMI Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Interest Rates</Label>
                    <Input
                      value={formData.emiOptions.interestRates || ''}
                      onChange={(e) => handleInputChange('emiOptions.interestRates', e.target.value)}
                      placeholder="e.g., 8.5% - 12% per annum"
                    />
                  </div>
                  <div>
                    <Label>Max Tenure</Label>
                    <Input
                      value={formData.emiOptions.maxTenure || ''}
                      onChange={(e) => handleInputChange('emiOptions.maxTenure', e.target.value)}
                      placeholder="e.g., 20 years"
                    />
                  </div>
                  <div>
                    <Label>Processing Fee</Label>
                    <Input
                      value={formData.emiOptions.processingFee || ''}
                      onChange={(e) => handleInputChange('emiOptions.processingFee', e.target.value)}
                      placeholder="e.g., 0.5% of loan amount"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            {/* Property Management */}
            <Card>
              <CardHeader>
                <CardTitle>Property Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Management Company</Label>
                    <Input
                      value={formData.propertyManagement.company || ''}
                      onChange={(e) => handleInputChange('propertyManagement.company', e.target.value)}
                      placeholder="e.g., ABC Property Management"
                    />
                  </div>
                  <div>
                    <Label>Contact</Label>
                    <Input
                      value={formData.propertyManagement.contact || ''}
                      onChange={(e) => handleInputChange('propertyManagement.contact', e.target.value)}
                      placeholder="e.g., +91 9876543210"
                    />
                  </div>
                  <div>
                    <Label>Management Charges</Label>
                    <Input
                      value={formData.propertyManagement.charges || ''}
                      onChange={(e) => handleInputChange('propertyManagement.charges', e.target.value)}
                      placeholder="e.g., 8% of rental income"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Returns */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Expected ROI</Label>
                    <Input
                      value={formData.financialReturns.expectedROI || ''}
                      onChange={(e) => handleInputChange('financialReturns.expectedROI', e.target.value)}
                      placeholder="e.g., 12-15% per annum"
                    />
                  </div>
                  <div>
                    <Label>Rental Yield</Label>
                    <Input
                      value={formData.financialReturns.rentalYield || ''}
                      onChange={(e) => handleInputChange('financialReturns.rentalYield', e.target.value)}
                      placeholder="e.g., 6-8% per annum"
                    />
                  </div>
                  <div>
                    <Label>Appreciation Rate</Label>
                    <Input
                      value={formData.financialReturns.appreciationRate || ''}
                      onChange={(e) => handleInputChange('financialReturns.appreciationRate', e.target.value)}
                      placeholder="e.g., 8-10% per annum"
                    />
                  </div>
                  <div>
                    <Label>Payback Period</Label>
                    <Input
                      value={formData.financialReturns.paybackPeriod || ''}
                      onChange={(e) => handleInputChange('financialReturns.paybackPeriod', e.target.value)}
                      placeholder="e.g., 8-10 years"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Plot Size</Label>
                    <Input
                      value={formData.plotSize}
                      onChange={(e) => handleInputChange('plotSize', e.target.value)}
                      placeholder="e.g., 2400 sqft"
                    />
                  </div>
                  <div>
                    <Label>Construction Status</Label>
                    <Input
                      value={formData.constructionStatus}
                      onChange={(e) => handleInputChange('constructionStatus', e.target.value)}
                      placeholder="e.g., Ready to Move"
                    />
                  </div>
                  <div>
                    <Label>Possession Date</Label>
                    <Input
                      type="date"
                      value={formData.possessionDate}
                      onChange={(e) => handleInputChange('possessionDate', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="space-y-6">
            {/* Nearby Infrastructure */}
            {['educational', 'healthcare', 'transportation', 'shopping'].map((category) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between capitalize">
                    {category} Infrastructure
                    <Button
                      type="button"
                      onClick={() => addInfrastructureItem(category)}
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add {category}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(formData.nearbyInfrastructure[category as keyof typeof formData.nearbyInfrastructure] || []).map((item, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium capitalize">{category} {index + 1}</h4>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeInfrastructureItem(category, index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Name</Label>
                            <Input
                              value={item.name}
                              onChange={(e) => {
                                const newInfrastructure = { ...formData.nearbyInfrastructure }
                                const categoryItems = [...(newInfrastructure[category as keyof typeof newInfrastructure] || [])]
                                categoryItems[index] = { ...item, name: e.target.value }
                                newInfrastructure[category as keyof typeof newInfrastructure] = categoryItems
                                setFormData(prev => ({ ...prev, nearbyInfrastructure: newInfrastructure }))
                              }}
                              placeholder={`Enter ${category} name`}
                            />
                          </div>
                          <div>
                            <Label>Distance</Label>
                            <Input
                              value={item.distance}
                              onChange={(e) => {
                                const newInfrastructure = { ...formData.nearbyInfrastructure }
                                const categoryItems = [...(newInfrastructure[category as keyof typeof newInfrastructure] || [])]
                                categoryItems[index] = { ...item, distance: e.target.value }
                                newInfrastructure[category as keyof typeof newInfrastructure] = categoryItems
                                setFormData(prev => ({ ...prev, nearbyInfrastructure: newInfrastructure }))
                              }}
                              placeholder="e.g., 2 km"
                            />
                          </div>
                          <div>
                            <Label>Type</Label>
                            <Input
                              value={item.type || ''}
                              onChange={(e) => {
                                const newInfrastructure = { ...formData.nearbyInfrastructure }
                                const categoryItems = [...(newInfrastructure[category as keyof typeof newInfrastructure] || [])]
                                categoryItems[index] = { ...item, type: e.target.value }
                                newInfrastructure[category as keyof typeof newInfrastructure] = categoryItems
                                setFormData(prev => ({ ...prev, nearbyInfrastructure: newInfrastructure }))
                              }}
                              placeholder={`Type of ${category}`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Coordinates */}
            <Card>
              <CardHeader>
                <CardTitle>Location Coordinates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Latitude</Label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.coordinates?.lat || ''}
                      onChange={(e) => {
                        const lat = parseFloat(e.target.value)
                        setFormData(prev => ({
                          ...prev,
                          coordinates: {
                            lat: lat,
                            lng: prev.coordinates?.lng || 0
                          }
                        }))
                      }}
                      placeholder="e.g., 12.9716"
                    />
                  </div>
                  <div>
                    <Label>Longitude</Label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.coordinates?.lng || ''}
                      onChange={(e) => {
                        const lng = parseFloat(e.target.value)
                        setFormData(prev => ({
                          ...prev,
                          coordinates: {
                            lat: prev.coordinates?.lat || 0,
                            lng: lng
                          }
                        }))
                      }}
                      placeholder="e.g., 77.5946"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 pt-6">
          <Link href="/admin/dashboard/properties">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Property'}
          </Button>
        </div>
      </form>
    </div>
  )
} 