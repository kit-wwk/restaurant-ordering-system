import { NextResponse } from "next/server";
import { headers } from "next/headers";

/**
 * Simple test API endpoint to verify API functionality
 * GET /api/test - Returns basic information about the API request
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const headersList = headers();

  // Log the request details for debugging
  console.log("Test API called:", {
    url: request.url,
    method: request.method,
  });

  return NextResponse.json({
    status: "ok",
    message: "API test endpoint is working correctly",
    timestamp: new Date().toISOString(),
    requestUrl: url.toString(),
    path: url.pathname,
    query: Object.fromEntries(url.searchParams.entries()),
    headers: {
      host: headersList.get("host") || "unknown",
      referer: headersList.get("referer") || "unknown",
      userAgent: headersList.get("user-agent") || "unknown",
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL,
      nextPublicVercelUrl: process.env.NEXT_PUBLIC_VERCEL_URL,
    },
  });
}
