const { PrismaClient } = require("../src/generated/prisma");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log("🔐 Creating admin user for production...");

    // Get admin details from environment or use defaults
    const adminEmail = process.env.ADMIN_EMAIL || "admin@avacasa.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "AvacasaAdmin2024!";
    const adminName = process.env.ADMIN_NAME || "Avacasa Admin";

    console.log(`📧 Admin Email: ${adminEmail}`);
    console.log(`👤 Admin Name: ${adminName}`);
    console.log(`🔑 Password: ${adminPassword.substring(0, 3)}***`);

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!");
      console.log("🔄 Would you like to update the password? (Y/n)");

      // For production, let's update the password
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      await prisma.admin.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          name: adminName,
          active: true,
          updatedAt: new Date(),
        },
      });

      console.log("✅ Admin user password updated successfully!");
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      const admin = await prisma.admin.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: adminName,
          role: "SUPER_ADMIN",
          active: true,
        },
      });

      console.log("✅ Admin user created successfully!");
      console.log(`📧 Email: ${admin.email}`);
      console.log(`🔐 Role: ${admin.role}`);
    }

    console.log("\n🎯 Admin Login Details:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(
      `🌐 Login URL: ${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/admin/login`
    );
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.log("\n⚠️  IMPORTANT SECURITY NOTES:");
    console.log("1. 🔒 Change the default password after first login");
    console.log("2. 🛡️  Use a strong, unique password for production");
    console.log("3. 🔐 Consider enabling 2FA in the future");
    console.log("4. 📝 Store credentials securely");
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  createAdminUser();
}

module.exports = { createAdminUser };
