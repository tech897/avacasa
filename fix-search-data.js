require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('./src/generated/prisma');

async function fixSearchData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Fixing search data issues...\n');
    
    // Get all properties
    const properties = await prisma.property.findMany({
      take: 20 // Sample first 20
    });
    
    console.log('Current data sample:');
    properties.slice(0, 5).forEach((prop, i) => {
      console.log(`${i+1}. ${prop.title}`);
      console.log(`   Bedrooms: ${prop.bedrooms} (${typeof prop.bedrooms})`);
      console.log(`   Price: ${prop.price} (${typeof prop.price})`);
      console.log(`   Property Type: ${prop.propertyType}`);
      console.log('');
    });
    
    // Fix bedroom data based on property type and size
    const bedroomFixes = [];
    
    for (const property of properties) {
      let newBedrooms = 2; // default
      
      // Assign bedrooms based on property type and area
      const area = property.area || 1000;
      
      if (property.propertyType === 'VILLA') {
        if (area > 2500) newBedrooms = 5;
        else if (area > 2000) newBedrooms = 4;
        else if (area > 1500) newBedrooms = 3;
        else newBedrooms = 2;
      } else if (property.propertyType === 'HOLIDAY_HOME') {
        if (area > 2000) newBedrooms = 4;
        else if (area > 1500) newBedrooms = 3;
        else newBedrooms = 2;
      } else if (property.propertyType === 'APARTMENT') {
        if (area > 1500) newBedrooms = 3;
        else if (area > 1000) newBedrooms = 2;
        else newBedrooms = 1;
      } else if (property.propertyType === 'PLOT' || property.propertyType === 'FARMLAND') {
        newBedrooms = 0; // Plots and farmland don't have bedrooms
      }
      
      // Add some variety
      if (Math.random() > 0.7 && newBedrooms > 1) {
        newBedrooms += 1; // 30% chance to add an extra bedroom
      }
      
      if (newBedrooms !== property.bedrooms) {
        bedroomFixes.push({
          id: property.id,
          title: property.title,
          oldBedrooms: property.bedrooms,
          newBedrooms: newBedrooms,
          area: property.area,
          type: property.propertyType
        });
      }
    }
    
    console.log(`🏠 Will update ${bedroomFixes.length} properties with realistic bedroom counts:`);
    bedroomFixes.slice(0, 10).forEach(fix => {
      console.log(`   ${fix.title}: ${fix.oldBedrooms} → ${fix.newBedrooms} bedrooms (${fix.type}, ${fix.area} sqft)`);
    });
    
    console.log('\n🔧 Applying bedroom fixes...');
    let updated = 0;
    for (const fix of bedroomFixes) {
      await prisma.property.update({
        where: { id: fix.id },
        data: { bedrooms: fix.newBedrooms }
      });
      updated++;
      if (updated % 50 === 0) {
        console.log(`   Updated ${updated}/${bedroomFixes.length} properties...`);
      }
    }
    
    console.log(`✅ Updated ${updated} properties with realistic bedroom counts!`);
    
    // Test the fix
    console.log('\n📊 New bedroom distribution:');
    const newCounts = await prisma.property.groupBy({
      by: ['bedrooms'],
      _count: { bedrooms: true },
      where: { active: true },
      orderBy: { bedrooms: 'asc' }
    });
    newCounts.forEach(b => {
      console.log(`   ${b.bedrooms} bedrooms: ${b._count.bedrooms} properties`);
    });
    
    // Test bedroom search
    const test3Plus = await prisma.property.count({
      where: { bedrooms: { gte: 3 }, active: true }
    });
    console.log(`\n🔍 Properties with 3+ bedrooms: ${test3Plus}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSearchData();
