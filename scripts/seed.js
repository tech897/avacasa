const { PrismaClient } = require('../src/generated/prisma')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Seeding database...')

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const admin = await prisma.admin.upsert({
      where: { email: 'admin@avacasa.com' },
      update: {},
      create: {
        email: 'admin@avacasa.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'SUPER_ADMIN'
      }
    })

    console.log('Created admin user:', admin.email)

    // Create sample locations
    const locations = [
      {
        name: 'Goa',
        slug: 'goa',
        description: 'Beautiful coastal destination with pristine beaches and vibrant culture.',
        image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        coordinates: JSON.stringify({ lat: 15.2993, lng: 74.1240 }),
        highlights: JSON.stringify(['Beaches', 'Nightlife', 'Portuguese Architecture', 'Water Sports']),
        amenities: JSON.stringify([
          { name: 'Beach Access', icon: 'beach' },
          { name: 'Restaurants', icon: 'restaurant' },
          { name: 'Water Sports', icon: 'water' }
        ])
      },
      {
        name: 'Coorg',
        slug: 'coorg',
        description: 'Scotland of India with coffee plantations and misty hills.',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        coordinates: JSON.stringify({ lat: 12.3375, lng: 75.8069 }),
        highlights: JSON.stringify(['Coffee Plantations', 'Hill Stations', 'Wildlife', 'Trekking']),
        amenities: JSON.stringify([
          { name: 'Mountain Views', icon: 'mountain' },
          { name: 'Coffee Tours', icon: 'coffee' },
          { name: 'Trekking', icon: 'hiking' }
        ])
      },
      {
        name: 'Mysore',
        slug: 'mysore',
        description: 'Royal city with magnificent palaces and rich cultural heritage.',
        image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        coordinates: JSON.stringify({ lat: 12.2958, lng: 76.6394 }),
        highlights: JSON.stringify(['Mysore Palace', 'Gardens', 'Silk Sarees', 'Yoga']),
        amenities: JSON.stringify([
          { name: 'Historical Sites', icon: 'landmark' },
          { name: 'Gardens', icon: 'tree' },
          { name: 'Cultural Tours', icon: 'culture' }
        ])
      }
    ]

    for (const location of locations) {
      const createdLocation = await prisma.location.upsert({
        where: { slug: location.slug },
        update: location,
        create: location
      })
      console.log('Created location:', createdLocation.name)
    }

    // Create sample properties
    const goaLocation = await prisma.location.findUnique({ where: { slug: 'goa' } })
    const coorgLocation = await prisma.location.findUnique({ where: { slug: 'coorg' } })

    if (goaLocation && coorgLocation) {
      const properties = [
        {
          title: 'Luxury Beach Villa in North Goa',
          slug: 'luxury-beach-villa-north-goa',
          description: 'A stunning 4-bedroom villa just 100 meters from the pristine beaches of North Goa. Perfect for families and groups looking for a luxurious getaway.',
          price: '15000000',
          locationId: goaLocation.id,
          propertyType: 'VILLA',
          bedrooms: 4,
          bathrooms: 3,
          area: 2500,
          floors: 2,
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          ]),
          amenities: JSON.stringify([
            { name: 'Private Pool', icon: 'pool' },
            { name: 'Beach Access', icon: 'beach' },
            { name: 'Garden', icon: 'garden' }
          ]),
          features: JSON.stringify([
            'Sea View',
            'Fully Furnished',
            'Parking',
            'Security'
          ]),
          coordinates: JSON.stringify({ lat: 15.5937, lng: 73.7570 }),
          featured: true
        },
        {
          title: 'Coffee Plantation Farmhouse in Coorg',
          slug: 'coffee-plantation-farmhouse-coorg',
          description: 'Experience the serene beauty of Coorg with this charming farmhouse set amidst lush coffee plantations.',
          aboutProject: 'Blue Hills is a premium coffee plantation project located in the heart of Coorg, Karnataka. Spread across 50 acres of pristine coffee estates, this project offers a unique opportunity to own a piece of paradise. The farmhouse is designed to blend seamlessly with the natural landscape, offering breathtaking views of the Western Ghats. Each unit comes with its own coffee plantation, ensuring a steady income from coffee production while you enjoy the tranquil lifestyle.',
          price: '8500000',
          locationId: coorgLocation.id,
          propertyType: 'FARMLAND',
          bedrooms: 3,
          bathrooms: 2,
          area: 5000,
          floors: 1,
          plotSize: '2 acres',
          constructionStatus: 'Ready to Move',
          possessionDate: new Date('2024-06-01'),
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
          ]),
          amenities: JSON.stringify([
            { name: 'Coffee Plantation', icon: 'coffee' },
            { name: 'Mountain Views', icon: 'mountain' },
            { name: 'Organic Farm', icon: 'leaf' },
            { name: 'Swimming Pool', icon: 'pool' },
            { name: 'Garden', icon: 'garden' },
            { name: 'Security', icon: 'security' },
            { name: 'Parking', icon: 'parking' },
            { name: 'WiFi', icon: 'wifi' }
          ]),
          features: JSON.stringify([
            'Mountain View',
            'Coffee Plantation',
            'Organic Farming',
            'Nature Trails',
            'Private Garden',
            'Covered Parking',
            'Modern Kitchen',
            'Fireplace'
          ]),
          unitConfiguration: JSON.stringify({
            '2 BHK Farmhouse': {
              area: '1200 sqft',
              price: '₹65 Lakhs',
              availability: 'Available'
            },
            '3 BHK Farmhouse': {
              area: '1800 sqft',
              price: '₹85 Lakhs',
              availability: 'Available'
            },
            '4 BHK Villa': {
              area: '2500 sqft',
              price: '₹1.2 Crores',
              availability: 'Sold Out'
            }
          }),
          legalApprovals: JSON.stringify([
            {
              name: 'RERA Approval',
              status: 'Approved',
              authority: 'Karnataka RERA',
              date: '2023-01-15'
            },
            {
              name: 'Environmental Clearance',
              status: 'Approved',
              authority: 'Karnataka State Pollution Control Board',
              date: '2022-11-20'
            },
            {
              name: 'Panchayat Approval',
              status: 'Approved',
              authority: 'Madikeri Taluk Panchayat',
              date: '2022-10-10'
            }
          ]),
          registrationCosts: JSON.stringify({
            stampDuty: '5% of property value',
            registrationFee: '1% of property value',
            legalCharges: '₹50,000',
            otherCharges: '₹25,000',
            total: '₹5,75,000 (approx.)'
          }),
          propertyManagement: JSON.stringify({
            company: 'Coorg Estate Management',
            services: ['Property Maintenance', 'Coffee Plantation Management', 'Guest House Services', 'Security'],
            contact: '+91 9876543210',
            charges: '8% of rental income'
          }),
          financialReturns: JSON.stringify({
            expectedROI: '12-15% per annum',
            rentalYield: '6-8% per annum',
            appreciationRate: '8-10% per annum',
            paybackPeriod: '8-10 years'
          }),
          investmentBenefits: JSON.stringify([
            'Steady rental income from coffee plantation',
            'High appreciation potential in Coorg',
            'Tax benefits under agricultural income',
            'Weekend getaway for family',
            'Organic coffee production income',
            'Tourism rental potential'
          ]),
          nearbyInfrastructure: JSON.stringify({
            educational: [
              { name: 'Coorg Public School', distance: '5 km', type: 'CBSE School' },
              { name: 'St. Joseph\'s College', distance: '12 km', type: 'Degree College' }
            ],
            healthcare: [
              { name: 'Coorg District Hospital', distance: '8 km', type: 'Government Hospital' },
              { name: 'Manipal Hospital', distance: '15 km', type: 'Private Hospital' }
            ],
            transportation: [
              { name: 'Madikeri Bus Stand', distance: '10 km', type: 'Bus Terminal' },
              { name: 'Mysore Airport', distance: '120 km', type: 'Airport' },
              { name: 'Mysore Railway Station', distance: '118 km', type: 'Railway Station' }
            ],
            shopping: [
              { name: 'Madikeri Market', distance: '10 km', type: 'Local Market' },
              { name: 'Coffee Curing Works', distance: '3 km', type: 'Coffee Processing' },
              { name: 'Spice Gardens', distance: '5 km', type: 'Spice Market' }
            ]
          }),
          emiOptions: JSON.stringify({
            bankPartners: ['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'],
            interestRates: '8.5% - 12% per annum',
            maxTenure: '20 years',
            processingFee: '0.5% of loan amount'
          }),
          metaTitle: 'Coffee Plantation Farmhouse in Coorg - Blue Hills Estate',
          metaDescription: 'Own a premium coffee plantation farmhouse in Coorg with stunning mountain views, organic farming, and excellent ROI potential. Ready to move property with all approvals.',
          tags: JSON.stringify(['coorg', 'coffee plantation', 'farmhouse', 'investment', 'mountain view', 'organic farming']),
          coordinates: JSON.stringify({ lat: 12.3375, lng: 75.8069 }),
          featured: true
        }
      ]

      for (const property of properties) {
        const createdProperty = await prisma.property.upsert({
          where: { slug: property.slug },
          update: property,
          create: property
        })
        console.log('Created property:', createdProperty.title)
      }
    }

    console.log('Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 