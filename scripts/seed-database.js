const { PrismaClient } = require('../src/generated/prisma')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// Sample data
const locations = [
  {
    name: "Goa",
    slug: "goa",
    description: "Beautiful coastal state known for its beaches, Portuguese heritage, and vibrant nightlife. Perfect for holiday homes and vacation rentals.",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    coordinates: JSON.stringify({ lat: 15.2993, lng: 74.1240 }),
    highlights: JSON.stringify(["Beaches", "Tourism Hub", "Rental Income", "Coastal Living"]),
    amenities: JSON.stringify([]),
    featured: true,
    propertyCount: 0
  },
  {
    name: "Coorg",
    slug: "coorg",
    description: "Scotland of India, famous for coffee plantations, misty hills, and serene landscapes. Ideal for farmland investments and eco-resorts.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    coordinates: JSON.stringify({ lat: 12.3375, lng: 75.8069 }),
    highlights: JSON.stringify(["Coffee Plantations", "Hill Station", "Cool Climate", "Nature Tourism"]),
    amenities: JSON.stringify([]),
    featured: true,
    propertyCount: 0
  },
  {
    name: "Ooty",
    slug: "ooty",
    description: "Queen of Hill Stations in Tamil Nadu, known for tea gardens, pleasant weather, and colonial charm. Great for holiday homes.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    coordinates: JSON.stringify({ lat: 11.4102, lng: 76.6950 }),
    highlights: JSON.stringify(["Tea Gardens", "Cool Weather", "Tourist Destination", "Colonial Architecture"]),
    amenities: JSON.stringify([]),
    featured: true,
    propertyCount: 0
  },
  {
    name: "Munnar",
    slug: "munnar",
    description: "Picturesque hill station in Kerala with sprawling tea plantations, misty mountains, and exotic wildlife. Perfect for nature lovers.",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    coordinates: JSON.stringify({ lat: 10.0889, lng: 77.0595 }),
    highlights: JSON.stringify(["Tea Plantations", "Wildlife", "Trekking", "Scenic Beauty"]),
    amenities: JSON.stringify([]),
    featured: false,
    propertyCount: 0
  },
  {
    name: "Lonavala",
    slug: "lonavala",
    description: "Popular hill station near Mumbai and Pune, known for its caves, waterfalls, and pleasant climate. Great weekend getaway destination.",
    image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    coordinates: JSON.stringify({ lat: 18.7537, lng: 73.4068 }),
    highlights: JSON.stringify(["Weekend Getaway", "Waterfalls", "Caves", "Mumbai Proximity"]),
    amenities: JSON.stringify([]),
    featured: false,
    propertyCount: 0
  },
  {
    name: "Rishikesh",
    slug: "rishikesh",
    description: "Yoga capital of the world, situated on the banks of Ganges. Known for spiritual tourism, adventure sports, and ashrams.",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    coordinates: JSON.stringify({ lat: 30.0869, lng: 78.2676 }),
    highlights: JSON.stringify(["Spiritual Tourism", "Adventure Sports", "Ganges", "Yoga Retreats"]),
    amenities: JSON.stringify([]),
    featured: false,
    propertyCount: 0
  }
]

const properties = [
  // Goa Properties
  {
    title: "Luxury Beach Villa in North Goa",
    slug: "luxury-beach-villa-north-goa",
    description: "Stunning 4-bedroom villa just 200 meters from Calangute Beach. Features private pool, landscaped garden, and modern amenities. Perfect for vacation rental or personal use.",
    propertyType: "VILLA",
    status: "AVAILABLE",
    price: "12500000",
    bedrooms: 4,
    bathrooms: 4,
    area: 3200,
    featured: true,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80"
    ]),
    amenities: JSON.stringify(["Private Pool", "Garden", "Parking", "Security", "Beach Access", "Furnished"]),
    features: JSON.stringify(["Beach Proximity", "Rental Income Potential", "Modern Design", "Prime Location"]),
    coordinates: JSON.stringify({ lat: 15.5439, lng: 73.7553 }),
    tags: JSON.stringify(["luxury", "beach", "villa", "goa", "vacation-rental"])
  },
  {
    title: "Cozy Beach Apartment in Baga",
    slug: "cozy-beach-apartment-baga",
    description: "Charming 2-bedroom apartment in the heart of Baga. Walking distance to beach, restaurants, and nightlife. Fully furnished and ready to move in.",
    propertyType: "APARTMENT",
    status: "AVAILABLE",
    price: "6800000",
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    featured: false,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80"
    ]),
    amenities: JSON.stringify(["Balcony", "Parking", "Security", "Furnished", "Beach Access"]),
    features: JSON.stringify(["Central Location", "Fully Furnished", "Investment Opportunity", "Beach Walking Distance"]),
    coordinates: JSON.stringify({ lat: 15.5567, lng: 73.7519 }),
    tags: JSON.stringify(["apartment", "beach", "baga", "furnished", "investment"])
  },
  // Coorg Properties
  {
    title: "Coffee Plantation Estate in Coorg",
    slug: "coffee-plantation-estate-coorg",
    description: "Sprawling 15-acre coffee plantation with traditional Kodava house. Includes processing unit, worker quarters, and scenic mountain views. Established plantation with steady income.",
    propertyType: "FARMLAND",
    status: "AVAILABLE",
    price: "45000000",
    bedrooms: 3,
    bathrooms: 2,
    area: 607500, // 15 acres in sq ft
    featured: true,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80"
    ]),
    amenities: JSON.stringify(["Coffee Processing Unit", "Worker Quarters", "Mountain Views", "Water Source", "Road Access"]),
    features: JSON.stringify(["Income Generating", "Established Plantation", "Scenic Location", "Agricultural Investment"]),
    coordinates: JSON.stringify({ lat: 12.4244, lng: 75.7382 }),
    tags: JSON.stringify(["coffee", "plantation", "coorg", "farmland", "investment", "income-generating"])
  },
  {
    title: "Hill View Resort Property in Coorg",
    slug: "hill-view-resort-property-coorg",
    description: "Beautiful 5-bedroom homestay property with panoramic hill views. Currently operating as a successful resort. Includes restaurant, garden, and recreational facilities.",
    propertyType: "VILLA",
    status: "AVAILABLE",
    price: "18500000",
    bedrooms: 5,
    bathrooms: 6,
    area: 4500,
    featured: true,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80"
    ]),
    amenities: JSON.stringify(["Restaurant", "Garden", "Parking", "Mountain Views", "Recreation Area", "Commercial License"]),
    features: JSON.stringify(["Operating Business", "Tourist Location", "Hill Views", "Revenue Generating"]),
    coordinates: JSON.stringify({ lat: 12.1962, lng: 75.8050 }),
    tags: JSON.stringify(["resort", "homestay", "coorg", "business", "hill-view", "commercial"])
  },
  // Ooty Properties
  {
    title: "Colonial Bungalow in Ooty",
    slug: "colonial-bungalow-ooty",
    description: "Heritage colonial bungalow from the British era, beautifully restored. Features original architecture, fireplace, and sprawling gardens. Located in prime Ooty location.",
    propertyType: "VILLA",
    status: "AVAILABLE",
    price: "8500000",
    bedrooms: 4,
    bathrooms: 3,
    area: 3800,
    featured: true,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80"
    ]),
    amenities: JSON.stringify(["Fireplace", "Garden", "Heritage Architecture", "Parking", "Mountain Views"]),
    features: JSON.stringify(["Heritage Property", "Prime Location", "Restored Architecture", "Tourist Area"]),
    coordinates: JSON.stringify({ lat: 11.4064, lng: 76.6932 }),
    tags: JSON.stringify(["colonial", "heritage", "ooty", "bungalow", "restored", "prime-location"])
  },
  // Munnar Properties
  {
    title: "Tea Estate Bungalow in Munnar",
    slug: "tea-estate-bungalow-munnar",
    description: "Charming bungalow within a working tea estate. Surrounded by tea gardens with misty mountain views. Perfect for nature lovers and tea enthusiasts.",
    propertyType: "VILLA",
    status: "AVAILABLE",
    price: "6200000",
    bedrooms: 3,
    bathrooms: 2,
    area: 2200,
    featured: false,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80"
    ]),
    amenities: JSON.stringify(["Tea Garden Views", "Mountain Views", "Garden", "Parking", "Nature Access"]),
    features: JSON.stringify(["Tea Estate Location", "Scenic Views", "Nature Proximity", "Peaceful Environment"]),
    coordinates: JSON.stringify({ lat: 10.0889, lng: 77.0595 }),
    tags: JSON.stringify(["tea-estate", "munnar", "bungalow", "nature", "mountain-views"])
  },
  // Lonavala Properties
  {
    title: "Modern Villa with Valley Views in Lonavala",
    slug: "modern-villa-valley-views-lonavala",
    description: "Contemporary 3-bedroom villa with stunning valley views. Features infinity pool, modern amenities, and easy access to Mumbai-Pune. Perfect weekend retreat.",
    propertyType: "VILLA",
    status: "AVAILABLE",
    price: "11500000",
    bedrooms: 3,
    bathrooms: 3,
    area: 2800,
    featured: true,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80"
    ]),
    amenities: JSON.stringify(["Infinity Pool", "Valley Views", "Modern Design", "Parking", "Security", "Garden"]),
    features: JSON.stringify(["Valley Views", "Modern Architecture", "Mumbai Proximity", "Weekend Retreat"]),
    coordinates: JSON.stringify({ lat: 18.7649, lng: 73.3952 }),
    tags: JSON.stringify(["modern", "villa", "lonavala", "valley-views", "weekend-retreat", "mumbai-proximity"])
  },
  // Rishikesh Properties
  {
    title: "Riverside Cottage in Rishikesh",
    slug: "riverside-cottage-rishikesh",
    description: "Peaceful cottage on the banks of Ganges. Perfect for yoga retreats, meditation, or spiritual tourism business. Includes meditation hall and garden.",
    propertyType: "VILLA",
    status: "AVAILABLE",
    price: "4200000",
    bedrooms: 2,
    bathrooms: 2,
    area: 1800,
    featured: false,
    images: JSON.stringify([
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80"
    ]),
    amenities: JSON.stringify(["Riverside Location", "Meditation Hall", "Garden", "Parking", "Spiritual Environment"]),
    features: JSON.stringify(["Ganges Proximity", "Spiritual Tourism", "Yoga Retreats", "Peaceful Environment"]),
    coordinates: JSON.stringify({ lat: 30.1367, lng: 78.2932 }),
    tags: JSON.stringify(["riverside", "cottage", "rishikesh", "spiritual", "yoga", "ganges"])
  }
]

const blogPosts = [
  {
    title: "Complete Guide to Buying Holiday Homes in Goa",
    slug: "complete-guide-buying-holiday-homes-goa",
    excerpt: "Everything you need to know about purchasing a holiday home in Goa, from legal requirements to best locations and investment potential.",
    content: `# Complete Guide to Buying Holiday Homes in Goa

Goa has always been a dream destination for holiday home buyers. With its pristine beaches, vibrant culture, and excellent rental potential, it's no wonder that investors are flocking to this coastal paradise.

## Why Choose Goa for Your Holiday Home?

### 1. Strong Rental Market
Goa attracts millions of tourists annually, creating a robust rental market. Properties near popular beaches like Calangute, Baga, and Anjuna can generate substantial rental income.

### 2. Appreciation Potential
Real estate prices in Goa have shown consistent growth over the years. Prime beachfront properties have appreciated significantly, making them excellent long-term investments.

### 3. Lifestyle Benefits
Owning a home in Goa means having access to a relaxed lifestyle, beautiful beaches, and a vibrant expat community.

## Best Locations for Holiday Homes

### North Goa
- **Calangute**: Most popular beach with excellent connectivity
- **Baga**: Vibrant nightlife and restaurant scene
- **Anjuna**: Bohemian vibe with weekly flea markets
- **Candolim**: Upscale area with luxury resorts

### South Goa
- **Colva**: Peaceful beaches with traditional charm
- **Benaulim**: Less crowded with beautiful coastline
- **Palolem**: Scenic beauty with backpacker appeal

## Legal Considerations

### Property Laws
- Non-residents can buy property in Goa
- Agricultural land has restrictions
- Always verify clear title and approvals

### Documentation Required
- PAN Card
- Address Proof
- Income Proof
- NOC from local authorities (if applicable)

## Investment Tips

1. **Location is Key**: Proximity to beach and amenities affects rental potential
2. **Check Infrastructure**: Ensure good road connectivity and utilities
3. **Verify Approvals**: Confirm all necessary permissions are in place
4. **Consider Maintenance**: Factor in upkeep costs for rental properties

## Financing Options

Most banks offer home loans for Goa properties:
- Up to 80% financing available
- Competitive interest rates
- Special schemes for holiday homes

## Conclusion

Buying a holiday home in Goa can be both a lifestyle choice and a smart investment. With proper research and due diligence, you can find the perfect property that serves as both a personal retreat and an income-generating asset.`,
    author: "Avacasa Team",
    category: "Investment Guide",
    tags: JSON.stringify(["goa", "holiday-homes", "investment", "beach-properties", "rental-income"]),
    featuredImage: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    featured: true,
    active: true,
    status: "PUBLISHED",
    publishedAt: new Date()
  },
  {
    title: "Coffee Plantation Investments: A Complete Guide to Coorg Properties",
    slug: "coffee-plantation-investments-coorg-properties",
    excerpt: "Discover the potential of coffee plantation investments in Coorg. Learn about returns, management, and what makes these properties attractive to investors.",
    content: `# Coffee Plantation Investments: A Complete Guide to Coorg Properties

Coorg, known as the "Scotland of India," offers unique investment opportunities in coffee plantations. These properties combine agricultural income with scenic beauty, making them attractive to both investors and lifestyle seekers.

## Understanding Coffee Plantation Investments

### Types of Coffee Grown
- **Arabica**: Premium variety with higher market value
- **Robusta**: Hardy variety with consistent yields
- **Mixed Plantations**: Combination for risk diversification

### Revenue Streams
1. **Coffee Bean Sales**: Primary income source
2. **Tourism**: Plantation tours and homestays
3. **Value-Added Products**: Processed coffee, spices
4. **Timber**: Shade trees provide additional income

## Investment Benefits

### Financial Returns
- Annual yields: 8-12% of investment
- Appreciation: 6-8% annually
- Tax benefits under agricultural income

### Lifestyle Benefits
- Peaceful environment
- Cool climate year-round
- Connection with nature
- Sustainable living

## Key Considerations

### Location Factors
- **Altitude**: 1000-1500m ideal for Arabica
- **Rainfall**: 60-70 inches annually required
- **Soil**: Well-drained, fertile soil essential
- **Accessibility**: Road connectivity important

### Management Options
1. **Self-Management**: Hands-on approach
2. **Caretaker System**: Local management
3. **Cooperative Farming**: Shared resources
4. **Lease to Experts**: Professional management

## Due Diligence Checklist

### Legal Verification
- Clear title documents
- Agricultural land classification
- Water rights confirmation
- Environmental clearances

### Physical Inspection
- Soil quality assessment
- Plant health evaluation
- Infrastructure condition
- Water source verification

## Financial Planning

### Initial Investment
- Land cost: ₹15-50 lakhs per acre
- Development: ₹5-10 lakhs per acre
- Working capital: 6 months expenses

### Ongoing Costs
- Labor: ₹50,000-1,00,000 per acre annually
- Maintenance: ₹20,000-30,000 per acre
- Processing: ₹10,000-15,000 per acre

## Market Outlook

The coffee market in India is growing steadily:
- Domestic consumption increasing
- Export opportunities expanding
- Premium coffee demand rising
- Sustainable farming practices valued

## Conclusion

Coffee plantation investments in Coorg offer a unique blend of financial returns and lifestyle benefits. With proper due diligence and management, these properties can provide steady income while preserving the natural beauty of the Western Ghats.`,
    author: "Avacasa Team",
    category: "Investment",
    tags: JSON.stringify(["coorg", "coffee-plantation", "agricultural-investment", "farmland", "sustainable-farming"]),
    featuredImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    featured: true,
    active: true,
    status: "PUBLISHED",
    publishedAt: new Date()
  },
  {
    title: "Legal Guide: Property Documentation and Compliance in India",
    slug: "legal-guide-property-documentation-compliance-india",
    excerpt: "Essential legal guide covering property documentation, compliance requirements, and due diligence for real estate investments in India.",
    content: `# Legal Guide: Property Documentation and Compliance in India

Understanding legal requirements is crucial for any real estate investment in India. This comprehensive guide covers essential documentation, compliance requirements, and due diligence processes.

## Essential Property Documents

### Primary Documents
1. **Sale Deed**: Primary ownership document
2. **Title Deed**: Establishes ownership chain
3. **Mutation Records**: Revenue department records
4. **Encumbrance Certificate**: Transaction history

### Approval Documents
1. **Building Plan Approval**: Municipal approval
2. **Occupancy Certificate**: Completion certificate
3. **NOC from Fire Department**: Safety clearance
4. **Environmental Clearance**: For large projects

## Due Diligence Process

### Title Verification
- Check ownership chain for 30 years
- Verify seller's right to sell
- Ensure no pending litigation
- Confirm clear and marketable title

### Legal Compliance
- Verify all approvals are in place
- Check compliance with local laws
- Ensure proper land use classification
- Confirm tax payment status

## State-Specific Regulations

### Karnataka (Coorg)
- Agricultural land restrictions
- RERA registration mandatory
- Khata certificate required
- Conversion permissions needed

### Goa
- Special regulations for coastal areas
- CRZ clearances required
- Traditional architecture norms
- Tourism zone regulations

### Tamil Nadu (Ooty)
- Hill station specific rules
- Environmental clearances
- Heritage building regulations
- Tourism development guidelines

## Common Legal Issues

### Title Defects
- Multiple claims on property
- Incomplete documentation
- Disputed ownership
- Encroachment issues

### Approval Violations
- Unauthorized constructions
- Plan deviations
- Missing NOCs
- Environmental violations

## Risk Mitigation Strategies

### Professional Assistance
- Engage qualified lawyers
- Use certified property consultants
- Verify through multiple sources
- Get title insurance if available

### Documentation Review
- Scrutinize all documents
- Verify authenticity
- Check for any conditions
- Ensure proper registration

## Registration Process

### Steps Involved
1. Document preparation
2. Stamp duty payment
3. Registration fee payment
4. Biometric verification
5. Document registration

### Required Presence
- Buyer and seller presence mandatory
- Witnesses required
- Identity proof verification
- Address proof submission

## Tax Implications

### Stamp Duty
- Varies by state (3-8% of property value)
- Additional charges for women buyers
- Online payment options available

### Registration Fees
- Typically 1-2% of property value
- Additional charges may apply
- Receipt preservation important

## RERA Compliance

### Applicability
- Projects above 500 sq meters
- More than 8 apartments
- Ongoing projects included
- Resale market implications

### Benefits
- Standardized documentation
- Timely project completion
- Dispute resolution mechanism
- Transparency in transactions

## Conclusion

Proper legal due diligence is essential for successful property investments. Engaging qualified professionals and following systematic verification processes can help avoid legal complications and ensure secure investments.`,
    author: "Avacasa Team",
    category: "Legal Guide",
    tags: JSON.stringify(["legal-compliance", "property-documentation", "due-diligence", "rera", "real-estate-law"]),
    featuredImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    featured: false,
    active: true,
    status: "PUBLISHED",
    publishedAt: new Date()
  },
  {
    title: "Hill Station Living: Benefits of Owning Property in Ooty and Munnar",
    slug: "hill-station-living-benefits-ooty-munnar-property",
    excerpt: "Explore the lifestyle and investment benefits of owning property in popular hill stations like Ooty and Munnar. Perfect for those seeking cooler climates and natural beauty.",
    content: `# Hill Station Living: Benefits of Owning Property in Ooty and Munnar

Hill stations have always held a special charm for property buyers seeking respite from urban heat and pollution. Ooty and Munnar, two of South India's most popular hill stations, offer unique opportunities for both lifestyle and investment.

## Why Choose Hill Station Properties?

### Climate Benefits
- **Year-round Pleasant Weather**: Temperatures rarely exceed 25°C
- **Escape from Heat**: Perfect summer retreat
- **Clean Air**: Pollution-free environment
- **Natural Beauty**: Surrounded by mountains and greenery

### Health Benefits
- **Stress Relief**: Peaceful environment
- **Better Sleep**: Cool, quiet nights
- **Outdoor Activities**: Trekking, nature walks
- **Wellness Tourism**: Spa and yoga retreats

## Ooty: The Queen of Hill Stations

### Location Advantages
- **Connectivity**: Well-connected by road and rail
- **Infrastructure**: Established tourism infrastructure
- **Amenities**: Schools, hospitals, shopping centers
- **Tourist Appeal**: Year-round visitor influx

### Property Types
1. **Colonial Bungalows**: Heritage properties with character
2. **Modern Villas**: Contemporary designs with amenities
3. **Apartments**: Affordable options in town center
4. **Resort Properties**: Commercial investment opportunities

### Investment Potential
- **Rental Income**: ₹30,000-80,000 per month
- **Appreciation**: 8-12% annually
- **Tourism Growth**: Increasing visitor numbers
- **Infrastructure Development**: Improved connectivity

## Munnar: Tea Garden Paradise

### Unique Features
- **Tea Plantations**: Scenic tea garden views
- **Wildlife**: Proximity to national parks
- **Adventure Tourism**: Trekking, camping opportunities
- **Eco-Tourism**: Sustainable tourism focus

### Property Options
1. **Tea Estate Bungalows**: Authentic plantation experience
2. **Hillside Villas**: Panoramic valley views
3. **Eco-Resorts**: Sustainable tourism properties
4. **Farmhouses**: Agricultural land with homes

### Investment Benefits
- **Growing Tourism**: Increasing international visitors
- **Unique Appeal**: Tea tourism popularity
- **Rental Potential**: ₹25,000-60,000 per month
- **Appreciation**: 6-10% annually

## Lifestyle Considerations

### Pros of Hill Station Living
- **Peaceful Environment**: Away from city chaos
- **Natural Beauty**: Stunning landscapes
- **Community**: Close-knit expatriate communities
- **Activities**: Outdoor recreation opportunities

### Challenges to Consider
- **Monsoon Issues**: Heavy rainfall periods
- **Limited Amenities**: Fewer urban conveniences
- **Connectivity**: Distance from major cities
- **Maintenance**: Higher upkeep in humid conditions

## Investment Strategies

### Buy and Hold
- **Long-term Appreciation**: Steady value growth
- **Personal Use**: Weekend and vacation home
- **Retirement Planning**: Future residence option

### Rental Investment
- **Tourist Rentals**: Short-term vacation rentals
- **Corporate Retreats**: Business accommodation
- **Long-term Leases**: Residential rentals

### Commercial Development
- **Resort Development**: Tourism business
- **Wellness Centers**: Health and spa facilities
- **Adventure Tourism**: Activity-based businesses

## Legal Considerations

### Ooty (Tamil Nadu)
- **Hill Station Regulations**: Special building norms
- **Heritage Restrictions**: Colonial property limitations
- **Environmental Clearances**: Eco-sensitive zone rules

### Munnar (Kerala)
- **Plantation Laws**: Tea estate regulations
- **Tribal Land Issues**: Traditional rights consideration
- **Forest Clearances**: Proximity to protected areas

## Market Trends

### Current Scenario
- **Increased Demand**: Post-pandemic lifestyle changes
- **Remote Work**: Work-from-hill-station trend
- **Wellness Focus**: Health-conscious investments
- **Sustainable Tourism**: Eco-friendly properties preferred

### Future Outlook
- **Infrastructure Improvement**: Better connectivity planned
- **Tourism Growth**: Government promotion initiatives
- **Property Appreciation**: Steady value increase expected
- **Rental Demand**: Growing vacation rental market

## Financing Options

### Home Loans
- **Availability**: Most banks offer hill station loans
- **Interest Rates**: Competitive rates available
- **Loan Amount**: Up to 80% of property value
- **Special Schemes**: Holiday home loan products

## Conclusion

Hill station properties in Ooty and Munnar offer a perfect blend of lifestyle benefits and investment potential. Whether you're seeking a peaceful retreat, rental income, or long-term appreciation, these destinations provide excellent opportunities for discerning property buyers.`,
    author: "Avacasa Team",
    category: "Lifestyle",
    tags: JSON.stringify(["hill-stations", "ooty", "munnar", "lifestyle", "climate", "tourism"]),
    featuredImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    featured: true,
    active: true,
    status: "PUBLISHED",
    publishedAt: new Date()
  },
  {
    title: "Sustainable Tourism and Eco-Friendly Property Investments",
    slug: "sustainable-tourism-eco-friendly-property-investments",
    excerpt: "Learn about the growing trend of sustainable tourism and how eco-friendly property investments can provide both environmental benefits and strong returns.",
    content: `# Sustainable Tourism and Eco-Friendly Property Investments

The tourism industry is undergoing a significant transformation towards sustainability. Eco-friendly property investments are not just environmentally responsible but also financially rewarding, as travelers increasingly seek sustainable accommodation options.

## Understanding Sustainable Tourism

### Definition and Principles
- **Environmental Protection**: Minimizing ecological impact
- **Cultural Preservation**: Respecting local traditions
- **Economic Benefits**: Supporting local communities
- **Long-term Viability**: Ensuring future sustainability

### Market Trends
- **Growing Demand**: 73% of travelers prefer sustainable options
- **Premium Pricing**: Eco-properties command higher rates
- **Government Support**: Policy incentives for green tourism
- **Certification Programs**: Recognized sustainability standards

## Eco-Friendly Property Features

### Energy Efficiency
1. **Solar Power Systems**: Renewable energy generation
2. **LED Lighting**: Energy-efficient illumination
3. **Smart Controls**: Automated energy management
4. **Insulation**: Reduced heating/cooling needs

### Water Conservation
1. **Rainwater Harvesting**: Natural water collection
2. **Greywater Recycling**: Wastewater reuse systems
3. **Low-flow Fixtures**: Water-efficient fittings
4. **Native Landscaping**: Drought-resistant plants

### Sustainable Materials
1. **Local Materials**: Reduced transportation impact
2. **Recycled Content**: Repurposed building materials
3. **Natural Finishes**: Non-toxic, biodegradable options
4. **Sustainable Wood**: Certified forest products

## Investment Benefits

### Financial Returns
- **Higher Occupancy**: Eco-conscious travelers prefer green properties
- **Premium Rates**: 10-15% higher than conventional properties
- **Lower Operating Costs**: Reduced utility expenses
- **Tax Incentives**: Government rebates and credits

### Market Advantages
- **Differentiation**: Stand out in competitive markets
- **Brand Value**: Enhanced reputation and marketing appeal
- **Future-Proofing**: Compliance with evolving regulations
- **Resilience**: Better performance during economic downturns

## Best Locations for Eco-Tourism

### Coorg, Karnataka
- **Coffee Plantations**: Sustainable agriculture tourism
- **Biodiversity**: Rich flora and fauna
- **Tribal Culture**: Indigenous community experiences
- **Adventure Activities**: Nature-based recreation

### Munnar, Kerala
- **Tea Tourism**: Organic plantation experiences
- **Wildlife Sanctuaries**: Eco-tourism opportunities
- **Trekking Trails**: Sustainable adventure tourism
- **Spice Gardens**: Organic farming demonstrations

### Rishikesh, Uttarakhand
- **Spiritual Tourism**: Yoga and meditation retreats
- **River Conservation**: Ganges protection initiatives
- **Organic Farming**: Sustainable agriculture practices
- **Adventure Sports**: Eco-friendly outdoor activities

## Implementation Strategies

### Design Phase
1. **Site Analysis**: Environmental impact assessment
2. **Passive Design**: Natural lighting and ventilation
3. **Green Building Standards**: LEED or GRIHA certification
4. **Landscape Integration**: Harmony with natural surroundings

### Construction Phase
1. **Waste Management**: Construction waste reduction
2. **Local Sourcing**: Support local suppliers
3. **Skilled Labor**: Train workers in green practices
4. **Quality Control**: Ensure sustainable standards

### Operations Phase
1. **Staff Training**: Sustainability education programs
2. **Guest Education**: Environmental awareness initiatives
3. **Monitoring Systems**: Track environmental performance
4. **Continuous Improvement**: Regular sustainability audits

## Certification Programs

### International Standards
- **LEED**: Leadership in Energy and Environmental Design
- **BREEAM**: Building Research Establishment Environmental Assessment
- **Green Key**: International eco-label for tourism
- **EarthCheck**: Sustainability certification for travel and tourism

### Indian Certifications
- **GRIHA**: Green Rating for Integrated Habitat Assessment
- **IGBC**: Indian Green Building Council certification
- **Bureau of Energy Efficiency**: Star rating system
- **Eco-Tourism Certification**: State-specific programs

## Financing Green Projects

### Green Bonds
- **Lower Interest Rates**: Preferential financing terms
- **Longer Tenure**: Extended repayment periods
- **Government Support**: Subsidized interest rates
- **International Funding**: Access to global green finance

### Grants and Incentives
- **Renewable Energy Subsidies**: Solar and wind power incentives
- **Tax Benefits**: Accelerated depreciation and credits
- **Carbon Credits**: Revenue from emission reductions
- **Tourism Promotion**: Government marketing support

## Challenges and Solutions

### Common Challenges
1. **Higher Initial Costs**: Green technologies require investment
2. **Limited Awareness**: Market education needed
3. **Certification Complexity**: Multiple standards and processes
4. **Maintenance Requirements**: Specialized upkeep needs

### Practical Solutions
1. **Phased Implementation**: Gradual green upgrades
2. **Technology Partnerships**: Collaborate with green tech companies
3. **Professional Consultants**: Engage sustainability experts
4. **Community Engagement**: Involve local stakeholders

## Market Outlook

### Growth Projections
- **Sustainable Tourism Market**: 15% annual growth expected
- **Green Building Market**: $24 billion by 2025 in India
- **Eco-Tourism Segment**: 20% of total tourism market
- **Millennial Preferences**: 83% willing to pay more for sustainability

### Future Trends
- **Carbon Neutral Properties**: Net-zero emission targets
- **Circular Economy**: Waste-to-resource systems
- **Smart Technology**: IoT-enabled sustainability monitoring
- **Regenerative Tourism**: Positive environmental impact

## Conclusion

Sustainable tourism and eco-friendly property investments represent the future of the hospitality industry. By embracing green practices, investors can achieve strong financial returns while contributing to environmental conservation and community development. The key is to start with a clear sustainability vision and implement it systematically across all aspects of property development and operations.`,
    author: "Avacasa Team",
    category: "Investment Guide",
    tags: JSON.stringify(["sustainable-tourism", "eco-friendly", "green-building", "environmental", "certification"]),
    featuredImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
    featured: false,
    active: true,
    status: "PUBLISHED",
    publishedAt: new Date()
  }
]

const users = [
  {
    name: "Rajesh Kumar",
    email: "rajesh.kumar@example.com",
    phone: "+91 9876543210",
    active: true,
    verified: true
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "+91 9876543211",
    active: true,
    verified: true
  },
  {
    name: "Amit Patel",
    email: "amit.patel@example.com",
    phone: "+91 9876543212",
    active: true,
    verified: true
  }
]

const contactSubmissions = [
  {
    name: "Suresh Reddy",
    email: "suresh.reddy@example.com",
    phone: "+91 9876543213",
    subject: "Interested in Goa Beach Villa",
    message: "I am interested in the luxury beach villa in North Goa. Could you please provide more details about the property and arrange a site visit?",
    type: "SALES",
    status: "NEW",
    source: "WEBSITE"
  },
  {
    name: "Meera Nair",
    email: "meera.nair@example.com",
    phone: "+91 9876543214",
    subject: "Coffee Plantation Investment Query",
    message: "I would like to know more about coffee plantation investments in Coorg. What are the expected returns and management requirements?",
    type: "SALES",
    status: "IN_PROGRESS",
    source: "WEBSITE"
  },
  {
    name: "Vikram Singh",
    email: "vikram.singh@example.com",
    phone: "+91 9876543215",
    subject: "Legal Documentation Help",
    message: "I need assistance with property documentation for a purchase in Ooty. Can you help with legal verification and registration process?",
    type: "SUPPORT",
    status: "RESOLVED",
    source: "PHONE"
  },
  {
    name: "Anita Desai",
    email: "anita.desai@example.com",
    phone: "+91 9876543216",
    subject: "Partnership Opportunity",
    message: "I represent a real estate investment firm and would like to explore partnership opportunities for property development in hill stations.",
    type: "PARTNERSHIP",
    status: "NEW",
    source: "EMAIL"
  },
  {
    name: "Rohit Gupta",
    email: "rohit.gupta@example.com",
    phone: "+91 9876543217",
    subject: "General Inquiry about Services",
    message: "I would like to understand your complete range of services for property investment and management. Please provide detailed information.",
    type: "GENERAL",
    status: "NEW",
    source: "WEBSITE"
  }
]

const newsletterSubscribers = [
  {
    email: "investor1@example.com",
    name: "Arjun Mehta",
    active: true,
    source: "WEBSITE"
  },
  {
    email: "investor2@example.com",
    name: "Kavya Iyer",
    active: true,
    source: "BLOG"
  },
  {
    email: "investor3@example.com",
    name: "Rohit Gupta",
    active: true,
    source: "SOCIAL_MEDIA"
  },
  {
    email: "investor4@example.com",
    name: "Anita Desai",
    active: true,
    source: "WEBSITE"
  },
  {
    email: "investor5@example.com",
    name: "Kiran Kumar",
    active: true,
    source: "REFERRAL"
  }
]

async function main() {
  console.log('🌱 Starting database seeding...')

  try {
    // Create admin user
    console.log('👤 Creating admin user...')
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    await prisma.admin.upsert({
      where: { email: 'admin@avacasa.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@avacasa.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        active: true
      }
    })

    // Create locations
    console.log('📍 Creating locations...')
    for (const location of locations) {
      await prisma.location.upsert({
        where: { slug: location.slug },
        update: location,
        create: location
      })
    }

    // Get created locations for property association
    const createdLocations = await prisma.location.findMany()
    const locationMap = {}
    createdLocations.forEach(loc => {
      locationMap[loc.slug] = loc.id
    })

    // Create properties
    console.log('🏠 Creating properties...')
    for (const property of properties) {
      let locationId = null
      
      // Determine location based on property slug
      if (property.slug.includes('goa') || property.slug.includes('baga')) {
        locationId = locationMap['goa']
      } else if (property.slug.includes('coorg')) {
        locationId = locationMap['coorg']
      } else if (property.slug.includes('ooty')) {
        locationId = locationMap['ooty']
      } else if (property.slug.includes('munnar')) {
        locationId = locationMap['munnar']
      } else if (property.slug.includes('lonavala')) {
        locationId = locationMap['lonavala']
      } else if (property.slug.includes('rishikesh')) {
        locationId = locationMap['rishikesh']
      }

      // Skip if no location found
      if (!locationId) {
        console.log(`⚠️ Skipping property ${property.slug} - no location found`)
        continue
      }

      await prisma.property.upsert({
        where: { slug: property.slug },
        update: { ...property, locationId },
        create: { ...property, locationId }
      })
    }

    // Update location property counts
    console.log('📊 Updating location property counts...')
    for (const location of createdLocations) {
      const propertyCount = await prisma.property.count({
        where: { locationId: location.id }
      })
      
      await prisma.location.update({
        where: { id: location.id },
        data: { propertyCount }
      })
    }

    // Create blog posts
    console.log('📝 Creating blog posts...')
    for (const post of blogPosts) {
      await prisma.blogPost.upsert({
        where: { slug: post.slug },
        update: post,
        create: post
      })
    }

    // Create users
    console.log('👥 Creating users...')
    for (const user of users) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: user,
        create: user
      })
    }

    // Create contact submissions
    console.log('📞 Creating contact submissions...')
    for (const submission of contactSubmissions) {
      await prisma.contactSubmission.create({
        data: submission
      })
    }

    // Create newsletter subscribers
    console.log('📧 Creating newsletter subscribers...')
    for (const subscriber of newsletterSubscribers) {
      await prisma.emailSubscriber.upsert({
        where: { email: subscriber.email },
        update: subscriber,
        create: subscriber
      })
    }

    // Update site settings
    console.log('⚙️ Updating site settings...')
    const siteSettingsData = {
      siteName: "Avacasa",
      siteDescription: "Your trusted partner for holiday homes, farmland, and investment properties in India's most beautiful destinations.",
      contactEmail: "hello@avacasa.life",
      contactPhone: "+91 9898942841",
      address: "219, 6th cross, 3rd Main Rd, Defence Colony, Bengaluru, Karnataka 560038",
      siteUrl: "https://avacasa.life",
      facebookUrl: "https://facebook.com/avacasa",
      twitterUrl: "https://twitter.com/avacasa",
      instagramUrl: "https://instagram.com/avacasa",
      linkedinUrl: "https://linkedin.com/company/avacasa",
      youtubeUrl: "https://youtube.com/@avacasa",
      whatsappNumber: "+91 9898942841",
      businessHours: "Monday to Saturday: 9:00 AM - 6:00 PM",
      emailSettings: {
        smtpHost: "smtp.gmail.com",
        smtpPort: 587,
        smtpSecure: false,
        mailFrom: "hello@avacasa.life",
        mailFromName: "Avacasa"
      },
      seoSettings: {
        metaTitle: "Avacasa - Holiday Homes, Farmland & Investment Properties",
        metaDescription: "Discover premium holiday homes, coffee plantations, and investment properties in Goa, Coorg, Ooty, and other beautiful destinations across India.",
        metaKeywords: "holiday homes, farmland, investment properties, Goa, Coorg, Ooty, real estate, vacation homes",
        ogImage: "https://avacasa.life/og-image.jpg"
      },
      analyticsSettings: {
        googleAnalyticsId: "",
        facebookPixelId: "",
        enableTracking: true
      }
    }

    await prisma.siteSettings.upsert({
      where: { id: "settings" },
      update: {
        data: JSON.stringify(siteSettingsData)
      },
      create: {
        id: "settings",
        data: JSON.stringify(siteSettingsData)
      }
    })

    console.log('✅ Database seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`- Locations: ${locations.length}`)
    console.log(`- Properties: ${properties.length}`)
    console.log(`- Blog Posts: ${blogPosts.length}`)
    console.log(`- Users: ${users.length}`)
    console.log(`- Contact Submissions: ${contactSubmissions.length}`)
    console.log(`- Newsletter Subscribers: ${newsletterSubscribers.length}`)
    console.log('- Admin User: 1')
    console.log('- Site Settings: Updated')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  }) 