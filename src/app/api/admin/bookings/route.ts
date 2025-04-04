import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Booking as PrismaBooking } from "@prisma/client";

export interface AdminBooking {
  id: string;
  customerName: string;
  phoneNumber: string;
  date: string;
  time: string;
  numberOfPeople: number;
  status: "confirmed" | "pending" | "cancelled";
}

export async function GET(request: Request) {
  try {
    console.log("Fetching bookings from database...");

    // Get date range from URL parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    console.log("Date range params:", { startDate, endDate });

    // Build the where clause for date filtering
    const where = {
      ...(startDate && endDate
        ? {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }
        : {}),
    };

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    console.log("Found bookings:", bookings);

    // Transform the data to match the expected format
    const formattedBookings = bookings.map(
      (
        booking: PrismaBooking & {
          user: { name: string; phone: string | null };
        }
      ) => {
        console.log("Processing booking:", booking);
        return {
          id: booking.id,
          customerName: booking.user.name,
          phoneNumber: booking.user.phone || "",
          date: booking.date.toISOString().split("T")[0],
          time: booking.time.toISOString().split("T")[1].substring(0, 5),
          numberOfPeople: booking.guests,
          status: booking.status.toLowerCase() as
            | "confirmed"
            | "pending"
            | "cancelled",
        };
      }
    );

    console.log("Formatted bookings:", formattedBookings);
    return NextResponse.json(formattedBookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, date, time, guests, notes } = body;

    // Validate required fields
    if (!userId || !date || !time || !guests) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        date: new Date(date),
        time: new Date(time),
        guests,
        notes,
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status: status.toUpperCase(),
      },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
