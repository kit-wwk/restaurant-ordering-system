import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// GET /api/admin/restaurant-profile
export async function GET() {
  try {
    const profile = await prisma.restaurantProfile.findFirst({
      include: {
        categories: {
          include: {
            items: true,
          },
        },
        promotions: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Restaurant profile not found" },
        {
          status: 404,
        }
      );
    }

    // Transform categories and items to match frontend expectations
    const transformedProfile = {
      ...profile,
      categories: profile.categories.map((category) => ({
        ...category,
        items: category.items.map((item) => ({
          ...item,
          price: Number(item.price),
          image: item.imageUrl || "/images/default-menu-item.jpg",
          category: category.name,
          isAvailable: true,
        })),
      })),
      promotions: profile.promotions.map((promotion) => ({
        ...promotion,
        minimumOrder: Number(promotion.minimumOrder),
      })),
    };

    return NextResponse.json(transformedProfile);
  } catch (error) {
    console.error("Error fetching restaurant profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
      }
    );
  }
}

// PUT /api/admin/restaurant-profile
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
        }
      );
    }

    const data = await request.json();

    const profile = await prisma.restaurantProfile.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        phone: data.phone,
        email: data.email,
        openingHours: data.openingHours,
        facebook: data.facebook,
        instagram: data.instagram,
        website: data.website,
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
        rating: data.rating,
        totalReviews: data.totalReviews,
        licenseNumber: data.licenseNumber,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating restaurant profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
      }
    );
  }
}
