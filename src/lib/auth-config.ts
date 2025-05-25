import { NextAuthOptions } from "next-auth"
// import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./db"

const ALLOWED_ADMIN_EMAIL = "akashsharma90099@gmail.com"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
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
    //   const existingAdmin = await prisma.admin.findUnique({
    //     where: { email: user.email }
    //   })

    //   if (!existingAdmin) {
    //     // Create admin user on first login
    //     await prisma.admin.create({
    //       data: {
    //         email: user.email,
    //         name: user.name || "Admin User",
    //         password: "", // No password needed for OAuth
    //         role: "SUPER_ADMIN"
    //       }
    //     })
    //   } else {
    //     // Update last login
    //     await prisma.admin.update({
    //       where: { email: user.email },
    //       data: { lastLogin: new Date() }
    //     })
    //   }

    //   return true
    // },
    async jwt({ token, user, account }) {
      if (account && user) {
        // Get admin data
        const admin = await prisma.admin.findUnique({
          where: { email: user.email! }
        })
        
        if (admin) {
          token.adminId = admin.id
          token.role = admin.role
          token.isAdmin = true
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.isAdmin) {
        session.user.adminId = token.adminId as string
        session.user.role = token.role as string
        session.user.isAdmin = true
      }
      return session
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
} 