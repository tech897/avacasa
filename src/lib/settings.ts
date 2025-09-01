// Remove MongoDB import - this file is used by client components

export interface SiteSettings {
  // Site Configuration
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;

  // SEO Settings
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;

  // Email Settings
  emailFrom: string;
  emailHost: string;
  emailPort: string;
  emailPassword: string;
  adminEmail: string;

  // Analytics Settings
  googleAnalyticsId: string;
  facebookPixelId: string;
  trackingEnabled: boolean;

  // Security Settings
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  maxLoginAttempts: number;
  sessionTimeout: number;

  // Content Settings
  featuredPropertiesLimit: number;
  blogPostsPerPage: number;
  enableComments: boolean;
  moderateComments: boolean;

  // Notification Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;

  // Theme Settings
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  faviconUrl: string;

  // Social Media
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  whatsappNumber: string;
}

export const defaultSettings: SiteSettings = {
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

// Cache for settings to avoid frequent database queries
let settingsCache: SiteSettings | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    // Check if cache is still valid
    const now = Date.now();
    if (settingsCache && now - cacheTimestamp < CACHE_DURATION) {
      return settingsCache;
    }

    // Try to fetch from API if we're on the client side
    if (typeof window !== "undefined") {
      try {
        const response = await fetch("/api/settings/public");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.settings) {
            settingsCache = data.settings;
            cacheTimestamp = now;
            return data.settings;
          }
        }
      } catch (fetchError) {
        console.warn("Failed to fetch settings from API:", fetchError);
      }
    }

    // Fallback to default settings
    settingsCache = defaultSettings;
    cacheTimestamp = now;
    return defaultSettings;
  } catch (error) {
    console.error("Failed to get site settings:", error);
    return defaultSettings;
  }
}

export async function updateSiteSettings(
  newSettings: Partial<SiteSettings>
): Promise<boolean> {
  try {
    // Note: This function is deprecated in favor of the admin API
    // The admin API should handle settings updates using MongoDB
    console.warn(
      "updateSiteSettings is deprecated. Use the admin API instead."
    );
    return false;
  } catch (error) {
    console.error("Failed to update site settings:", error);
    return false;
  }
}

export function clearSettingsCache(): void {
  settingsCache = null;
  cacheTimestamp = 0;
}

// Helper functions for specific settings
export async function isMaintenanceMode(): Promise<boolean> {
  const settings = await getSiteSettings();
  return settings.maintenanceMode;
}

export async function isTrackingEnabled(): Promise<boolean> {
  const settings = await getSiteSettings();
  return settings.trackingEnabled;
}

export async function getEmailSettings() {
  const settings = await getSiteSettings();
  return {
    from: settings.emailFrom,
    host: settings.emailHost,
    port: parseInt(settings.emailPort),
    password: settings.emailPassword,
    adminEmail: settings.adminEmail,
  };
}

export async function getContentSettings() {
  const settings = await getSiteSettings();
  return {
    featuredPropertiesLimit: settings.featuredPropertiesLimit,
    blogPostsPerPage: settings.blogPostsPerPage,
    enableComments: settings.enableComments,
    moderateComments: settings.moderateComments,
  };
}

export async function getSecuritySettings() {
  const settings = await getSiteSettings();
  return {
    allowRegistration: settings.allowRegistration,
    requireEmailVerification: settings.requireEmailVerification,
    maxLoginAttempts: settings.maxLoginAttempts,
    sessionTimeout: settings.sessionTimeout,
  };
}
