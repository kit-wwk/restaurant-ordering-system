import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type OrderWithUser = Prisma.OrderGetPayload<{
  include: { user: { select: { name: true } } };
}>;

type BookingWithUser = Prisma.BookingGetPayload<{
  include: { user: { select: { name: true } } };
}>;

// GET /api/admin/dashboard - Get dashboard statistics
export async function GET() {
  try {
    // Get total orders and revenue
    const ordersStats = await prisma.order.aggregate({
      _count: {
        id: true,
      },
      _sum: {
        total: true,
      },
    });

    // Get total bookings
    const bookingsCount = await prisma.booking.count();

    // Get total users
    const usersCount = await prisma.user.count();

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get recent bookings
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: {
        date: "asc",
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // Transform the data to match frontend expectations
    const transformedRecentOrders = recentOrders.map(
      (order: OrderWithUser) => ({
        id: order.id,
        customerName: order.user?.name || order.guestName || "Unknown",
        total: Number(order.total),
        status: order.status.toLowerCase(),
        createdAt: order.createdAt.toISOString(),
      })
    );

    const transformedRecentBookings = recentBookings.map(
      (booking: BookingWithUser) => ({
        id: booking.id,
        customerName: booking.user?.name || booking.guestName || "Unknown",
        date: booking.date.toISOString().split("T")[0],
        time: booking.time.toISOString().split("T")[1].substring(0, 5),
        numberOfPeople: booking.guests,
        status: booking.status.toLowerCase(),
      })
    );

    return NextResponse.json({
      totalOrders: ordersStats._count.id,
      totalRevenue: Number(ordersStats._sum.total || 0),
      totalBookings: bookingsCount,
      totalUsers: usersCount,
      recentOrders: transformedRecentOrders,
      recentBookings: transformedRecentBookings,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
