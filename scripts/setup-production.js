const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function setupProduction() {
  try {
    console.log('🚀 Setting up production database...\n');
    
    // Test database connection
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');
    
    // Check if tables exist
    console.log('🔍 Checking database schema...');
    try {
      const properties = await prisma.property.count();
      const locations = await prisma.location.count();
      const ratings = await prisma.rating.count();
      
      console.log(`📊 Current data count:`);
      console.log(`   Properties: ${properties}`);
      console.log(`   Locations: ${locations}`);
      console.log(`   Ratings: ${ratings}\n`);
      
      if (properties === 0) {
        console.log('💡 No properties found. Run: npm run import-csv');
      }
      
      if (ratings === 0) {
        console.log('💡 No ratings found. Run: node scripts/add-sample-ratings.js');
      }
      
    } catch (error) {
      console.log('⚠️  Database schema not found. Run: npx prisma db push\n');
    }
    
    console.log('🎉 Production setup check complete!');
    
  } catch (error) {
    console.error('❌ Production setup failed:', error.message);
    
    if (error.message.includes('database')) {
      console.log('\n💡 Next steps:');
      console.log('1. Create a PostgreSQL database (Neon/Supabase)');
      console.log('2. Set DATABASE_URL in Vercel environment variables');
      console.log('3. Run: npx prisma db push');
      console.log('4. Run: npm run import-csv');
    }
  } finally {
    await prisma.$disconnect();
  }
}

setupProduction(); 