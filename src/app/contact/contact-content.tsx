"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CallButton } from "@/components/common/call-button"
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle, X } from "lucide-react"
import { useSettings } from "@/contexts/settings-context"

export default function ContactPageContent() {
  const { settings } = useSettings()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    type: "GENERAL"
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [notificationType, setNotificationType] = useState<"success" | "error">("success")

  const showPopup = (message: string, type: "success" | "error" = "success") => {
    setNotificationMessage(message)
    setNotificationType(type)
    setShowNotification(true)
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowNotification(false)
    }, 5000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        showPopup("Thank you for your message! We'll get back to you soon. 📧", "success")
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          type: "GENERAL"
        })
      } else {
        showPopup(data.error || "Failed to send message. Please try again.", "error")
      }
    } catch (error) {
      console.error('Contact form error:', error)
      showPopup("Failed to send message. Please check your connection and try again.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: settings.contactPhone ? [settings.contactPhone] : [],
      description: "Mon-Sat 9AM-7PM"
    },
    {
      icon: Mail,
      title: "Email",
      details: settings.contactEmail ? [settings.contactEmail] : [],
      description: "We'll respond within 24 hours"
    },
    {
      icon: MapPin,
      title: "Office",
      details: settings.address ? [settings.address] : [],
      description: "Visit us for consultation"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Monday - Saturday: 9:00 AM - 7:00 PM", "Sunday: 10:00 AM - 5:00 PM"],
      description: "Indian Standard Time"
    }
  ]

  const faqs = [
    {
      question: "How do I start the property buying process?",
      answer: "Simply browse our properties online, schedule a site visit, and our experts will guide you through the entire process from documentation to possession."
    },
    {
      question: "What are the payment options available?",
      answer: "We offer flexible payment plans including bank loans, EMI options, and construction-linked payment plans. Our team will help you choose the best option."
    },
    {
      question: "Do you provide property management services?",
      answer: "Yes, we offer comprehensive property management services including maintenance, rental management, and caretaking for your vacation properties."
    },
    {
      question: "Are all properties legally verified?",
      answer: "Absolutely. All our properties undergo thorough legal verification and come with clear titles and proper documentation."
    },
    {
      question: "Can I visit the properties before buying?",
      answer: "Yes, we encourage site visits. We can arrange guided tours and provide transportation for property visits across all our locations."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 mt-30">
      {/* Success/Error Notification Popup */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className={`rounded-lg shadow-lg p-4 ${
            notificationType === "success" 
              ? "bg-green-50 border border-green-200" 
              : "bg-red-50 border border-red-200"
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notificationType === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <X className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${
                  notificationType === "success" ? "text-green-800" : "text-red-800"
                }`}>
                  {notificationMessage}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => setShowNotification(false)}
                  className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    notificationType === "success" 
                      ? "text-green-500 hover:bg-green-100 focus:ring-green-600" 
                      : "text-red-500 hover:bg-red-100 focus:ring-red-600"
                  }`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ready to find your dream property? Our experts are here to help you every step of the way. 
              Reach out to us for personalized assistance and expert advice.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-heading">Send us a Message</CardTitle>
                  <p className="text-gray-600">
                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                          Inquiry Type
                        </label>
                        <select
                          id="type"
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                          <option value="GENERAL">General Inquiry</option>
                          <option value="SALES">Property Purchase</option>
                          <option value="SUPPORT">Support</option>
                          <option value="PARTNERSHIP">Partnership</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="What can we help you with?"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us more about your requirements..."
                        className="min-h-[120px]"
                      />
                    </div>

                    <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <info.icon className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{info.title}</h3>
                        {info.details.map((detail, i) => (
                          <p key={i} className="text-gray-600 mb-1">{detail}</p>
                        ))}
                        <p className="text-sm text-gray-500 mt-2">{info.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Call Back Request */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">Request a Call Back</h3>
                      <p className="text-gray-600 mb-3">Get a personalized consultation call from our experts</p>
                      <CallButton 
                        variant="default"
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        showText={true}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* WhatsApp Contact */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">WhatsApp</h3>
                      <p className="text-gray-600 mb-3">Get instant responses on WhatsApp</p>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about our properties and services.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              Visit Our Office
            </h2>
            <p className="text-xl text-gray-600">
              Schedule an appointment to visit our office for detailed consultation.
            </p>
          </div>

          <div className="bg-white rounded-xl overflow-hidden shadow-lg">
            <div className="h-96 w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.840234567!2d77.6458136!3d12.975985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae16aecf9f99fd%3A0xddf1c4aaf5cf4ea5!2s219%2C%206th%20Cross%20Rd%2C%20Defence%20Colony%2C%20Indiranagar%2C%20Bengaluru%2C%20Karnataka%20560038!5e0!3m2!1sen!2sin!4v1640000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Avacasa Office Location"
              ></iframe>
            </div>
            
            {/* Office Details Card */}
            <div className="p-6 bg-white border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                    <p className="text-gray-600 text-sm">
                      219, 6th Cross Rd, Defence Colony,<br />
                      Indiranagar, Bengaluru, Karnataka 560038
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Office Hours</h3>
                    <p className="text-gray-600 text-sm">
                      Monday - Saturday: 9:00 AM - 6:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Contact</h3>
                    <p className="text-gray-600 text-sm">
                      {settings.contactPhone || "+91 9898942841"}<br />
                      {settings.contactEmail || "hello@avacasa.life"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="https://www.google.com/maps/place/219,+6th+Cross+Rd,+Defence+Colony,+Indiranagar,+Bengaluru,+Karnataka+560038/@12.975985,77.6458136,17z/data=!3m1!4b1!4m6!3m5!1s0x3bae16aecf9f99fd:0xddf1c4aaf5cf4ea5!8m2!3d12.975985!4d77.6458136!16s%2Fg%2F11c27qxsg9?entry=ttu&g_ep=EgoyMDI1MDUyMS4wIKXMDSoASAFQAw%3D%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Get Directions
                  </a>
                  
                  <CallButton 
                    variant="outline"
                    size="default"
                    className="flex-1 sm:flex-none"
                    showText={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 