import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export interface AdminBooking {
  id: string;
  customerName: string;
  phoneNumber: string;
  date: string;
  time: string;
  numberOfPeople: number;
  notes: string;
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
  isGuest: boolean;
}

export async function GET(request: Request) {
  try {
    // Get pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    // Get total count for pagination
    const totalCount = await prisma.booking.count();

    // Get paginated bookings
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
      },
      orderBy: {
        date: "asc",
      },
      skip,
      take: pageSize,
    });

    const formattedBookings = bookings.map((booking) => {
      return {
        id: booking.id,
        customerName: booking.user ? booking.user.name : booking.guestName,
        phoneNumber: booking.user
          ? booking.user.phone
          : booking.guestPhone || "",
        date: booking.date.toISOString().split("T")[0],
        time: booking.time.toISOString().split("T")[1].substring(0, 5),
        numberOfPeople: booking.guests,
        notes: booking.notes || "",
        status: booking.status,
        isGuest: !booking.user,
      };
    });

    return NextResponse.json({
      bookings: formattedBookings,
      pagination: {
        total: totalCount,
        pageSize,
        currentPage: page,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
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

    // Validate status value
    const validStatuses = ["CONFIRMED", "PENDING", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        status,
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

    // Transform the response to match the expected format
    const formattedBooking = {
      id: booking.id,
      customerName: booking.user ? booking.user.name : booking.guestName,
      phoneNumber: booking.user ? booking.user.phone : booking.guestPhone || "",
      date: booking.date.toISOString().split("T")[0],
      time: booking.time.toISOString().split("T")[1].substring(0, 5),
      numberOfPeople: booking.guests,
      notes: booking.notes || "",
      status: booking.status,
      isGuest: !booking.user,
    };

    return NextResponse.json(formattedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
