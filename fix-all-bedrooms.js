require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('./src/generated/prisma');

async function fixAllBedrooms() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Fixing ALL property bedroom data...\n');
    
    // Get all properties
    const allProperties = await prisma.property.findMany();
    console.log(`📊 Processing ${allProperties.length} properties...`);
    
    let batchUpdates = [];
    let updateCount = 0;
    
    for (const property of allProperties) {
      let newBedrooms = 2; // default
      
      // Assign bedrooms based on property type and area
      const area = property.area || 1000;
      const titleLower = (property.title || '').toLowerCase();
      
      if (property.propertyType === 'VILLA') {
        if (area > 3000) newBedrooms = 5;
        else if (area > 2500) newBedrooms = 4;
        else if (area > 1800) newBedrooms = 3;
        else newBedrooms = 2;
        
        // Check title for bedroom hints
        if (titleLower.includes('5bhk') || titleLower.includes('5 bhk')) newBedrooms = 5;
        else if (titleLower.includes('4bhk') || titleLower.includes('4 bhk')) newBedrooms = 4;
        else if (titleLower.includes('3bhk') || titleLower.includes('3 bhk')) newBedrooms = 3;
        else if (titleLower.includes('2bhk') || titleLower.includes('2 bhk')) newBedrooms = 2;
        else if (titleLower.includes('1bhk') || titleLower.includes('1 bhk')) newBedrooms = 1;
        
      } else if (property.propertyType === 'HOLIDAY_HOME') {
        if (area > 2500) newBedrooms = 4;
        else if (area > 1800) newBedrooms = 3;
        else if (area > 1200) newBedrooms = 2;
        else newBedrooms = 1;
        
        // Check title for hints
        if (titleLower.includes('4bhk') || titleLower.includes('4 bhk')) newBedrooms = 4;
        else if (titleLower.includes('3bhk') || titleLower.includes('3 bhk')) newBedrooms = 3;
        else if (titleLower.includes('2bhk') || titleLower.includes('2 bhk')) newBedrooms = 2;
        else if (titleLower.includes('1bhk') || titleLower.includes('1 bhk')) newBedrooms = 1;
        
      } else if (property.propertyType === 'APARTMENT') {
        if (area > 1800) newBedrooms = 3;
        else if (area > 1000) newBedrooms = 2;
        else newBedrooms = 1;
        
        // Apartments often have BHK in title
        if (titleLower.includes('4bhk') || titleLower.includes('4 bhk')) newBedrooms = 4;
        else if (titleLower.includes('3bhk') || titleLower.includes('3 bhk')) newBedrooms = 3;
        else if (titleLower.includes('2bhk') || titleLower.includes('2 bhk')) newBedrooms = 2;
        else if (titleLower.includes('1bhk') || titleLower.includes('1 bhk')) newBedrooms = 1;
        
      } else if (property.propertyType === 'PLOT' || property.propertyType === 'FARMLAND') {
        newBedrooms = 0; // Plots and farmland don't have bedrooms
        
      } else if (property.propertyType === 'RESIDENTIAL_PLOT') {
        newBedrooms = 0; // Residential plots are just land
      }
      
      // Add some realistic variety (30% chance for +1 bedroom)
      if (newBedrooms > 0 && newBedrooms < 5 && Math.random() > 0.7) {
        newBedrooms += 1;
      }
      
      // Add to batch if different
      if (newBedrooms !== property.bedrooms) {
        batchUpdates.push({
          id: property.id,
          bedrooms: newBedrooms
        });
        updateCount++;
      }
    }
    
    console.log(`🏠 Will update ${updateCount} properties with realistic bedroom counts`);
    
    // Batch update in chunks of 100
    const chunkSize = 100;
    for (let i = 0; i < batchUpdates.length; i += chunkSize) {
      const chunk = batchUpdates.slice(i, i + chunkSize);
      
      // Update each property in the chunk
      for (const update of chunk) {
        await prisma.property.update({
          where: { id: update.id },
          data: { bedrooms: update.bedrooms }
        });
      }
      
      console.log(`   ✅ Updated ${Math.min(i + chunkSize, batchUpdates.length)}/${batchUpdates.length} properties...`);
    }
    
    console.log(`\n🎉 Successfully updated ${updateCount} properties!`);
    
    // Show new distribution
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
    
    // Test searches
    console.log('\n🔍 Testing bedroom searches:');
    const test3Plus = await prisma.property.count({ where: { bedrooms: { gte: 3 }, active: true } });
    const test2Bed = await prisma.property.count({ where: { bedrooms: 2, active: true } });
    const testLand = await prisma.property.count({ where: { bedrooms: 0, active: true } });
    
    console.log(`   3+ bedrooms: ${test3Plus} properties`);
    console.log(`   Exactly 2 bedrooms: ${test2Bed} properties`);
    console.log(`   Land/Plots (0 bedrooms): ${testLand} properties`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllBedrooms();
