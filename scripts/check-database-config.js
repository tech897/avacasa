require("dotenv").config({ path: ".env.local" });

console.log("🔍 Checking database configuration...");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log("❌ DATABASE_URL: Not set");
} else {
  console.log(`✅ DATABASE_URL: ${databaseUrl.substring(0, 30)}...`);

  // Check if database name is included
  if (databaseUrl.includes("/avacasa_production?")) {
    console.log("✅ Database name: avacasa_production (found)");
  } else if (databaseUrl.includes("/?")) {
    console.log(
      '❌ Database name: MISSING! (found "/?" which means no DB name)'
    );
    console.log(
      '🔧 FIX NEEDED: Add database name before the "?" in your connection string'
    );
  } else {
    console.log("⚠️  Database name: Format unclear");
  }

  // Show the expected format
  console.log("\n📝 Your DATABASE_URL should look like:");
  console.log(
    "mongodb+srv://username:password@cluster.mongodb.net/avacasa_production?retryWrites=true&w=majority"
  );
  console.log(
    "                                                   ^^^^^^^^^^^^^^^^^^"
  );
  console.log(
    "                                                   Database name here"
  );
}

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
