"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  MapPin,
  Home,
  Star,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Location {
  id: string
  name: string
  slug: string
  description: string
  image: string
  featured: boolean
  active: boolean
  propertyCount: number
  createdAt: string
  updatedAt: string
  highlights: string // JSON string in database
}

export default function LocationsManagement() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [updatingCounts, setUpdatingCounts] = useState(false)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/locations')
      if (response.ok) {
        const data = await response.json()
        // Parse highlights from JSON string
        const locationsWithParsedHighlights = data.locations.map((location: any) => ({
          ...location,
          highlights: location.highlights || '[]' // Keep as JSON string for admin
        }))
        setLocations(locationsWithParsedHighlights)
      }
    } catch (error) {
      console.error('Error fetching locations:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePropertyCounts = async () => {
    setUpdatingCounts(true)
    try {
      const response = await fetch('/api/admin/locations/update-counts', {
        method: 'POST'
      })
      if (response.ok) {
        const result = await response.json()
        console.log('Property counts updated:', result.results)
        // Refresh locations to show updated counts
        fetchLocations()
        alert('Property counts updated successfully!')
      } else {
        alert('Failed to update property counts')
      }
    } catch (error) {
      console.error('Error updating property counts:', error)
      alert('Error updating property counts')
    } finally {
      setUpdatingCounts(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return

    try {
      const response = await fetch(`/api/admin/locations/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setLocations(locations.filter(l => l.id !== id))
      }
    } catch (error) {
      console.error('Error deleting location:', error)
    }
  }

  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      const response = await fetch(`/api/admin/locations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ featured: !featured })
      })
      if (response.ok) {
        setLocations(locations.map(l => 
          l.id === id ? { ...l, featured: !featured } : l
        ))
      }
    } catch (error) {
      console.error('Error updating location:', error)
    }
  }

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Locations Management</h1>
          <p className="text-gray-600">Manage all locations in your system</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={updatePropertyCounts}
            disabled={updatingCounts}
            variant="outline"
            className="border-gray-300"
          >
            {updatingCounts ? 'Updating...' : 'Update Counts'}
          </Button>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-gray-900 hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocations.map((location) => (
          <div key={location.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="relative h-48">
              <img
                src={location.image}
                alt={location.name}
                className="w-full h-full object-cover"
              />
              {location.featured && (
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </span>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <Home className="w-4 h-4 mr-1" />
                  {location.propertyCount}
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {location.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/locations/${location.slug}`}
                    target="_blank"
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => toggleFeatured(location.id, location.featured)}
                    className={`${location.featured ? 'text-yellow-600' : 'text-gray-400'} hover:text-yellow-700`}
                    title={location.featured ? 'Remove from featured' : 'Add to featured'}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setEditingLocation(location)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(location.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  location.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {location.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLocations.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No locations found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new location.
          </p>
          <div className="mt-6">
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-gray-900 hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Location Modal */}
      {(showAddForm || editingLocation) && (
        <LocationFormModal
          location={editingLocation}
          onClose={() => {
            setShowAddForm(false)
            setEditingLocation(null)
          }}
          onSave={() => {
            fetchLocations()
            setShowAddForm(false)
            setEditingLocation(null)
          }}
        />
      )}
    </div>
  )
}

// Location Form Modal Component
function LocationFormModal({ 
  location, 
  onClose, 
  onSave 
}: { 
  location: Location | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    name: location?.name || '',
    description: location?.description || '',
    image: location?.image || '',
    featured: location?.featured || false,
    active: location?.active ?? true
  })
  const [highlights, setHighlights] = useState<string[]>(
    location ? JSON.parse(location.highlights || '[]') : []
  )
  const [newHighlight, setNewHighlight] = useState('')
  const [loading, setLoading] = useState(false)

  const addHighlight = () => {
    if (newHighlight.trim() && !highlights.includes(newHighlight.trim())) {
      setHighlights([...highlights, newHighlight.trim()])
      setNewHighlight('')
    }
  }

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = location 
        ? `/api/admin/locations/${location.id}`
        : '/api/admin/locations'
      
      const method = location ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          highlights,
          slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        })
      })

      if (response.ok) {
        onSave()
      }
    } catch (error) {
      console.error('Error saving location:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {location ? 'Edit Location' : 'Add New Location'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL *
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Describe what makes this location special..."
              required
            />
          </div>

          {/* Highlights Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What makes this location special?
            </label>
            <div className="space-y-3">
              {/* Add new highlight */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHighlight())}
                  placeholder="e.g., Pristine Beaches, Coffee Plantations..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <Button
                  type="button"
                  onClick={addHighlight}
                  disabled={!newHighlight.trim()}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Current highlights */}
              {highlights.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Current highlights:</p>
                  <div className="flex flex-wrap gap-2">
                    {highlights.map((highlight, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{highlight}</span>
                        <button
                          type="button"
                          onClick={() => removeHighlight(index)}
                          className="text-blue-600 hover:text-blue-800 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {highlights.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  Add highlights to showcase what makes this location unique
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="mr-2 rounded"
              />
              <span className="text-sm">Featured Location</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="mr-2 rounded"
              />
              <span className="text-sm">Active</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gray-900 hover:bg-gray-800"
            >
              {loading ? 'Saving...' : (location ? 'Update Location' : 'Create Location')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 