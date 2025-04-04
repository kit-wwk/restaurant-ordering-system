import { NextResponse } from "next/server";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

// Mock orders data - in a real app, this would be in a database
const mockOrders: Order[] = [
  {
    id: "order1",
    userId: "user1",
    customerName: "陳大文",
    items: [
      {
        id: "item1",
        name: "刺身拼盤",
        price: 188,
        quantity: 1,
      },
      {
        id: "item2",
        name: "天婦羅拼盤",
        price: 128,
        quantity: 2,
      },
    ],
    subtotal: 444,
    total: 444,
    status: "completed",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
  },
  {
    id: "order2",
    userId: "user2",
    customerName: "李小明",
    items: [
      {
        id: "item3",
        name: "韓式炸雞",
        price: 98,
        quantity: 1,
      },
    ],
    subtotal: 98,
    total: 98,
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
  },
];

// GET /api/admin/orders - Get all orders with optional filters
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  let filteredOrders = [...mockOrders];

  if (status) {
    filteredOrders = filteredOrders.filter((order) => order.status === status);
  }

  if (startDate) {
    filteredOrders = filteredOrders.filter(
      (order) => new Date(order.createdAt) >= new Date(startDate)
    );
  }

  if (endDate) {
    filteredOrders = filteredOrders.filter(
      (order) => new Date(order.createdAt) <= new Date(endDate)
    );
  }

  // Sort by createdAt in descending order (newest first)
  filteredOrders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json(filteredOrders);
}

// PUT /api/admin/orders - Update order status
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    const order = mockOrders.find((o) => o.id === orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
