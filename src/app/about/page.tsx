import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Users, Award, MapPin, Heart } from "lucide-react";

// Force dynamic rendering to avoid SSG issues with event handlers
export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-50 to-gray-100 mt-30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Avacasa - Where Your Dream Lifestyle Meets Smart Real Estate
              Investment
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              At Avacasa, we don't just help you buy properties — we help you
              claim a lifestyle. Imagine waking up in a serene hill villa,
              owning a slice of fertile farmland that breathes life and
              sustainability, or retreating to a luxurious holiday home that
              doubles as a thriving investment.
            </p>
            <Button
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 transition-all duration-300"
              asChild
            >
              <Link href="/contact">
                Get in Touch
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Our Purpose */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Purpose
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                In today's fast-paced world, the need for spaces that nurture
                our wellbeing, spark joy, and build lasting wealth has never
                been greater. Avacasa's mission is to transform how people
                discover, invest in, and live their vacation and farmland dreams
                — by blending deep local expertise, cutting-edge technology, and
                a heart-led approach to real estate.
              </p>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                We exist to:
              </p>
              <ul className="text-lg text-gray-600 mb-8 leading-relaxed space-y-2">
                <li>
                  • Unlock access to curated, lifestyle-driven real estate
                  opportunities in India's most sought-after destinations.
                </li>
                <li>
                  • Empower buyers with trusted, transparent, data-backed
                  insights so every decision feels confident and clear.
                </li>
                <li>
                  • Create communities where owners aren't just investors but
                  caretakers of nature, culture, and legacy.
                </li>
                <li>
                  • Support sustainable growth that respects local ecosystems
                  while delivering meaningful returns.
                </li>
              </ul>
            </div>
            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Beautiful holiday home"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Avacasa Different */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Makes Avacasa Different?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We don't just provide listings — we curate experiences and build
              trust through every step of your investment journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Curated Exclusivity
              </h3>
              <p className="text-gray-600">
                Each project is hand-selected for quality, authenticity, and
                long-term value — no cookie-cutter developments, only
                exceptional experiences.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Insight-Driven Guidance
              </h3>
              <p className="text-gray-600">
                Our team combines years of real estate expertise with real-time
                market analytics and local knowledge to help you find the right
                property.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Seamless Ownership Journey
              </h3>
              <p className="text-gray-600">
                From first discovery to post-purchase management, we walk beside
                you, making complex processes simple and stress-free.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                A Platform with Heart
              </h3>
              <p className="text-gray-600">
                More than transactions — we foster connections between
                investors, developers, and communities to create thriving
                ecosystems of trust and growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Born from a passion for travel, nature, and meaningful
                investment, Avacasa was founded by industry veterans who saw a
                gap in how vacation homes and farmland investments were
                presented to Indian buyers. We envisioned a platform that goes
                beyond listings — a place that inspires, educates, and nurtures
                your dreams.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Today, Avacasa stands as a beacon for discerning buyers seeking
                not just properties, but places to belong, invest in, and
                cherish for generations.
              </p>
            </div>
            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Beautiful holiday home"
                width={600}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our experienced team is dedicated to helping you find the perfect
              property.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Praveen Hatti
              </h3>
              <p className="text-gray-700 mb-2">Founder & CEO</p>
              <p className="text-gray-600">
                Visionary leader driving Avacasa's mission to transform real
                estate investment experiences.
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nishant Samant
              </h3>
              <p className="text-gray-700 mb-2">Head of Sales</p>
              <p className="text-gray-600">
                Expert in building relationships and guiding clients through
                their property investment journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join the Avacasa Movement
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Owning a vacation home or managed farmland is more than a
            transaction. It's an investment in your lifestyle, your legacy, and
            the future of sustainable living. Are you ready to turn your dream
            into a destination?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              className="bg-white text-gray-900 hover:bg-gray-100 border-white transition-all duration-300"
              asChild
            >
              <Link href="/properties">Browse Properties</Link>
            </Button>
            <Button
              size="lg"
              className="bg-gray-800 hover:bg-gray-700 transition-all duration-300"
              asChild
            >
              <Link href="/contact">
                Contact Us
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
