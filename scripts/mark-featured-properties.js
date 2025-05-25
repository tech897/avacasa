const { PrismaClient } = require('../src/generated/prisma')

const prisma = new PrismaClient()

async function markFeaturedProperties() {
  try {
    console.log('Checking featured properties...')

    const featuredCount = await prisma.property.count({
      where: { featured: true }
    })
    
    console.log('Featured properties count:', featuredCount)
    
    if (featuredCount === 0) {
      console.log('No featured properties found. Marking some properties as featured...')
      
      // Get first 3 properties and mark them as featured
      const properties = await prisma.property.findMany({
        take: 3
      })
      
      if (properties.length > 0) {
        await prisma.property.updateMany({
          where: {
            id: {
              in: properties.map(p => p.id)
            }
          },
          data: {
            featured: true
          }
        })
        console.log('✅ Marked', properties.length, 'properties as featured')
        
        // Show which properties were marked as featured
        properties.forEach(property => {
          console.log(`- ${property.title}`)
        })
      } else {
        console.log('❌ No properties found in database')
        console.log('Please run the seed script first: npm run seed')
      }
    } else {
      console.log('✅ Featured properties already exist')
    }

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  }
}

markFeaturedProperties()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 