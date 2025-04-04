import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/orders/user/[userId] - Get user's orders
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: params.userId,
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch user orders" },
      { status: 500 }
    );
  }
}
