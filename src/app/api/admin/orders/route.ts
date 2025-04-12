import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus, Prisma } from "@prisma/client";

interface TransformedOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface TransformedOrder {
  id: string;
  userId: string;
  customerName: string;
  items: TransformedOrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  promotion?: {
    id: string;
    discountPercentage: number;
    description: string;
    minimumOrder: number;
  };
}

// GET /api/admin/orders - Get all orders with optional filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause based on filters
    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status.toUpperCase() as OrderStatus;
    }

    if (startDate) {
      where.createdAt = {
        ...(where.createdAt as Prisma.DateTimeFilter),
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      where.createdAt = {
        ...(where.createdAt as Prisma.DateTimeFilter),
        lte: new Date(endDate),
      };
    }

    const orders = await prisma.order.findMany({
      where,
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
        promotion: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the response to match frontend expectations
    const transformedOrders: TransformedOrder[] = orders.map((order) => ({
      id: order.id,
      userId: order.userId || "",
      customerName: order.user?.name || order.guestName || "Unknown",
      items: order.items.map((item) => ({
        id: item.id,
        name: item.menuItem.name,
        price: Number(item.price),
        quantity: item.quantity,
      })),
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      total: Number(order.total),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      promotion: order.promotion
        ? {
            id: order.promotion.id,
            discountPercentage: order.promotion.discountPercentage,
            description: order.promotion.description,
            minimumOrder: Number(order.promotion.minimumOrder),
          }
        : undefined,
    }));

    return NextResponse.json(transformedOrders);
  } catch (error: unknown) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/orders - Update order status
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status } = body as {
      orderId: string;
      status: OrderStatus;
    };

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
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
        promotion: true,
      },
    });

    // Transform the response to match frontend expectations
    const transformedOrder: TransformedOrder = {
      id: updatedOrder.id,
      userId: updatedOrder.userId || "",
      customerName:
        updatedOrder.user?.name || updatedOrder.guestName || "Unknown",
      items: updatedOrder.items.map((item) => ({
        id: item.id,
        name: item.menuItem.name,
        price: Number(item.price),
        quantity: item.quantity,
      })),
      subtotal: Number(updatedOrder.subtotal),
      discount: Number(updatedOrder.discount),
      total: Number(updatedOrder.total),
      status: updatedOrder.status,
      createdAt: updatedOrder.createdAt.toISOString(),
      updatedAt: updatedOrder.updatedAt.toISOString(),
      promotion: updatedOrder.promotion
        ? {
            id: updatedOrder.promotion.id,
            discountPercentage: updatedOrder.promotion.discountPercentage,
            description: updatedOrder.promotion.description,
            minimumOrder: Number(updatedOrder.promotion.minimumOrder),
          }
        : undefined,
    };

    return NextResponse.json(transformedOrder);
  } catch (error: unknown) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
