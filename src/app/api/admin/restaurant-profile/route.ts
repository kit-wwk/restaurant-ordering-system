import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/authConfig";

// GET /api/admin/restaurant-profile
export async function GET() {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await prisma.restaurantProfile.findFirst();
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching restaurant profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurant profile" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/restaurant-profile
export async function PUT(request: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const profile = await prisma.restaurantProfile.upsert({
      where: { id: data.id || "default" },
      update: data,
      create: {
        ...data,
        id: "default",
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating restaurant profile:", error);
    return NextResponse.json(
      { error: "Failed to update restaurant profile" },
      { status: 500 }
    );
  }
}
