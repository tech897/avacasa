/**
 * Check Remaining Properties Script
 * 
 * Analyzes the current status of property images and shows what remains to be migrated
 */

require('dotenv').config();

async function checkPropertyStatus() {
  const { PrismaClient } = require('../src/generated/prisma');
  const prisma = new PrismaClient();
  
  console.log('📊 PROPERTY IMAGE STATUS ANALYSIS');
  console.log('='.repeat(80));
  
  try {
    // Get all active properties
    const allProperties = await prisma.property.findMany({
      where: { active: true },
      select: { id: true, slug: true, title: true, images: true, featured: true }
    });
    
    // Analyze image status
    const withImages = [];
    const withoutImages = [];
    
    for (const property of allProperties) {
      const images = property.images ? JSON.parse(property.images) : [];
      if (images.length > 0) {
        withImages.push({ ...property, imageCount: images.length });
      } else {
        withoutImages.push(property);
      }
    }
    
    console.log(`📈 TOTAL PROPERTIES: ${allProperties.length}`);
    console.log(`✅ WITH IMAGES: ${withImages.length}`);
    console.log(`❌ WITHOUT IMAGES: ${withoutImages.length}`);
    console.log(`📊 COMPLETION: ${Math.round((withImages.length / allProperties.length) * 100)}%`);
    
    console.log(`\n🎯 FEATURED PROPERTIES:`);
    const featuredWithImages = withImages.filter(p => p.featured).length;
    const featuredWithoutImages = withoutImages.filter(p => p.featured).length;
    const totalFeatured = featuredWithImages + featuredWithoutImages;
    console.log(`✅ Featured with images: ${featuredWithImages} of ${totalFeatured}`);
    console.log(`❌ Featured without images: ${featuredWithoutImages} of ${totalFeatured}`);
    
    console.log(`\n📸 IMAGE STATISTICS:`);
    const totalImages = withImages.reduce((sum, p) => sum + p.imageCount, 0);
    const avgImages = withImages.length > 0 ? (totalImages / withImages.length).toFixed(1) : 0;
    console.log(`📷 Total images uploaded: ${totalImages}`);
    console.log(`📊 Average images per property: ${avgImages}`);
    
    console.log(`\n📂 GOOGLE DRIVE STATUS:`);
    console.log(`📁 Folders downloaded: 115 of 348 expected`);
    console.log(`❌ Missing folders: ${348 - 115} folders`);
    console.log(`📋 Properties mapped: 92 of 115 folders`);
    console.log(`❌ Unmapped folders: 23 folders`);
    
    console.log(`\n🔍 BREAKDOWN:`);
    console.log(`• Properties updated in last migration: 38`);
    console.log(`• Properties that already had images: ${withImages.length - 38}`);
    console.log(`• Properties still needing images: ${withoutImages.length}`);
    console.log(`• Google Drive folders not yet downloaded: ${348 - 115}`);
    
    console.log(`\n📝 SAMPLE PROPERTIES WITHOUT IMAGES:`);
    withoutImages.slice(0, 10).forEach((prop, index) => {
      console.log(`  ${index + 1}. ${prop.title} (${prop.slug})`);
    });
    if (withoutImages.length > 10) {
      console.log(`  ... and ${withoutImages.length - 10} more properties`);
    }
    
    console.log(`\n🚀 NEXT STEPS:`);
    if (withoutImages.length > 0) {
      console.log(`1. 📥 Download remaining ${348 - 115} Google Drive folders`);
      console.log(`2. 🔄 Run migration again for new folders`);
      console.log(`3. 🎯 ${withoutImages.length} properties still need images`);
    } else {
      console.log(`🎉 All properties have images! Migration complete!`);
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
  }
}

// Run the analysis
if (require.main === module) {
  checkPropertyStatus();
}

module.exports = { checkPropertyStatus }; 