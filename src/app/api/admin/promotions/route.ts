import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/promotions - Get all promotions
export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform decimal fields to numbers for consistent JSON response
    const transformedPromotions = promotions.map((promotion) => ({
      ...promotion,
      minimumOrder: Number(promotion.minimumOrder),
    }));

    return NextResponse.json(transformedPromotions);
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return NextResponse.json(
      { error: "Failed to fetch promotions" },
      { status: 500 }
    );
  }
}

// POST /api/admin/promotions - Create a new promotion
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { description, discountPercentage, minimumOrder, isAutoApplied } =
      body;

    // Basic validation
    if (
      !description ||
      typeof discountPercentage !== "number" ||
      typeof minimumOrder !== "number"
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get restaurant profile id (assuming there's only one default profile)
    const restaurant = await prisma.restaurantProfile.findFirst({
      select: { id: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant profile not found" },
        { status: 404 }
      );
    }

    const promotion = await prisma.promotion.create({
      data: {
        restaurantId: restaurant.id,
        description,
        discountPercentage,
        minimumOrder,
        isAutoApplied: isAutoApplied || false,
      },
    });

    return NextResponse.json(
      {
        ...promotion,
        minimumOrder: Number(promotion.minimumOrder),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating promotion:", error);
    return NextResponse.json(
      { error: "Failed to create promotion" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/promotions - Delete multiple promotions
export async function DELETE(request: Request) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No promotion IDs provided" },
        { status: 400 }
      );
    }

    // Check if any of the promotions are used in orders
    const ordersWithPromotions = await prisma.order.findMany({
      where: {
        promotionId: {
          in: ids,
        },
      },
      select: {
        id: true,
        promotionId: true,
      },
    });

    if (ordersWithPromotions.length > 0) {
      const usedPromotionIds = [
        ...new Set(ordersWithPromotions.map((order) => order.promotionId)),
      ];
      return NextResponse.json(
        {
          error: "Cannot delete promotions in use",
          message:
            "Some promotions are associated with orders and cannot be deleted",
          usedPromotionIds,
        },
        { status: 409 }
      );
    }

    await prisma.promotion.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting promotions:", error);
    return NextResponse.json(
      { error: "Failed to delete promotions" },
      { status: 500 }
    );
  }
}
