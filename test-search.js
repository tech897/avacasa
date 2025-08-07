require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('./src/generated/prisma');

async function testSearch() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing search functionality...\n');
    
    // Test 1: Basic search with "villa"
    console.log('1. Searching for "villa" in title/description:');
    const villaSearch = await prisma.property.findMany({
      where: {
        OR: [
          { title: { contains: 'villa' } },
          { description: { contains: 'villa' } },
        ],
        status: 'AVAILABLE',
        active: true
      },
      include: { location: true },
      take: 5
    });
    console.log(`   Found ${villaSearch.length} properties with "villa"`);
    villaSearch.forEach(p => console.log(`   - ${p.title}`));
    
    // Test 2: Location search for "Goa"
    console.log('\n2. Searching for properties in "Goa":');
    const goaSearch = await prisma.property.findMany({
      where: {
        location: {
          name: { contains: 'Goa' }
        },
        status: 'AVAILABLE',
        active: true
      },
      include: { location: true },
      take: 5
    });
    console.log(`   Found ${goaSearch.length} properties in Goa`);
    goaSearch.forEach(p => console.log(`   - ${p.title} (${p.location.name})`));
    
    // Test 3: Property type search
    console.log('\n3. Searching for VILLA property type:');
    const villaTypeSearch = await prisma.property.findMany({
      where: {
        propertyType: 'VILLA',
        status: 'AVAILABLE',
        active: true
      },
      include: { location: true },
      take: 5
    });
    console.log(`   Found ${villaTypeSearch.length} VILLA properties`);
    villaTypeSearch.forEach(p => console.log(`   - ${p.title} (${p.propertyType})`));
    
    // Test 4: Bedroom search
    console.log('\n4. Searching for properties with 3+ bedrooms:');
    const bedroomSearch = await prisma.property.findMany({
      where: {
        bedrooms: { gte: 3 },
        status: 'AVAILABLE',
        active: true
      },
      include: { location: true },
      take: 5
    });
    console.log(`   Found ${bedroomSearch.length} properties with 3+ bedrooms`);
    bedroomSearch.forEach(p => console.log(`   - ${p.title} (${p.bedrooms} bedrooms)`));
    
    // Test 5: Check sample property data structure
    console.log('\n5. Sample property data structure:');
    const sampleProperty = await prisma.property.findFirst({
      include: { location: true }
    });
    if (sampleProperty) {
      console.log('   Sample property structure:');
      console.log(`   - Title: ${sampleProperty.title}`);
      console.log(`   - Property Type: ${sampleProperty.propertyType}`);
      console.log(`   - Bedrooms: ${sampleProperty.bedrooms}`);
      console.log(`   - Location: ${sampleProperty.location.name}`);
      console.log(`   - Status: ${sampleProperty.status}`);
      console.log(`   - Active: ${sampleProperty.active}`);
      console.log(`   - Description preview: ${sampleProperty.description?.substring(0, 100)}...`);
    }
    
    // Test 6: Check what property types exist
    console.log('\n6. Available property types:');
    const propertyTypes = await prisma.property.groupBy({
      by: ['propertyType'],
      _count: {
        propertyType: true
      },
      where: {
        status: 'AVAILABLE',
        active: true
      }
    });
    propertyTypes.forEach(type => {
      console.log(`   - ${type.propertyType}: ${type._count.propertyType} properties`);
    });
    
  } catch (error) {
    console.error('❌ Search test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSearch();
