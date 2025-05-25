'use client'

import { useState, useEffect } from 'react'
import { 
  EnvelopeIcon, 
  PaperAirplaneIcon,
  UserGroupIcon,
  DocumentTextIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
}

interface RecipientStats {
  users: number
  subscribers: number
  contacts: number
}

interface EmailResult {
  email: string
  success: boolean
  error?: string
}

export default function EmailCommunication() {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [recipients, setRecipients] = useState<string[]>([''])
  const [sendToAllUsers, setSendToAllUsers] = useState(false)
  const [sendToAllSubscribers, setSendToAllSubscribers] = useState(false)
  const [testMode, setTestMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [recipientStats, setRecipientStats] = useState<RecipientStats>({ users: 0, subscribers: 0, contacts: 0 })
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [sendResults, setSendResults] = useState<EmailResult[]>([])
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    fetchTemplates()
    fetchRecipientStats()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email/send?action=templates')
      const data = await response.json()
      if (data.success) {
        setTemplates(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  const fetchRecipientStats = async () => {
    try {
      const response = await fetch('/api/admin/email/send?action=recipients')
      const data = await response.json()
      if (data.success) {
        setRecipientStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch recipient stats:', error)
    }
  }

  const addRecipient = () => {
    setRecipients([...recipients, ''])
  }

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index))
  }

  const updateRecipient = (index: number, email: string) => {
    const newRecipients = [...recipients]
    newRecipients[index] = email
    setRecipients(newRecipients)
  }

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setSubject(template.subject)
      setContent(template.content)
      setSelectedTemplate(templateId)
    }
  }

  const sendEmail = async () => {
    if (!subject.trim() || !content.trim()) {
      alert('Please fill in both subject and content')
      return
    }

    const validRecipients = recipients.filter(email => email.trim() && email.includes('@'))
    
    if (!sendToAllUsers && !sendToAllSubscribers && validRecipients.length === 0) {
      alert('Please add at least one valid recipient or select a recipient group')
      return
    }

    setLoading(true)
    setSendResults([])
    setShowResults(false)

    try {
      const response = await fetch('/api/admin/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: validRecipients,
          subject,
          content,
          sendToAllUsers,
          sendToAllSubscribers,
          testMode
        })
      })

      const data = await response.json()

      if (data.success) {
        setSendResults(data.stats.recipients)
        setShowResults(true)
        
        // Reset form if not in test mode
        if (!testMode) {
          setSubject('')
          setContent('')
          setRecipients([''])
          setSendToAllUsers(false)
          setSendToAllSubscribers(false)
          setSelectedTemplate('')
        }
      } else {
        alert(`Failed to send email: ${data.error}`)
      }
    } catch (error) {
      console.error('Email sending error:', error)
      alert('Failed to send email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getTotalRecipients = () => {
    let total = recipients.filter(email => email.trim() && email.includes('@')).length
    if (sendToAllUsers) total += recipientStats.users
    if (sendToAllSubscribers) total += recipientStats.subscribers
    return total
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Email Communication</h2>
            <p className="text-gray-600">Send custom notifications and updates to your users</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Total Recipients: <span className="font-semibold text-gray-900">{getTotalRecipients()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recipient Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Registered Users</p>
              <p className="text-2xl font-semibold text-gray-900">{recipientStats.users}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <EnvelopeIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Email Subscribers</p>
              <p className="text-2xl font-semibold text-gray-900">{recipientStats.subscribers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Contact Submissions</p>
              <p className="text-2xl font-semibold text-gray-900">{recipientStats.contacts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Email Composer */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Compose Email</h3>

        {/* Template Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Template (Optional)
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => loadTemplate(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a template...</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject *
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* Content */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content * (HTML supported)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter email content... You can use HTML tags for formatting."
            rows={12}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            You can use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt; for formatting.
          </p>
        </div>

        {/* Recipients */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipients
          </label>
          
          {/* Recipient Groups */}
          <div className="space-y-3 mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={sendToAllUsers}
                onChange={(e) => setSendToAllUsers(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Send to all registered users ({recipientStats.users} users)
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={sendToAllSubscribers}
                onChange={(e) => setSendToAllSubscribers(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Send to all email subscribers ({recipientStats.subscribers} subscribers)
              </span>
            </label>
          </div>

          {/* Individual Recipients */}
          <div className="space-y-2">
            <p className="text-sm text-gray-700">Or add individual recipients:</p>
            {recipients.map((email, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => updateRecipient(index, e.target.value)}
                  placeholder="Enter email address..."
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {recipients.length > 1 && (
                  <button
                    onClick={() => removeRecipient(index)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addRecipient}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + Add another recipient
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={testMode}
              onChange={(e) => setTestMode(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Test mode (send only to admin email)
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            onClick={() => setShowPreview(true)}
            disabled={!subject.trim() || !content.trim()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            Preview
          </button>
          <button
            onClick={sendEmail}
            disabled={loading || !subject.trim() || !content.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                {testMode ? 'Send Test Email' : 'Send Email'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Send Results */}
      {showResults && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Send Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span className="ml-2 text-sm font-medium text-green-800">
                  Successful: {sendResults.filter(r => r.success).length}
                </span>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <XCircleIcon className="h-5 w-5 text-red-500" />
                <span className="ml-2 text-sm font-medium text-red-800">
                  Failed: {sendResults.filter(r => !r.success).length}
                </span>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-blue-500" />
                <span className="ml-2 text-sm font-medium text-blue-800">
                  Total: {sendResults.length}
                </span>
              </div>
            </div>
          </div>

          {sendResults.filter(r => !r.success).length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Failed Sends:</h4>
              <div className="space-y-2">
                {sendResults.filter(r => !r.success).map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span className="text-sm text-red-800">{result.email}</span>
                    <span className="text-xs text-red-600">{result.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Email Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="mb-4">
                  <strong>Subject:</strong> {subject}
                </div>
                <div className="border-t pt-4">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4 space-x-2">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowPreview(false)
                    sendEmail()
                  }}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 