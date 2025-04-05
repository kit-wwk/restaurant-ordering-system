import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/admin/restaurant-profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.address || !data.phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate opening hours format
    if (data.openingHours && typeof data.openingHours !== "object") {
      return NextResponse.json(
        { error: "Invalid opening hours format" },
        { status: 400 }
      );
    }

    // Update or create profile
    const profile = await prisma.restaurantProfile.upsert({
      where: {
        id: data.id || "default", // Use default ID if not provided
      },
      update: {
        name: data.name,
        description: data.description,
        address: data.address,
        phone: data.phone,
        email: data.email,
        openingHours: data.openingHours,
        facebook: data.facebook,
        instagram: data.instagram,
        logoUrl: data.logoUrl,
        bannerUrl: data.bannerUrl,
        maxBookingDays: data.maxBookingDays,
        maxBookingPerSlot: data.maxBookingPerSlot,
        maxTableSize: data.maxTableSize,
        currency: data.currency,
        taxRate: data.taxRate,
        serviceCharge: data.serviceCharge,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
      },
      create: {
        id: "default",
        name: data.name,
        description: data.description || "",
        address: data.address,
        phone: data.phone,
        email: data.email,
        openingHours: data.openingHours || {},
        facebook: data.facebook,
        instagram: data.instagram,
        logoUrl: data.logoUrl,
        bannerUrl: data.bannerUrl,
        maxBookingDays: data.maxBookingDays || 14,
        maxBookingPerSlot: data.maxBookingPerSlot || 10,
        maxTableSize: data.maxTableSize || 12,
        currency: data.currency || "HKD",
        taxRate: data.taxRate || 0,
        serviceCharge: data.serviceCharge || 0,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
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
