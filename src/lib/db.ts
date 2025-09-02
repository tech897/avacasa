import { MongoClient, Db } from 'mongodb'

// MongoDB connection singleton
let client: MongoClient | null = null
let db: Db | null = null

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (client && db) {
    return { client, db }
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined')
  }

  client = new MongoClient(process.env.DATABASE_URL)
  await client.connect()
  db = client.db('avacasa_production')

  return { client, db }
}

export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase()
  return db
}

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

// Legacy export for compatibility (will be replaced gradually)
// export const prisma = null // Removed to prevent TypeScript errors

// Database seeding functions for MongoDB
export async function seedDatabase() {
  try {
    const { db } = await connectToDatabase()
    
    // Create default admin user
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    await db.collection('admins').updateOne(
      { email: 'admin@avacasa.com' },
      {
        $set: {
          email: 'admin@avacasa.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'SUPER_ADMIN',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )

    // Create sample locations
    const locations = [
      {
        name: 'Goa',
        slug: 'goa',
        description: 'Beautiful coastal destination with pristine beaches and vibrant culture.',
        image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 15.2993, lng: 74.1240 },
        highlights: ['Beaches', 'Nightlife', 'Portuguese Architecture', 'Water Sports'],
        amenities: [
          { name: 'Beach Access', icon: 'beach' },
          { name: 'Restaurants', icon: 'restaurant' },
          { name: 'Water Sports', icon: 'water' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Coorg',
        slug: 'coorg',
        description: 'Scotland of India with coffee plantations and misty hills.',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 12.3375, lng: 75.8069 },
        highlights: ['Coffee Plantations', 'Hill Stations', 'Wildlife', 'Trekking'],
        amenities: [
          { name: 'Mountain Views', icon: 'mountain' },
          { name: 'Coffee Tours', icon: 'coffee' },
          { name: 'Trekking', icon: 'hiking' }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    for (const location of locations) {
      await db.collection('locations').updateOne(
        { slug: location.slug },
        { $set: location },
        { upsert: true }
      )
    }

    console.log('Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}