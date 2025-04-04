import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/bookings/user/[userId] - Get user's bookings
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: params.userId,
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch user bookings" },
      { status: 500 }
    );
  }
}
