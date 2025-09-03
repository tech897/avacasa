"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Hero } from "@/components/home/hero";
import { Benefits } from "@/components/home/benefits";
import { LocationCard } from "@/components/location/location-card";
import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { HomePageWrapper } from "@/components/home/home-page-wrapper";
import Link from "next/link";
import { ArrowRight, CheckCircle, Search, Eye, Home } from "lucide-react";
import { PropertyType, PropertyStatus } from "@/types";
import type { Property, Location, Rating } from "@/types";
import ContactForm from "@/components/contact-form";

export default function HomePageContent() {
  const router = useRouter();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [featuredLocations, setFeaturedLocations] = useState<Location[]>([]);
  const [featuredRatings, setFeaturedRatings] = useState<Rating[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<any[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);

  // Fetch featured properties, locations, ratings, and blogs from API
  useEffect(() => {
    fetchFeaturedProperties();
    fetchFeaturedLocations();
    fetchFeaturedRatings();
    fetchFeaturedBlogs();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      setPropertiesLoading(true);
      const response = await fetch("/api/properties?featured=true&limit=6");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFeaturedProperties(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching featured properties:", error);
    } finally {
      setPropertiesLoading(false);
    }
  };

  const fetchFeaturedLocations = async () => {
    try {
      setLocationsLoading(true);
      const response = await fetch("/api/locations?featured=true&limit=6");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Data is already parsed by the API, no need to parse again
          setFeaturedLocations(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching featured locations:", error);
    } finally {
      setLocationsLoading(false);
    }
  };

  const fetchFeaturedRatings = async () => {
    try {
      setRatingsLoading(true);
      const response = await fetch("/api/ratings/featured");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFeaturedRatings(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching featured ratings:", error);
    } finally {
      setRatingsLoading(false);
    }
  };

  const fetchFeaturedBlogs = async () => {
    try {
      setBlogsLoading(true);
      const response = await fetch("/api/blog?featured=true&limit=3");
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFeaturedBlogs(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching featured blogs:", error);
      // Fallback to static data if API fails
      setFeaturedBlogs([
        {
          id: 1,
          title: "Rise of Sustainable Living",
          excerpt:
            "From city balconies with thriving kitchen gardens to off-grid retreats powered by renewable energy, sustainable living is reshaping how we think about our homes.",
          featuredImage:
            "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          slug: "rise-of-sustainable-living",
        },
        {
          id: 2,
          title: "Can Your Vacation Home Pay for Itself?",
          excerpt:
            "The idea of owning a vacation home in Goa, a coffee estate in Coorg, or a scenic farmland in Chikkamagaluru becomes more attractive when you consider the rental income potential.",
          featuredImage:
            "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          slug: "vacation-home-pay-for-itself",
        },
        {
          id: 3,
          title: "Staycation State of Mind",
          excerpt:
            "What if your next vacation didn't involve long airport lines, expensive bookings, or unfamiliar surroundings? Welcome to the world of staycations at your own holiday home.",
          featuredImage:
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
          slug: "staycation-state-of-mind",
        },
      ]);
    } finally {
      setBlogsLoading(false);
    }
  };

  // Handler for location card clicks
  const handleLocationClick = (locationSlug: string) => {
    router.push(`/locations/${locationSlug}`);
  };

  // Handler for feature view card clicks
  const handleFeatureClick = (featureId: string) => {
    // Get the corresponding feature to navigate to properties with that view type
    const feature = featureViews.find((f) => f.id === featureId);
    if (feature) {
      router.push(`/properties?viewType=${encodeURIComponent(feature.name)}`);
    }
  };

  // Popular locations from database (diverse geographic spread)
  const mockLocations = [
    {
      id: "assagao",
      slug: "assagao",
      name: "Assagao, Goa",
      description:
        "Charming North Goa village known for scenic beauty, heritage structures, and popular dining spots with luxury villas",
      image:
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "mukteshwar",
      slug: "mukteshwar",
      name: "Mukteshwar, UK",
      description:
        "Fastest growing holiday home zone in Uttarakhand with scenic views and tourism-friendly environment",
      image:
        "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "igatpuri",
      slug: "igatpuri",
      name: "Igatpuri, MH",
      description:
        "Hill station in Western Ghats known for scenic beauty, cool climate, and proximity to Mumbai",
      image:
        "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "jaipur",
      slug: "jaipur",
      name: "Jaipur, RJ",
      description:
        "Vibrant real estate destination blending rich cultural heritage with modern urban development",
      image:
        "https://images.unsplash.com/photo-1477587458883-47145ed94245?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "chikkaballapura",
      slug: "chikkaballapura",
      name: "Chikkaballapura, KA",
      description:
        "Emerging green-living destination near Bengaluru with clean air, hill views, and proximity to Kempegowda Airport",
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "shimla",
      slug: "shimla",
      name: "Shimla, HP",
      description:
        "Prominent hill station offering scenic beauty, colonial charm, and robust infrastructure in Himachal Pradesh",
      image:
        "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
  ];

  // Mock data for feature views
  const featureViews = [
    {
      id: "lake-view",
      name: "Lake View",
      image:
        "https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "forest-view",
      name: "Forest View",
      image:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "hill-view",
      name: "Hill View",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "farm-view",
      name: "Farm View",
      image:
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "sea-view",
      name: "Sea View",
      image:
        "https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "pool-view",
      name: "Pool View",
      image:
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    },
  ];



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <HomePageWrapper>
      <Hero />

      {/* Recommended Properties */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Recommended for you
            </h2>
            <p className="text-lg text-gray-600">Handpicked just for you</p>
          </div>

          {propertiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-sm animate-pulse"
                >
                  <div className="aspect-[4/3] bg-gray-200 rounded-t-2xl" />
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-3" />
                    <div className="h-4 bg-gray-200 rounded mb-4 w-2/3" />
                    <div className="h-8 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-6">
                No featured properties available at the moment.
              </p>
              <Button asChild>
                <Link href="/properties">
                  Browse All Properties
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          )}

          {/* See All Properties Button - After Content */}
          {!propertiesLoading && featuredProperties.length > 0 && (
            <div className="text-center">
              <Button
                size="lg"
                asChild
                className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Link href="/properties">
                  See All Properties
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Curated Locations */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Curated homes in your favourite locations
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              Take a deep dive and browse vacation homes for sale, neighbourhood
              photos,
              <br />
              investment information and local insights to find what is right
              for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {mockLocations.map((location) => (
              <div
                key={location.id}
                className="group cursor-pointer"
                onClick={() => handleLocationClick(location.slug)}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <img
                    src={location.image}
                    alt={location.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{location.name}</h3>
                    <p className="text-sm text-gray-200">
                      {location.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Locations Button - After Content */}
          <div className="text-center">
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-10 py-4 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl bg-white"
            >
              <Link href="/locations">
                View All Locations
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Views */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Curated based on features
            </h2>
            <p className="text-lg text-gray-600">
              Conveys hand-picked getaways and a sense of exclusivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureViews.map((feature) => (
              <div
                key={feature.id}
                className="group cursor-pointer"
                onClick={() => handleFeatureClick(feature.id)}
              >
                <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
                  <img
                    src={feature.image}
                    alt={feature.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-2xl font-bold">{feature.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-cover bg-center relative services-section">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-16">
            See How Avacasa Can Help
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Buy a vacation home
              </h3>
              <p className="text-gray-600 mb-6">
                Find the right vacation home for you in your favourite location
                around the world.
              </p>
              <Button
                className="bg-gray-900 hover:bg-gray-800 text-white"
                asChild
              >
                <Link href="/properties?type=holiday-home">Find a home</Link>
              </Button>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Sell a vacation home
              </h3>
              <p className="text-gray-600 mb-6">
                Avacasa can help you market your vacation home and manage the
                complete process.
              </p>
              <Button
                className="bg-gray-900 hover:bg-gray-800 text-white"
                onClick={() => {
                  const contactSection =
                    document.getElementById("contact-form");
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: "smooth" });
                    // Trigger sell tab activation after scroll
                    setTimeout(() => {
                      const sellButton = document.querySelector(
                        '[data-tab="sell"]'
                      ) as HTMLButtonElement;
                      if (sellButton) {
                        sellButton.click();
                      }
                    }, 500);
                  }
                }}
              >
                List your home
              </Button>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Home className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Research</h3>
              <p className="text-gray-600 mb-6">
                Avacasa's deep research and insights on the markets, projects
                help you find the right location and property for your needs
              </p>
              <Button
                className="bg-gray-900 hover:bg-gray-800 text-white"
                asChild
              >
                <Link href="/resources">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Benefits />

      {/* Contact Form Section */}
      <section className="py-20" id="contact-form">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Connect With Us
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ready to start your property journey? Get in touch with our
              experts today.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <ContactForm />

            <div className="lg:pl-12">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Modern interior"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blogs Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Blogs
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover insights, tips, and stories about vacation home ownership
              and sustainable living.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {blogsLoading ? (
              // Loading skeleton
              [...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              featuredBlogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`} className="group">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={blog.featuredImage || blog.image}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {blog.excerpt}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* View All Blogs Button - After Content */}
          <div className="text-center">
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-10 py-4 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl bg-white"
            >
              <Link href="/blog">
                View All Blogs
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Locations Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Popular Vacation Destinations
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover your dream vacation home in India's most sought-after
              destinations.
            </p>
          </div>

          {/* Goa Beach Destinations */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Goa Beach Properties
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { name: "Siolim", slug: "siolim" },
                { name: "Calangute", slug: "calangute" },
                { name: "Anjuna", slug: "anjuna" },
                { name: "Vagator", slug: "vagator" },
                { name: "Morjim", slug: "morjim" },
                { name: "Pilerne", slug: "pilerne" },
                { name: "Moira", slug: "moira" },
                { name: "Parra", slug: "parra" },
                { name: "Mapusa", slug: "mapusa" },
                { name: "Reis Magos", slug: "reis-magos" },
                { name: "Aldona", slug: "aldona" },
                { name: "Mandrem", slug: "mandrem" },
              ].map((location) => (
                <Link
                  key={location.slug}
                  href={`/locations/${location.slug}`}
                  className="group bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-blue-200"
                >
                  <div className="text-blue-600 group-hover:text-blue-700 font-medium text-sm">
                    {location.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Hill Stations & Coffee Plantations */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Hill Stations & Coffee Retreats
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { name: "Coorg", slug: "coorg" },
                { name: "Ooty", slug: "ooty" },
                { name: "Munnar", slug: "munnar" },
                { name: "Chikkamagaluru", slug: "chikkamagaluru" },
                { name: "Sakleshpur", slug: "sakleshpur" },
                { name: "Madikeri", slug: "madikeri" },
                { name: "Gonikoppa", slug: "gonikoppa" },
                { name: "Kodlipet", slug: "kodlipet" },
                { name: "Shimla", slug: "shimla" },
                { name: "Kasauli", slug: "kasauli" },
                { name: "Lonavala", slug: "lonavala" },
                { name: "Panchgani", slug: "panchgani" },
              ].map((location) => (
                <Link
                  key={location.slug}
                  href={`/locations/${location.slug}`}
                  className="group bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-green-200"
                >
                  <div className="text-green-600 group-hover:text-green-700 font-medium text-sm">
                    {location.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Near Bangalore */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Near Bangalore
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { name: "Kanakapura", slug: "kanakapura" },
                { name: "Nandi Hills", slug: "nandi-hills" },
                { name: "Ramanagara", slug: "ramanagara" },
                { name: "Chikkaballapur", slug: "chikkaballapura" },
                { name: "Doddaballapur", slug: "doddaballapur" },
                { name: "Devanahalli", slug: "devanahalli" },
                { name: "Denkanikottai", slug: "denkanikottai" },
                { name: "Madhugiri", slug: "madhugiri" },
                { name: "Pavagada", slug: "pavagada" },
                { name: "Shoolagiri", slug: "shoolagiri" },
                {
                  name: "Bagepalli",
                  slug: "bagepalli",
                },
                { name: "Madakkal", slug: "madakkal" },
              ].map((location) => (
                <Link
                  key={location.slug}
                  href={`/locations/${location.slug}`}
                  className="group bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-purple-200"
                >
                  <div className="text-purple-600 group-hover:text-purple-700 font-medium text-sm">
                    {location.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Himalayan Destinations */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Himalayan Retreats
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { name: "Mukteshwar", slug: "mukteshwar" },
                { name: "Narendra Nagar", slug: "narendra-nagar" },
                { name: "Rishikesh", slug: "rishikesh" },
                { name: "Pangot", slug: "pangot" },
                { name: "Marchula Village", slug: "marchula-village" },
                { name: "GMS Road Dehradun", slug: "gms-road" },
                {
                  name: "Narendranagar Rishikesh",
                  slug: "narendranagar-rishikesh",
                },
                { name: "Nata Dol", slug: "nata-dol" },
              ].map((location) => (
                <Link
                  key={location.slug}
                  href={`/locations/${location.slug}`}
                  className="group bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-indigo-200"
                >
                  <div className="text-indigo-600 group-hover:text-indigo-700 font-medium text-sm">
                    {location.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Near Mumbai & Pune */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Near Mumbai & Pune
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { name: "Karjat", slug: "karjat" },
                { name: "Igatpuri", slug: "igatpuri" },
                { name: "Murbad", slug: "murbad" },
                { name: "Khopoli", slug: "khopoli" },
                { name: "Alibaug", slug: "alibaug" },
                { name: "Varsoli", slug: "varsoli" },
                { name: "Bavdhan", slug: "bavdhan" },
                { name: "Khadakwasla", slug: "khadakwasla" },
                { name: "Somatane", slug: "somatane" },
                { name: "Urse", slug: "urse" },
                { name: "Alwand", slug: "alwand" },
                { name: "Kunegaon", slug: "kunegaon" },
              ].map((location) => (
                <Link
                  key={location.slug}
                  href={`/locations/${location.slug}`}
                  className="group bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-orange-200"
                >
                  <div className="text-orange-600 group-hover:text-orange-700 font-medium text-sm">
                    {location.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Near Hyderabad */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Near Hyderabad
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { name: "Mokila", slug: "mokila" },
                { name: "Medchal", slug: "medchal" },
                { name: "Shamirpet", slug: "shamirpet" },
                { name: "Vikarabad", slug: "vikarabad" },
                { name: "Mahabubnagar", slug: "mahabubnagar" },
                { name: "Shadnagar", slug: "shadnagar" },
                { name: "Shamshabad", slug: "shamshabad" },
                { name: "Kollur", slug: "kollur" },
                { name: "Puppalaguda", slug: "puppalaguda" },
                { name: "Moinabad", slug: "moinabad" },
                { name: "Kandukur", slug: "kandukur" },
                { name: "Sanga Reddy", slug: "sanga-reddy" },
              ].map((location) => (
                <Link
                  key={location.slug}
                  href={`/locations/${location.slug}`}
                  className="group bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-red-200"
                >
                  <div className="text-red-600 group-hover:text-red-700 font-medium text-sm">
                    {location.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Near Chennai */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Near Chennai
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { name: "Kovalam", slug: "kovalam" },
                { name: "Mahabalipuram", slug: "mahabalipuram" },
                { name: "Kandigai", slug: "kandigai" },
                { name: "Akkarai", slug: "akkarai" },
                { name: "Yedakadu", slug: "yedakadu" },
              ].map((location) => (
                <Link
                  key={location.slug}
                  href={`/locations/${location.slug}`}
                  className="group bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-teal-200"
                >
                  <div className="text-teal-600 group-hover:text-teal-700 font-medium text-sm">
                    {location.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* View All Locations Button */}
          <div className="text-center">
            <Button
              size="lg"
              asChild
              className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Link href="/locations">
                Explore All Locations
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </HomePageWrapper>
  );
}
