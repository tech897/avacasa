import { PrismaClient } from '@/generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function to safely parse JSON strings
export function safeJsonParse(jsonString: string | null, fallback: any = null) {
  if (!jsonString) return fallback
  try {
    return JSON.parse(jsonString)
  } catch {
    return fallback
  }
}

// Helper function to safely stringify JSON
export function safeJsonStringify(data: any): string {
  try {
    return JSON.stringify(data)
  } catch {
    return '{}'
  }
}

// Database seeding functions
export async function seedDatabase() {
  try {
    // Create default admin user
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    await prisma.admin.upsert({
      where: { email: 'admin@avacasa.com' },
      update: {},
      create: {
        email: 'admin@avacasa.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'SUPER_ADMIN'
      }
    })

    // Create sample locations
    const locations = [
      {
        name: 'Goa',
        slug: 'goa',
        description: 'Beautiful coastal destination with pristine beaches and vibrant culture.',
        image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        coordinates: safeJsonStringify({ lat: 15.2993, lng: 74.1240 }),
        highlights: safeJsonStringify(['Beaches', 'Nightlife', 'Portuguese Architecture', 'Water Sports']),
        amenities: safeJsonStringify([
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
        coordinates: safeJsonStringify({ lat: 12.3375, lng: 75.8069 }),
        highlights: safeJsonStringify(['Coffee Plantations', 'Hill Stations', 'Wildlife', 'Trekking']),
        amenities: safeJsonStringify([
          { name: 'Mountain Views', icon: 'mountain' },
          { name: 'Coffee Tours', icon: 'coffee' },
          { name: 'Trekking', icon: 'hiking' }
        ])
      }
    ]

    for (const location of locations) {
      await prisma.location.upsert({
        where: { slug: location.slug },
        update: location,
        create: location
      })
    }

    console.log('Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
  }
} 