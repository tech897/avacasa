import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// Default settings fallback
const defaultSettings = {
  siteName: "Avacasa",
  siteDescription:
    "Premium Real Estate Platform for Holiday Homes and Investment Properties",
  siteUrl: "https://avacasa.life",
  contactEmail: "shiva@avacasa.life",
  contactPhone: "9390660926",
  address: "Bengaluru, Karnataka, India",
  metaTitle: "Avacasa - Premium Real Estate Platform",
  metaDescription:
    "Discover premium holiday homes, farmlands, and investment properties. Your trusted partner in real estate investment.",
  metaKeywords:
    "real estate, holiday homes, farmland, investment properties, Mumbai, Maharashtra",
  ogImage: "/images/og-image.jpg",
  emailFrom: "noreply@avacasa.life",
  emailHost: "smtp.gmail.com",
  emailPort: "587",
  emailPassword: "",
  adminEmail: "admin@avacasa.life",
  googleAnalyticsId: "",
  facebookPixelId: "",
  trackingEnabled: true,
  maintenanceMode: false,
  allowRegistration: true,
  requireEmailVerification: true,
  maxLoginAttempts: 5,
  sessionTimeout: 24,
  featuredPropertiesLimit: 6,
  blogPostsPerPage: 9,
  enableComments: true,
  moderateComments: true,
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: false,
  primaryColor: "#1f2937",
  secondaryColor: "#3b82f6",
  logoUrl: "/images/logo.png",
  faviconUrl: "/favicon.ico",
  facebookUrl: "",
  twitterUrl: "",
  instagramUrl: "https://www.instagram.com/avacasalife/",
  linkedinUrl: "",
  youtubeUrl: "",
  whatsappNumber: "919898942841",
};

export async function GET() {
  try {
    // Get settings from database using direct MongoDB
    const client = new MongoClient(process.env.DATABASE_URL!);
    await client.connect();
    const db = client.db("avacasa_production");

    const siteSettings = await db
      .collection("site_settings")
      .findOne({ _id: "settings" as any });
    await client.close();

    let settings = defaultSettings;
    if (siteSettings) {
      try {
        const parsedSettings = JSON.parse(siteSettings.data);
        settings = { ...defaultSettings, ...parsedSettings };
      } catch (error) {
        console.error("Failed to parse settings data:", error);
      }
    }

    // Return only public settings (exclude sensitive data like email passwords)
    const publicSettings = {
      ...settings,
      emailPassword: "", // Don't expose email password
      adminEmail: "", // Don't expose admin email
    };

    return NextResponse.json({
      success: true,
      settings: publicSettings,
    });
  } catch (error) {
    console.error("Error fetching public settings:", error);
    return NextResponse.json({
      success: true,
      settings: {
        ...defaultSettings,
        emailPassword: "",
        adminEmail: "",
      },
    });
  }
}
