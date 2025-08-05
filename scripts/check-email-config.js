require("dotenv").config({ path: ".env.local" });

console.log("🔍 Checking email configuration...");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

const requiredVars = {
  MAIL_FROM: process.env.MAIL_FROM,
  MAIL_APP_PASSWORD: process.env.MAIL_APP_PASSWORD
    ? "***" + process.env.MAIL_APP_PASSWORD.slice(-4)
    : undefined,
  MAIL_HOST: process.env.MAIL_HOST || "smtp.gmail.com",
  MAIL_PORT: process.env.MAIL_PORT || "587",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
};

let allGood = true;

for (const [key, value] of Object.entries(requiredVars)) {
  if (!value || value === undefined) {
    console.log(`❌ ${key}: Not set`);
    allGood = false;
  } else {
    console.log(`✅ ${key}: ${value}`);
  }
}

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

if (!allGood) {
  console.log("❌ Email configuration incomplete!");
  console.log("\n📝 Your .env.local should contain:");
  console.log('MAIL_FROM="your-email@gmail.com"');
  console.log('MAIL_APP_PASSWORD="your-16-char-app-password"');
  console.log('MAIL_HOST="smtp.gmail.com"');
  console.log('MAIL_PORT="587"');
  console.log('ADMIN_EMAIL="admin@avacasa.com"');
} else {
  console.log("✅ Email configuration looks good!");
}
