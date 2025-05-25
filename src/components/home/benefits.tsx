import { Shield, TrendingUp, Users, Award, Clock, MapPin } from "lucide-react"

const benefits = [
  {
    icon: Shield,
    title: "Verified Ownership",
    description: "All properties are legally verified with clear titles and proper documentation for hassle-free ownership."
  },
  {
    icon: TrendingUp,
    title: "Expert Advisory",
    description: "Get professional guidance on investment potential, market trends, and property appreciation prospects."
  },
  {
    icon: Users,
    title: "Community Living",
    description: "Join a community of like-minded property owners and enjoy shared amenities and experiences."
  },
  {
    icon: Award,
    title: "Premium Locations",
    description: "Handpicked properties in India's most sought-after destinations for holidays and investments."
  },
  {
    icon: Clock,
    title: "End-to-End Service",
    description: "From property selection to legal formalities and property management - we handle everything."
  },
  {
    icon: MapPin,
    title: "Strategic Locations",
    description: "Properties located in high-growth areas with excellent connectivity and future development potential."
  }
]

export function Benefits() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Avacasa?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We make vacation real estate investment simple, secure, and rewarding with our comprehensive approach.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 ease-out group hover:-translate-y-1"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-xl mb-6 group-hover:bg-gray-200 transition-all duration-300 group-hover:scale-110">
                <benefit.icon className="w-8 h-8 text-gray-700 group-hover:text-gray-900 transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors duration-300">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gray-900 rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Start Your Journey?
            </h3>
            <p className="text-xl mb-8 text-gray-300">
              Let our experts help you find the perfect property that matches your dreams and budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 hover:scale-105">
                Schedule Consultation
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-105">
                Download Brochure
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 