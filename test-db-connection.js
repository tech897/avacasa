require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('./src/generated/prisma');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔗 Testing database connection...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL preview:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + '...' : 'NOT SET');
    
    console.log('\n📊 Checking database counts...');
    const propertyCount = await prisma.property.count();
    console.log('✅ Property count:', propertyCount);
    
    const locationCount = await prisma.location.count();
    console.log('✅ Location count:', locationCount);
    
    if (propertyCount > 0) {
      const sampleProperty = await prisma.property.findFirst({
        include: { location: true }
      });
      console.log('📦 Sample property:', sampleProperty.title);
      console.log('📍 Sample location:', sampleProperty.location.name);
    }
    
    console.log('\n🎯 Database connection successful!');
    
  } catch (error) {
    console.log('❌ Database error:', error.message);
    console.log('🔍 Error details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
