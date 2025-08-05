import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { NextRequest } from "next/server";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  (() => {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "JWT_SECRET environment variable is required in production"
      );
    }
    return "dev-secret-key-only-for-development";
  })();

export interface AdminPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface UserPayload {
  id: string;
  email: string;
  name?: string;
}

// Admin Authentication
export async function authenticateAdmin(email: string, password: string) {
  try {
    const admin = await prisma.admin.findUnique({
      where: { email, active: true },
    });

    if (!admin) {
      return { success: false, error: "Invalid credentials" };
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return { success: false, error: "Invalid credentials" };
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return {
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  } catch (error) {
    console.error("Admin authentication error:", error);
    return { success: false, error: "Authentication failed" };
  }
}

// User Authentication
export async function authenticateUser(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email, active: true },
    });

    if (!user || !user.password) {
      return { success: false, error: "Invalid credentials" };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return { success: false, error: "Invalid credentials" };
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  } catch (error) {
    console.error("User authentication error:", error);
    return { success: false, error: "Authentication failed" };
  }
}

// Register User
export async function registerUser(
  email: string,
  password: string,
  name?: string
) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        provider: "email",
      },
    });

    // Track user registration
    await trackUserActivity(user.id, "USER_REGISTER", null, { email, name });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  } catch (error) {
    console.error("User registration error:", error);
    return { success: false, error: "Registration failed" };
  }
}

// Verify JWT Token
export function verifyToken(token: string): AdminPayload | UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload | UserPayload;
  } catch {
    return null;
  }
}

// Get Admin from Request
export async function getAdminFromRequest(
  request: NextRequest
): Promise<AdminPayload | null> {
  try {
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("admin-token")?.value;

    if (!token) return null;

    const payload = verifyToken(token) as AdminPayload;
    if (!payload || !("role" in payload)) return null;

    // Verify admin still exists and is active
    const admin = await prisma.admin.findUnique({
      where: { id: payload.id, active: true },
    });

    return admin ? payload : null;
  } catch {
    return null;
  }
}

// Get User from Request
export async function getUserFromRequest(
  request: NextRequest
): Promise<UserPayload | null> {
  try {
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("user-token")?.value;

    if (!token) return null;

    const payload = verifyToken(token) as UserPayload;
    if (!payload || "role" in payload) return null;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.id, active: true },
    });

    return user ? payload : null;
  } catch {
    return null;
  }
}

// Track User Activity
export async function trackUserActivity(
  userId: string | null,
  action: string,
  resource?: string | null,
  metadata?: any,
  request?: NextRequest
) {
  try {
    const ipAddress =
      request?.headers.get("x-forwarded-for") ||
      request?.headers.get("x-real-ip") ||
      "unknown";

    const userAgent = request?.headers.get("user-agent") || "unknown";
    const referrer = request?.headers.get("referer") || null;

    await prisma.userActivity.create({
      data: {
        userId,
        action: action as any,
        resource,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress,
        userAgent,
        referrer,
      },
    });
  } catch (error) {
    console.error("Error tracking user activity:", error);
  }
}

// Track Page View
export async function trackPageView(
  path: string,
  userId?: string | null,
  request?: NextRequest
) {
  try {
    const ipAddress =
      request?.headers.get("x-forwarded-for") ||
      request?.headers.get("x-real-ip") ||
      "unknown";

    const userAgent = request?.headers.get("user-agent") || "unknown";
    const referrer = request?.headers.get("referer") || null;

    await prisma.pageView.create({
      data: {
        path,
        userId,
        ipAddress,
        userAgent,
        referrer,
      },
    });
  } catch (error) {
    console.error("Error tracking page view:", error);
  }
}
