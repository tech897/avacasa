require("dotenv").config({ path: ".env.local" });

console.log("☁️  Checking Cloudinary configuration...");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

const cloudinaryVars = {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
    ? "***" + process.env.CLOUDINARY_API_SECRET.slice(-4)
    : undefined,
};

let allGood = true;

for (const [key, value] of Object.entries(cloudinaryVars)) {
  if (!value || value === undefined) {
    console.log(`❌ ${key}: Not set`);
    allGood = false;
  } else {
    console.log(`✅ ${key}: ${value}`);
  }
}

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

if (!allGood) {
  console.log("❌ Cloudinary configuration incomplete!");
  console.log("\n📝 Your .env.local should contain:");
  console.log('CLOUDINARY_CLOUD_NAME="your_cloud_name"');
  console.log('CLOUDINARY_API_KEY="your_api_key"');
  console.log('CLOUDINARY_API_SECRET="your_api_secret"');
} else {
  console.log("✅ Cloudinary configuration looks good!");
}
