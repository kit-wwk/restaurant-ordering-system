import { NextResponse } from "next/server";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalBookings: number;
  totalUsers: number;
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: number;
    status: "pending" | "completed" | "cancelled";
    createdAt: string;
  }>;
  recentBookings: Array<{
    id: string;
    customerName: string;
    date: string;
    time: string;
    numberOfPeople: number;
    status: "pending" | "confirmed" | "cancelled";
  }>;
}

const mockDashboardData: DashboardStats = {
  totalOrders: 156,
  totalRevenue: 23450,
  totalBookings: 89,
  totalUsers: 120,
  recentOrders: [
    {
      id: "1",
      customerName: "陳大文",
      total: 388,
      status: "completed",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    },
    {
      id: "2",
      customerName: "李小明",
      total: 235,
      status: "pending",
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    },
  ],
  recentBookings: [
    {
      id: "1",
      customerName: "黃麗華",
      date: "2024-03-25",
      time: "19:00",
      numberOfPeople: 4,
      status: "confirmed",
    },
    {
      id: "2",
      customerName: "張三",
      date: "2024-03-25",
      time: "20:00",
      numberOfPeople: 2,
      status: "pending",
    },
  ],
};

export async function GET() {
  try {
    // In a real app, you would:
    // 1. Verify admin authentication
    // 2. Query database for real-time statistics
    // 3. Aggregate data from different collections

    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json(mockDashboardData);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
