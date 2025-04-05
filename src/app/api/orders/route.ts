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
    const { userId, items, guestName, guestEmail, guestPhone } = body;

    console.log("Received order request:", {
      userId,
      guestInfo: { guestName, guestEmail, guestPhone },
      itemsCount: items?.length,
    });

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid request body. items array is required." },
        { status: 400 }
      );
    }

    // If no userId is provided, validate guest information
    if (!userId) {
      if (!guestName || !guestEmail || !guestPhone) {
        return NextResponse.json(
          { error: "Guest orders require name, email, and phone number." },
          { status: 400 }
        );
      }
    } else {
      // Verify user exists if userId is provided
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!user) {
        console.error("User not found:", userId);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    // Validate each item
    for (const item of items) {
      if (!item.menuItemId || !item.quantity || !item.price) {
        return NextResponse.json(
          { error: "Each item must have menuItemId, quantity, and price." },
          { status: 400 }
        );
      }

      // Verify menu item exists
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
        select: { id: true },
      });

      if (!menuItem) {
        console.error("Menu item not found:", item.menuItemId);
        return NextResponse.json(
          { error: `Menu item not found: ${item.menuItemId}` },
          { status: 404 }
        );
      }
    }

    // Calculate total price
    let total = 0;
    const orderItems = items.map(
      (item: { menuItemId: string; quantity: number; price: number }) => {
        const itemTotal = Number(item.quantity) * Number(item.price);
        total += itemTotal;
        return {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
        };
      }
    );

    console.log("Creating order:", {
      userId,
      guestInfo: userId ? null : { guestName, guestEmail, guestPhone },
      total,
      itemsCount: orderItems.length,
    });

    const order = await prisma.order.create({
      data: {
        userId,
        guestName: !userId ? guestName : undefined,
        guestEmail: !userId ? guestEmail : undefined,
        guestPhone: !userId ? guestPhone : undefined,
        total,
        status: "PENDING",
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

    console.log("Order created successfully:", order.id);
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
