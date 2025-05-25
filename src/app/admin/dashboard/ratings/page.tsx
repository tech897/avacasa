"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { 
  Star, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Plus, 
  Eye,
  ThumbsUp,
  MessageSquare,
  Calendar,
  User,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  Flag
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

// Force dynamic rendering to avoid SSG issues with event handlers
export const dynamic = 'force-dynamic'

interface Rating {
  id: string
  rating: number
  review?: string
  name: string
  email?: string
  verified: boolean
  helpful: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED'
  adminNotes?: string
  createdAt: string
  updatedAt: string
  property: {
    id: string
    title: string
    slug: string
    images: string[]
  }
  user?: {
    id: string
    name: string
    email: string
  }
}

interface Property {
  id: string
  title: string
  slug: string
}

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
  APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
  REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
  FLAGGED: { color: 'bg-orange-100 text-orange-800', icon: Flag, label: 'Flagged' },
}

export default function RatingsPage() {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [propertyFilter, setPropertyFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()

  // Form states
  const [editForm, setEditForm] = useState({
    rating: 5,
    review: '',
    name: '',
    email: '',
    verified: false,
    status: 'PENDING' as 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED',
    adminNotes: '',
    helpful: 0,
  })

  const [createForm, setCreateForm] = useState({
    propertyId: '',
    rating: 5,
    review: '',
    name: '',
    email: '',
    verified: false,
    status: 'PENDING' as 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED',
  })

  const fetchRatings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(propertyFilter !== 'all' && { propertyId: propertyFilter }),
        ...(searchTerm && { search: searchTerm }),
      })

      const response = await fetch(`/api/admin/ratings?${params}`)
      const data = await response.json()

      if (response.ok) {
        setRatings(data.ratings)
        setTotalPages(data.pagination.pages)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch ratings",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch ratings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/admin/properties')
      const data = await response.json()

      if (response.ok) {
        setProperties(data.properties.map((p: any) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
        })))
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error)
    }
  }

  useEffect(() => {
    fetchRatings()
  }, [currentPage, statusFilter, propertyFilter, searchTerm])

  useEffect(() => {
    fetchProperties()
  }, [])

  const handleEdit = (rating: Rating) => {
    setSelectedRating(rating)
    setEditForm({
      rating: rating.rating,
      review: rating.review || '',
      name: rating.name,
      email: rating.email || '',
      verified: rating.verified,
      status: rating.status,
      adminNotes: rating.adminNotes || '',
      helpful: rating.helpful,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedRating) return

    try {
      const response = await fetch(`/api/admin/ratings/${selectedRating.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Rating updated successfully",
        })
        setIsEditDialogOpen(false)
        fetchRatings()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update rating",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update rating",
        variant: "destructive",
      })
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/admin/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Rating created successfully",
        })
        setIsCreateDialogOpen(false)
        setCreateForm({
          propertyId: '',
          rating: 5,
          review: '',
          name: '',
          email: '',
          verified: false,
          status: 'PENDING',
        })
        fetchRatings()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create rating",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create rating",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedRating) return

    try {
      const response = await fetch(`/api/admin/ratings/${selectedRating.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Rating deleted successfully",
        })
        setIsDeleteDialogOpen(false)
        fetchRatings()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete rating",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete rating",
        variant: "destructive",
      })
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ratings & Reviews</h1>
          <p className="text-gray-600">Manage property ratings and customer reviews</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Rating
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Rating</DialogTitle>
              <DialogDescription>
                Create a new rating for a property
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="create-property">Property</Label>
                <Select
                  value={createForm.propertyId}
                  onValueChange={(value) => setCreateForm(prev => ({ ...prev, propertyId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="create-rating">Rating</Label>
                <Select
                  value={createForm.rating.toString()}
                  onValueChange={(value: string) => setCreateForm(prev => ({ ...prev, rating: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating} Star{rating !== 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="create-name">Reviewer Name</Label>
                <Input
                  id="create-name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter reviewer name"
                />
              </div>
              <div>
                <Label htmlFor="create-email">Email (Optional)</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label htmlFor="create-review">Review (Optional)</Label>
                <Textarea
                  id="create-review"
                  value={createForm.review}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, review: e.target.value }))}
                  placeholder="Enter review text"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-verified"
                  checked={createForm.verified}
                  onCheckedChange={(checked: boolean) => setCreateForm(prev => ({ ...prev, verified: !!checked }))}
                />
                <Label htmlFor="create-verified">Verified Review</Label>
              </div>
              <div>
                <Label htmlFor="create-status">Status</Label>
                <Select
                  value={createForm.status}
                  onValueChange={(value: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED') => setCreateForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="FLAGGED">Flagged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create Rating</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search ratings, reviews, or properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="FLAGGED">Flagged</SelectItem>
                </SelectContent>
              </Select>
              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ratings List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading ratings...</p>
          </div>
        ) : ratings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No ratings found</h3>
              <p className="text-gray-600">No ratings match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          ratings.map((rating) => {
            const StatusIcon = statusConfig[rating.status].icon
            return (
              <Card key={rating.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{rating.property.title}</span>
                        </div>
                        <Badge className={statusConfig[rating.status].color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[rating.status].label}
                        </Badge>
                        {rating.verified && (
                          <Badge variant="secondary">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        {renderStars(rating.rating)}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          <span>{rating.name}</span>
                          {rating.email && <span>({rating.email})</span>}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(rating.createdAt)}</span>
                        </div>
                      </div>

                      {rating.review && (
                        <div className="mb-3">
                          <p className="text-gray-700 italic">"{rating.review}"</p>
                        </div>
                      )}

                      {rating.adminNotes && (
                        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800">
                            <strong>Admin Notes:</strong> {rating.adminNotes}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{rating.helpful} helpful</span>
                        </div>
                        {rating.user && (
                          <span>User: {rating.user.name}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(rating)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRating(rating)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Rating</DialogTitle>
            <DialogDescription>
              Update the rating details and moderation status
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-rating">Rating</Label>
              <Select
                value={editForm.rating.toString()}
                onValueChange={(value: string) => setEditForm(prev => ({ ...prev, rating: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating} Star{rating !== 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-name">Reviewer Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-review">Review</Label>
              <Textarea
                id="edit-review"
                value={editForm.review}
                onChange={(e) => setEditForm(prev => ({ ...prev, review: e.target.value }))}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-helpful">Helpful Count</Label>
              <Input
                id="edit-helpful"
                type="number"
                min="0"
                value={editForm.helpful}
                onChange={(e) => setEditForm(prev => ({ ...prev, helpful: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-verified"
                checked={editForm.verified}
                onCheckedChange={(checked: boolean) => setEditForm(prev => ({ ...prev, verified: !!checked }))}
              />
              <Label htmlFor="edit-verified">Verified Review</Label>
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED') => setEditForm(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="FLAGGED">Flagged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-admin-notes">Admin Notes</Label>
              <Textarea
                id="edit-admin-notes"
                value={editForm.adminNotes}
                onChange={(e) => setEditForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                placeholder="Add admin notes for moderation..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Rating</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Rating</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this rating? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedRating && (
            <div className="py-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(selectedRating.rating)}
                  <span className="font-medium">{selectedRating.name}</span>
                </div>
                <p className="text-sm text-gray-600">{selectedRating.property.title}</p>
                {selectedRating.review && (
                  <p className="text-sm text-gray-700 mt-2 italic">"{selectedRating.review}"</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 