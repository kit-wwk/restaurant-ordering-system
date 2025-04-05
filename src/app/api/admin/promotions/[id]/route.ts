import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/promotions/[id] - Get a specific promotion
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const promotion = await prisma.promotion.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!promotion) {
      return NextResponse.json(
        { error: "Promotion not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...promotion,
      minimumOrder: Number(promotion.minimumOrder),
    });
  } catch (error) {
    console.error("Error fetching promotion:", error);
    return NextResponse.json(
      { error: "Failed to fetch promotion" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/promotions/[id] - Update a promotion
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if promotion exists
    const existingPromotion = await prisma.promotion.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingPromotion) {
      return NextResponse.json(
        { error: "Promotion not found" },
        { status: 404 }
      );
    }

    const updatedPromotion = await prisma.promotion.update({
      where: {
        id: params.id,
      },
      data: {
        description,
        discountPercentage,
        minimumOrder,
        isAutoApplied:
          isAutoApplied !== undefined
            ? isAutoApplied
            : existingPromotion.isAutoApplied,
      },
    });

    return NextResponse.json({
      ...updatedPromotion,
      minimumOrder: Number(updatedPromotion.minimumOrder),
    });
  } catch (error) {
    console.error("Error updating promotion:", error);
    return NextResponse.json(
      { error: "Failed to update promotion" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/promotions/[id] - Delete a promotion
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if the promotion is used in any orders
    const ordersWithPromotion = await prisma.order.findMany({
      where: {
        promotionId: params.id,
      },
      select: {
        id: true,
      },
    });

    if (ordersWithPromotion.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete promotion in use",
          message:
            "This promotion is associated with orders and cannot be deleted",
          orderCount: ordersWithPromotion.length,
        },
        { status: 409 }
      );
    }

    await prisma.promotion.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting promotion:", error);
    return NextResponse.json(
      { error: "Failed to delete promotion" },
      { status: 500 }
    );
  }
}
