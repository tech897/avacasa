const { PrismaClient } = require('../src/generated/prisma')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding sample data...')

  // Create sample locations
  const locations = await Promise.all([
    prisma.location.upsert({
      where: { slug: 'goa' },
      update: {},
      create: {
        name: 'Goa',
        slug: 'goa',
        description: 'Discover beautiful holiday homes in India\'s premier beach destination. From luxurious villas near the coast to serene farmhouses inland, Goa offers the perfect blend of beach life and cultural richness.',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        coordinates: JSON.stringify({ lat: 15.2993, lng: 74.1240 }),
        highlights: JSON.stringify(['Pristine Beaches', 'Vibrant Nightlife', 'Portuguese Architecture', 'Water Sports', 'Beach Shacks', 'Cultural Festivals']),
        amenities: JSON.stringify([]),
        featured: true,
        propertyCount: 0,
        active: true
      }
    }),
    prisma.location.upsert({
      where: { slug: 'coorg' },
      update: {},
      create: {
        name: 'Coorg',
        slug: 'coorg',
        description: 'Escape to the Scotland of India with our collection of hill station properties. Surrounded by coffee plantations and misty mountains, Coorg offers the perfect retreat from city life.',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        coordinates: JSON.stringify({ lat: 12.3375, lng: 75.8069 }),
        highlights: JSON.stringify(['Coffee Plantations', 'Misty Mountains', 'Cool Climate', 'Trekking Trails', 'Waterfalls', 'Spice Gardens']),
        amenities: JSON.stringify([]),
        featured: true,
        propertyCount: 0,
        active: true
      }
    }),
    prisma.location.upsert({
      where: { slug: 'mysore' },
      update: {},
      create: {
        name: 'Mysore',
        slug: 'mysore',
        description: 'Experience royal heritage with our curated selection of properties in the cultural capital of Karnataka. From palace-view homes to heritage farmhouses, discover the grandeur of Mysore.',
        image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        coordinates: JSON.stringify({ lat: 12.2958, lng: 76.6394 }),
        highlights: JSON.stringify(['Mysore Palace', 'Royal Heritage', 'Silk Weaving', 'Yoga Capital', 'Chamundi Hills', 'Cultural Festivals']),
        amenities: JSON.stringify([]),
        featured: true,
        propertyCount: 0,
        active: true
      }
    })
  ])

  console.log('Created locations:', locations.map(l => l.name))

  // Create sample properties
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        title: 'Luxury Villa with Private Pool in North Goa',
        slug: 'luxury-villa-north-goa',
        description: 'Stunning 3-bedroom villa with private pool, just 5 minutes from Anjuna Beach. Perfect for holidays and rental income with modern amenities.',
        price: '2500000',
        locationId: locations[0].id, // Goa
        propertyType: 'VILLA',
        bedrooms: 3,
        bathrooms: 3,
        area: 2200,
        floors: 2,
        images: JSON.stringify(['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80']),
        amenities: JSON.stringify([
          { name: 'Private Pool', icon: 'pool' },
          { name: 'Garden', icon: 'garden' },
          { name: 'Parking', icon: 'parking' },
          { name: 'WiFi', icon: 'wifi' },
          { name: 'Air Conditioning', icon: 'ac' }
        ]),
        features: JSON.stringify(['Sea View', 'Furnished']),
        coordinates: JSON.stringify({ lat: 15.5937, lng: 73.7516 }),
        status: 'AVAILABLE',
        featured: true,
        views: 245,
        active: true
      }
    }),
    prisma.property.create({
      data: {
        title: 'Coorg Coffee Estate Farmhouse',
        slug: 'coorg-coffee-estate-farmhouse',
        description: 'Beautiful 2-bedroom farmhouse surrounded by coffee plantations in the heart of Coorg. Ideal for nature lovers and weekend getaways.',
        price: '1800000',
        locationId: locations[1].id, // Coorg
        propertyType: 'FARMLAND',
        bedrooms: 2,
        bathrooms: 2,
        area: 3500,
        floors: 1,
        images: JSON.stringify(['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80']),
        amenities: JSON.stringify([
          { name: 'Coffee Estate', icon: 'coffee' },
          { name: 'Mountain View', icon: 'mountain' },
          { name: 'Organic Garden', icon: 'garden' },
          { name: 'Fireplace', icon: 'fireplace' }
        ]),
        features: JSON.stringify(['Mountain View', 'Eco-friendly']),
        coordinates: JSON.stringify({ lat: 12.3375, lng: 75.8069 }),
        status: 'AVAILABLE',
        featured: false,
        views: 156,
        active: true
      }
    }),
    prisma.property.create({
      data: {
        title: 'Modern Holiday Home in Mysore',
        slug: 'modern-holiday-home-mysore',
        description: 'Contemporary 4-bedroom holiday home near Mysore Palace. Perfect blend of modern comfort and traditional charm.',
        price: '3200000',
        locationId: locations[2].id, // Mysore
        propertyType: 'HOLIDAY_HOME',
        bedrooms: 4,
        bathrooms: 3,
        area: 2800,
        floors: 2,
        images: JSON.stringify(['https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80']),
        amenities: JSON.stringify([
          { name: 'Modern Kitchen', icon: 'kitchen' },
          { name: 'Terrace', icon: 'terrace' },
          { name: 'Study Room', icon: 'study' },
          { name: 'Parking', icon: 'parking' }
        ]),
        features: JSON.stringify(['Palace View', 'Heritage Location']),
        coordinates: JSON.stringify({ lat: 12.2958, lng: 76.6394 }),
        status: 'AVAILABLE',
        featured: true,
        views: 203,
        active: true
      }
    })
  ])

  console.log('Created properties:', properties.map(p => p.title))

  // Update property counts for locations
  for (const location of locations) {
    const count = await prisma.property.count({
      where: { locationId: location.id, active: true }
    })
    await prisma.location.update({
      where: { id: location.id },
      data: { propertyCount: count }
    })
  }

  // Create sample blog posts
  const blogPosts = await Promise.all([
    prisma.blogPost.create({
      data: {
        title: 'Top 5 Holiday Home Destinations in South India',
        slug: 'top-5-holiday-home-destinations-south-india',
        excerpt: 'Discover the most sought-after locations for holiday homes in South India, from beach destinations to hill stations.',
        content: `# Top 5 Holiday Home Destinations in South India

South India offers some of the most beautiful and diverse landscapes for holiday home investments. From pristine beaches to misty mountains, here are our top 5 destinations:

## 1. Goa - The Beach Paradise
Goa remains the top choice for holiday homes with its beautiful beaches, vibrant culture, and excellent rental potential.

## 2. Coorg - The Scotland of India
Known for its coffee plantations and cool climate, Coorg offers a perfect retreat from city life.

## 3. Mysore - The Cultural Capital
Rich in heritage and culture, Mysore provides a unique blend of tradition and modernity.

## 4. Wayanad - Nature's Bounty
With its spice plantations and wildlife sanctuaries, Wayanad is perfect for nature lovers.

## 5. Ooty - The Queen of Hill Stations
Famous for its tea gardens and colonial charm, Ooty offers excellent investment opportunities.

Each of these destinations offers unique advantages for holiday home investments, from rental income potential to personal enjoyment.`,
        author: 'Admin User',
        category: 'Real Estate',
        tags: JSON.stringify(['Holiday Homes', 'Investment', 'South India', 'Real Estate']),
        featuredImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        featured: true,
        status: 'PUBLISHED',
        views: 1250,
        publishedAt: new Date()
      }
    }),
    prisma.blogPost.create({
      data: {
        title: 'Investment Guide: Farmland vs Holiday Homes',
        slug: 'investment-guide-farmland-vs-holiday-homes',
        excerpt: 'A comprehensive comparison of farmland and holiday home investments to help you make the right choice.',
        content: `# Investment Guide: Farmland vs Holiday Homes

When it comes to real estate investment, both farmland and holiday homes offer unique advantages. Here's a detailed comparison:

## Farmland Investment
- **Pros**: Steady appreciation, agricultural income, tax benefits
- **Cons**: Requires agricultural knowledge, weather dependent

## Holiday Home Investment
- **Pros**: Rental income, personal use, tourism growth
- **Cons**: Seasonal demand, maintenance costs

## Which is Right for You?
The choice depends on your investment goals, risk tolerance, and personal preferences.`,
        author: 'Admin User',
        category: 'Investment',
        tags: JSON.stringify(['Investment', 'Farmland', 'Holiday Homes', 'Guide']),
        featuredImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        featured: false,
        status: 'PUBLISHED',
        views: 890,
        publishedAt: new Date()
      }
    })
  ])

  console.log('Created blog posts:', blogPosts.map(p => p.title))

  console.log('Sample data seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 