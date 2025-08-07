require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('./src/generated/prisma');

async function checkDataTypes() {
  const prisma = new PrismaClient();
  
  try {
    const sample = await prisma.property.findFirst();
    console.log('Sample property data types:');
    console.log('Bedrooms value:', sample.bedrooms, typeof sample.bedrooms);
    console.log('Price value:', sample.price, typeof sample.price);
    
    // Check bedroom distribution
    const bedroomCounts = await prisma.property.groupBy({
      by: ['bedrooms'],
      _count: { bedrooms: true },
      where: { active: true },
      orderBy: { bedrooms: 'asc' }
    });
    console.log('\nBedroom distribution:');
    bedroomCounts.forEach(b => {
      console.log(`  ${b.bedrooms} bedrooms: ${b._count.bedrooms} properties`);
    });
    
    // Check some specific bedroom queries
    console.log('\nTesting bedroom queries:');
    const exactMatch = await prisma.property.count({
      where: { bedrooms: 3, active: true }
    });
    console.log(`Exactly 3 bedrooms: ${exactMatch} properties`);
    
    const gteMatch = await prisma.property.count({
      where: { bedrooms: { gte: 3 }, active: true }
    });
    console.log(`3 or more bedrooms: ${gteMatch} properties`);
    
    const allMatch = await prisma.property.count({
      where: { active: true }
    });
    console.log(`Total active properties: ${allMatch}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDataTypes();
