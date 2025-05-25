const { PrismaClient } = require('../src/generated/prisma')

const prisma = new PrismaClient()

const sampleRatings = [
  {
    rating: 5,
    review: "Absolutely stunning property! The location is perfect and the amenities are top-notch. Would definitely recommend to anyone looking for a luxury holiday home.",
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    verified: true,
    helpful: 12,
    status: "APPROVED"
  },
  {
    rating: 4,
    review: "Great property with excellent facilities. The only minor issue was the Wi-Fi connectivity, but overall a fantastic experience.",
    name: "Rajesh Kumar",
    email: "rajesh.k@email.com",
    verified: true,
    helpful: 8,
    status: "APPROVED"
  },
  {
    rating: 5,
    review: "Perfect for a weekend getaway! The property exceeded our expectations. Clean, well-maintained, and the staff was very helpful.",
    name: "Anita Desai",
    email: "anita.desai@email.com",
    verified: false,
    helpful: 15,
    status: "APPROVED"
  },
  {
    rating: 3,
    review: "Decent property but could use some improvements. The location is good but the maintenance needs attention.",
    name: "Vikram Singh",
    email: "vikram.singh@email.com",
    verified: true,
    helpful: 3,
    status: "PENDING",
    adminNotes: "Need to follow up on maintenance issues mentioned"
  },
  {
    rating: 2,
    review: "Not satisfied with the service. The property was not as described in the listing.",
    name: "Anonymous User",
    verified: false,
    helpful: 1,
    status: "FLAGGED",
    adminNotes: "Investigate claims about property description mismatch"
  },
  {
    rating: 5,
    review: "Excellent investment opportunity! The farmland has great potential and the documentation process was smooth.",
    name: "Suresh Patel",
    email: "suresh.patel@email.com",
    verified: true,
    helpful: 20,
    status: "APPROVED"
  },
  {
    rating: 4,
    review: "Beautiful hill station property. Perfect for retirement planning. The scenic views are breathtaking.",
    name: "Meera Nair",
    email: "meera.nair@email.com",
    verified: true,
    helpful: 7,
    status: "APPROVED"
  },
  {
    rating: 1,
    review: "Terrible experience. Would not recommend.",
    name: "Angry Customer",
    verified: false,
    helpful: 0,
    status: "REJECTED",
    adminNotes: "Spam review - no specific details provided"
  }
]

async function addSampleRatings() {
  try {
    console.log('🌱 Adding sample ratings...')

    // Get all properties
    const properties = await prisma.property.findMany({
      select: { id: true, title: true }
    })

    if (properties.length === 0) {
      console.log('❌ No properties found. Please run the main seeding script first.')
      return
    }

    console.log(`📍 Found ${properties.length} properties`)

    // Add ratings for different properties
    for (let i = 0; i < sampleRatings.length; i++) {
      const rating = sampleRatings[i]
      const property = properties[i % properties.length] // Cycle through properties

      const createdRating = await prisma.rating.create({
        data: {
          ...rating,
          propertyId: property.id,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        }
      })

      console.log(`✅ Added rating for "${property.title}" by ${rating.name} (${rating.rating} stars)`)
    }

    console.log('🎉 Sample ratings added successfully!')

  } catch (error) {
    console.error('❌ Error adding sample ratings:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addSampleRatings() 