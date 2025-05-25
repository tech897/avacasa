'use client'

import { useState, useEffect } from 'react'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

interface ContactSubmission {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  type: 'GENERAL' | 'SALES' | 'SUPPORT' | 'PARTNERSHIP' | 'PHONE_INQUIRY'
  source?: string
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  notes?: string
  createdAt: string
  updatedAt: string
}

interface ContactSubmissionsProps {
  onStatusUpdate?: (id: string, status: string) => void
}

export default function ContactSubmissions({ onStatusUpdate }: ContactSubmissionsProps) {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showPhoneInquiryForm, setShowPhoneInquiryForm] = useState(false)
  const [phoneInquiryData, setPhoneInquiryData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    notes: ''
  })
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: ''
  })
  const [stats, setStats] = useState<Record<string, number>>({})
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
        ...(filters.search && { search: filters.search })
      })

      const response = await fetch(`/api/admin/contact-submissions?${params}`)
      const data = await response.json()

      if (data.success) {
        setSubmissions(data.data)
        setPagination(data.pagination)
        setStats(data.stats || {})
      }
    } catch (error) {
      console.error('Failed to fetch contact submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [pagination.page, filters])

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/contact-submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        fetchSubmissions()
        onStatusUpdate?.(id, status)
        if (selectedSubmission?.id === id) {
          setSelectedSubmission({ ...selectedSubmission, status: status as any })
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const deleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return

    try {
      const response = await fetch(`/api/admin/contact-submissions/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchSubmissions()
        setShowModal(false)
      }
    } catch (error) {
      console.error('Failed to delete submission:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NEW':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
      case 'IN_PROGRESS':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case 'RESOLVED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'CLOSED':
        return <CheckCircleIcon className="h-5 w-5 text-gray-500" />
      default:
        return <ExclamationCircleIcon className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    switch (status) {
      case 'NEW':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'IN_PROGRESS':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'RESOLVED':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'CLOSED':
        return `${baseClasses} bg-gray-100 text-gray-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const handlePhoneInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/contact-submissions/phone-inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(phoneInquiryData)
      })

      const data = await response.json()

      if (data.success) {
        setShowPhoneInquiryForm(false)
        setPhoneInquiryData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          notes: ''
        })
        fetchSubmissions() // Refresh the list
      } else {
        console.error('Failed to create phone inquiry:', data.error)
      }
    } catch (error) {
      console.error('Error creating phone inquiry:', error)
    }
  }

  const getTypeBadge = (type: string) => {
    const badges = {
      GENERAL: 'bg-gray-100 text-gray-800',
      SALES: 'bg-green-100 text-green-800',
      SUPPORT: 'bg-blue-100 text-blue-800',
      PARTNERSHIP: 'bg-purple-100 text-purple-800',
      PHONE_INQUIRY: 'bg-orange-100 text-orange-800'
    }
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[type as keyof typeof badges] || badges.GENERAL}`
  }

  const getSourceBadge = (source?: string) => {
    if (!source) return null
    
    const badges = {
      web_form: 'bg-blue-100 text-blue-800',
      phone_call: 'bg-green-100 text-green-800',
      callback_request: 'bg-orange-100 text-orange-800',
      email: 'bg-purple-100 text-purple-800',
      walk_in: 'bg-yellow-100 text-yellow-800'
    }
    
    const displayNames = {
      web_form: 'Web Form',
      phone_call: 'Phone Call',
      callback_request: 'Callback Request',
      email: 'Email',
      walk_in: 'Walk-in'
    }
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badges[source as keyof typeof badges] || 'bg-gray-100 text-gray-800'}`}>
        {displayNames[source as keyof typeof displayNames] || source}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Inquiries</h2>
          <p className="text-gray-600">Manage contact submissions and phone inquiries</p>
        </div>
        <button
          onClick={() => setShowPhoneInquiryForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PhoneIcon className="h-4 w-4 mr-2" />
          Add Phone Inquiry
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(stats).map(([status, count]) => (
          <div key={status} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {getStatusIcon(status)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 capitalize">
                  {status.replace('_', ' ')}
                </p>
                <p className="text-2xl font-semibold text-gray-900">{count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search submissions..."
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="GENERAL">General</option>
              <option value="SALES">Sales</option>
              <option value="SUPPORT">Support</option>
              <option value="PARTNERSHIP">Partnership</option>
              <option value="PHONE_INQUIRY">Phone Inquiry</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', type: '', search: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No contact submissions found
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {submission.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <EnvelopeIcon className="h-4 w-4 mr-1" />
                          {submission.email}
                        </div>
                        {submission.phone && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            {submission.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {submission.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getTypeBadge(submission.type)}>
                        {submission.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSourceBadge(submission.source)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={submission.status}
                        onChange={(e) => updateStatus(submission.id, e.target.value)}
                        className={`${getStatusBadge(submission.status)} border-none bg-transparent text-xs font-medium focus:ring-0`}
                      >
                        <option value="NEW">New</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedSubmission(submission)
                            setShowModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteSubmission(submission.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{pagination.total}</span>{' '}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setPagination({ ...pagination, page })}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedSubmission && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Contact Submission Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSubmission.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSubmission.email}</p>
                  </div>
                  {selectedSubmission.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedSubmission.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <span className={getTypeBadge(selectedSubmission.type)}>
                      {selectedSubmission.type}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSubmission.subject}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <div className="mt-1 p-3 border border-gray-300 rounded-md bg-gray-50">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedSubmission.message}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={selectedSubmission.status}
                      onChange={(e) => {
                        updateStatus(selectedSubmission.id, e.target.value)
                      }}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="NEW">New</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Submitted</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedSubmission.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <a
                    href={`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    Reply via Email
                  </a>
                  <button
                    onClick={() => deleteSubmission(selectedSubmission.id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phone Inquiry Form Modal */}
      {showPhoneInquiryForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Add Phone Inquiry
                </h3>
                <button
                  onClick={() => setShowPhoneInquiryForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>

              <form onSubmit={handlePhoneInquirySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={phoneInquiryData.name}
                      onChange={(e) => setPhoneInquiryData({ ...phoneInquiryData, name: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phoneInquiryData.phone}
                      onChange={(e) => setPhoneInquiryData({ ...phoneInquiryData, phone: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={phoneInquiryData.email}
                    onChange={(e) => setPhoneInquiryData({ ...phoneInquiryData, email: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter email address (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={phoneInquiryData.subject}
                    onChange={(e) => setPhoneInquiryData({ ...phoneInquiryData, subject: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter inquiry subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inquiry Details *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={phoneInquiryData.message}
                    onChange={(e) => setPhoneInquiryData({ ...phoneInquiryData, message: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter details of the phone inquiry..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Notes
                  </label>
                  <textarea
                    rows={2}
                    value={phoneInquiryData.notes}
                    onChange={(e) => setPhoneInquiryData({ ...phoneInquiryData, notes: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Add any internal notes..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPhoneInquiryForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Add Phone Inquiry
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 