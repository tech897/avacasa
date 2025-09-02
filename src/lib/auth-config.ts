import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google"
// Removed PrismaAdapter as we migrated to MongoDB
import { getDatabase } from "./db";
import { ObjectId } from "mongodb";

const ALLOWED_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // No adapter needed for MongoDB custom implementation
  providers: [
    // Temporarily commented out Google provider
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
  ],
  callbacks: {
    // Commented out Google-specific authentication logic
    // async signIn({ user, account, profile }) {
    //   // Only allow the specific admin email
    //   if (user.email !== ALLOWED_ADMIN_EMAIL) {
    //     return false
    //   }

    //   // Check if this is the first time signing in
    //   const db = await getDatabase();
    //   const existingAdmin = await db.collection("admins").findOne({
    //     email: user.email
    //   });

    //   if (!existingAdmin) {
    //     // Create admin user on first login
    //     await db.collection("admins").insertOne({
    //       email: user.email,
    //       name: user.name || "Admin User",
    //       password: "", // No password needed for OAuth
    //       role: "SUPER_ADMIN",
    //       createdAt: new Date(),
    //       updatedAt: new Date()
    //     });
    //   } else {
    //     // Update last login
    //     await db.collection("admins").updateOne(
    //       { email: user.email },
    //       { $set: { lastLogin: new Date(), updatedAt: new Date() } }
    //     );
    //   }

    //   return true
    // },
    async jwt({ token, user, account }) {
      if (account && user) {
        // Get admin data from MongoDB
        const db = await getDatabase();
        const admin = await db.collection("admins").findOne({
          email: user.email!
        });

        if (admin) {
          token.adminId = admin._id.toString();
          token.role = admin.role;
          token.isAdmin = true;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.isAdmin) {
        session.user.adminId = token.adminId as string;
        session.user.role = token.role as string;
        session.user.isAdmin = true;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
});

// For backward compatibility, also export the config
export const authOptions = {
  // No adapter needed for MongoDB
  providers: [],
  callbacks: {},
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt" as const,
  },
};