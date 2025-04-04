import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

// GET /api/orders - Get all orders (admin)
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, items } = body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid request body. userId and items array are required." },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.menuItemId || !item.quantity || !item.price) {
        return NextResponse.json(
          { error: "Each item must have menuItemId, quantity, and price." },
          { status: 400 }
        );
      }
    }

    // Calculate total price
    let total = 0;
    const orderItems = items.map(
      (item: { menuItemId: string; quantity: number; price: number }) => {
        const itemTotal = item.quantity * item.price;
        total += itemTotal;
        return {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
        };
      }
    );

    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: "pending", // Set initial status
        items: {
          create: orderItems,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json({ error: "Duplicate order" }, { status: 409 });
      }
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "Referenced user or menu item not found" },
          { status: 404 }
        );
      }
    }
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
