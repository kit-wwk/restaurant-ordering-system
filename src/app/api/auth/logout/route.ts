import { NextResponse } from "next/server";

export async function POST() {
  try {
    // In a real app, you would:
    // 1. Clear the session or invalidate the JWT
    // 2. Clear HTTP-only cookies

    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
