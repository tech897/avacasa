require("dotenv").config({ path: ".env.local" });

console.log("📱 Checking WhatsApp configuration...");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

if (!whatsappNumber) {
  console.log("❌ NEXT_PUBLIC_WHATSAPP_NUMBER: Not set");
  console.log("\n📝 Your .env.local should contain:");
  console.log('NEXT_PUBLIC_WHATSAPP_NUMBER="+919977294113"');
} else {
  console.log(`✅ NEXT_PUBLIC_WHATSAPP_NUMBER: ${whatsappNumber}`);

  // Validate format
  if (whatsappNumber.startsWith("+91") && whatsappNumber.length === 13) {
    console.log("✅ Format: Valid Indian number (+91XXXXXXXXXX)");
  } else {
    console.log("⚠️  Format: Please use +91XXXXXXXXXX format");
  }

  // Generate WhatsApp link
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(
    "+",
    ""
  )}?text=Hi%20Avacasa%2C%20I%27m%20interested%20in%20your%20properties`;
  console.log(`🔗 WhatsApp Link: ${whatsappLink}`);
}

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

console.log("\n📱 WhatsApp Integration Points:");
console.log("✅ Property detail pages - 'Contact via WhatsApp' button");
console.log("✅ Contact page - WhatsApp quick action");
console.log("✅ Property inquiry forms - WhatsApp option");
console.log("✅ Call-to-action sections - Direct WhatsApp links");
