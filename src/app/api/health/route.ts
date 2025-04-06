import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type DatabaseHealth = {
  status: string;
  connectionTime?: string;
  message?: string;
  tables: Record<string, number>;
};

// GET /api/health - Health check endpoint
export async function GET() {
  console.log("Health check API called");

  // Basic health information
  const healthInfo = {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL || "not set",
    nextPublicVercelUrl: process.env.NEXT_PUBLIC_VERCEL_URL || "not set",
    database: {
      status: "unknown",
      tables: {},
    } as DatabaseHealth,
  };

  try {
    // Check database connectivity
    const startTime = Date.now();

    // Check for essential tables and their record counts
    const tables: Record<string, number> = {
      categories: await prisma.category.count(),
      menuItems: await prisma.menuItem.count(),
    };

    // Check if the Restaurant model exists in the schema
    try {
      // @ts-expect-error - We're checking if this model exists
      tables.restaurants = (await prisma.restaurant?.count()) || 0;
    } catch {
      // Restaurant model may not exist, set to 0
      tables.restaurants = 0;
    }

    // Check users table
    try {
      tables.users = await prisma.user.count();
    } catch {
      // User model may not exist, set to 0
      tables.users = 0;
    }

    const queryTime = Date.now() - startTime;

    // Update the health info with database status
    healthInfo.database = {
      status: "connected",
      connectionTime: `${queryTime}ms`,
      tables,
    };
  } catch (error) {
    console.error("Database health check failed:", error);
    healthInfo.database = {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unknown database error",
      tables: {},
    };

    // Still return 200 OK since the API itself is working
    // Just indicate database issues in the response
  }

  return NextResponse.json(healthInfo);
}
