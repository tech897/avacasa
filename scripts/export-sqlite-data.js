const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

// Create Prisma client for SQLite
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.SQLITE_DATABASE_URL || "file:./prisma/dev.db",
    },
  },
});

async function exportData() {
  try {
    console.log("🚀 Starting SQLite data export...");

    const exportData = {};

    // Export all tables in the correct order (respecting foreign key dependencies)
    console.log("📊 Exporting Locations...");
    exportData.locations = await prisma.location.findMany();

    console.log("🏠 Exporting Properties...");
    exportData.properties = await prisma.property.findMany();

    console.log("👥 Exporting Admins...");
    exportData.admins = await prisma.admin.findMany();

    console.log("👤 Exporting Users...");
    exportData.users = await prisma.user.findMany();

    console.log("🔑 Exporting User Sessions...");
    exportData.userSessions = await prisma.userSession.findMany();

    console.log("📈 Exporting User Activities...");
    exportData.userActivities = await prisma.userActivity.findMany();

    console.log("❤️ Exporting User Favorites...");
    exportData.userFavorites = await prisma.userFavorite.findMany();

    console.log("⭐ Exporting Ratings...");
    exportData.ratings = await prisma.rating.findMany();

    console.log("📧 Exporting Email Subscribers...");
    exportData.emailSubscribers = await prisma.emailSubscriber.findMany();

    console.log("❓ Exporting Inquiries...");
    exportData.inquiries = await prisma.inquiry.findMany();

    console.log("📝 Exporting Blog Posts...");
    exportData.blogPosts = await prisma.blogPost.findMany();

    console.log("📮 Exporting Contact Submissions...");
    exportData.contactSubmissions = await prisma.contactSubmission.findMany();

    console.log("⚙️ Exporting Site Settings...");
    exportData.siteSettings = await prisma.siteSettings.findMany();

    console.log("📊 Exporting Page Views...");
    exportData.pageViews = await prisma.pageView.findMany();

    console.log("🔍 Exporting Search Queries...");
    exportData.searchQueries = await prisma.searchQuery.findMany();

    // Create exports directory if it doesn't exist
    const exportsDir = path.join(process.cwd(), "exports");
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Save to JSON file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `sqlite-export-${timestamp}.json`;
    const filepath = path.join(exportsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));

    // Print summary
    console.log("\n✅ Export completed successfully!");
    console.log(`📁 File saved to: ${filepath}`);
    console.log("\n📊 Export Summary:");
    Object.entries(exportData).forEach(([table, data]) => {
      console.log(`   ${table}: ${data.length} records`);
    });

    console.log("\n🔄 Next steps:");
    console.log("1. Set up your MongoDB database");
    console.log("2. Update your DATABASE_URL in .env.local");
    console.log("3. Run: npm run import-to-mongodb");
  } catch (error) {
    console.error("❌ Export failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
