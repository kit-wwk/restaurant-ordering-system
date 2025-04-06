import { NextResponse } from "next/server";

// GET /api/health - Health check endpoint
export async function GET() {
  console.log("Health check API called");
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL || "not set",
    nextPublicVercelUrl: process.env.NEXT_PUBLIC_VERCEL_URL || "not set",
  });
}
