import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

// GET /api/bookings - Get all bookings (admin)
export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create new booking
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      date,
      time,
      guests,
      notes,
      guestName,
      guestEmail,
      guestPhone,
    } = body;

    // Validate required fields
    if (!date || !time || !guests) {
      return NextResponse.json(
        {
          error: "Missing required fields: date, time, and guests are required",
        },
        { status: 400 }
      );
    }

    // If no userId is provided, validate guest information
    if (!userId) {
      if (!guestName || !guestEmail || !guestPhone) {
        return NextResponse.json(
          { error: "Guest bookings require name, email, and phone number." },
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

    // Validate guests number
    if (guests < 1 || guests > 20) {
      return NextResponse.json(
        { error: "Number of guests must be between 1 and 20" },
        { status: 400 }
      );
    }

    // Convert date and time strings to Date objects
    const bookingDate = new Date(date);
    const bookingTime = new Date(time);

    // Validate date is not in the past
    if (bookingDate < new Date()) {
      return NextResponse.json(
        { error: "Booking date cannot be in the past" },
        { status: 400 }
      );
    }

    // Check for existing bookings at the same time
    const existingBooking = await prisma.booking.findFirst({
      where: {
        date: bookingDate,
        time: bookingTime,
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        guestName: !userId ? guestName : undefined,
        guestEmail: !userId ? guestEmail : undefined,
        guestPhone: !userId ? guestPhone : undefined,
        date: bookingDate,
        time: bookingTime,
        guests,
        notes,
        status: "PENDING", // Set initial status (uppercase to match enum)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "Referenced user not found" },
          { status: 404 }
        );
      }
    }
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
