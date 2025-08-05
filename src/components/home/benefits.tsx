import { Heart, Settings, Users } from "lucide-react";

const benefits = [
  {
    icon: Heart,
    title: "Seamless Ownership",
    description:
      "Enjoy a hassle-free property journey from discovery to management, ensuring complete peace of mind.",
  },
  {
    icon: Settings,
    title: "Expert Advisory",
    description:
      "Make informed decisions with insights from real estate professionals dedicated to your success.",
  },
  {
    icon: Users,
    title: "Exceptional Experiences",
    description:
      "Elevate your lifestyle with curated, unforgettable experiences that blend luxury, wellness, and comfort.",
  },
];

export function Benefits() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Avacasa Benefits
          </h2>
          <p className="text-lg text-gray-600">See how Avacasa can help you</p>
        </div>

        <div className="space-y-6 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-orange-200 p-8 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-6">
                <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl flex-shrink-0">
                  <benefit.icon className="w-8 h-8 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
