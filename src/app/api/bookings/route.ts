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
      numberOfPeople,
      notes,
      guestName,
      guestEmail,
      guestPhone,
    } = body;

    // Validate required fields
    if (!date || !time || !numberOfPeople) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: date, time, and number of people are required",
        },
        { status: 400 }
      );
    }

    // If no userId is provided, validate guest information
    if (!userId) {
      if (!guestName || !guestPhone) {
        return NextResponse.json(
          { error: "訪客預訂需要提供姓名和電話" },
          { status: 400 }
        );
      }

      // Validate phone number format
      if (!/^[0-9]{8}$/.test(guestPhone)) {
        return NextResponse.json(
          { error: "請輸入有效的8位電話號碼" },
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

    // Validate number of people
    if (numberOfPeople < 1 || numberOfPeople > 10) {
      return NextResponse.json(
        { error: "人數必須在1至10人之間" },
        { status: 400 }
      );
    }

    // Convert date and time strings to Date objects
    const bookingDate = new Date(date);
    // Parse time string (HH:mm) into hours and minutes
    const [hours, minutes] = time.split(":").map(Number);

    // Combine date and time for comparison
    const bookingDateTime = new Date(
      bookingDate.getFullYear(),
      bookingDate.getMonth(),
      bookingDate.getDate(),
      hours,
      minutes
    );

    // Validate date and time is not in the past
    const now = new Date();
    if (bookingDateTime < now) {
      return NextResponse.json(
        { error: "預訂時間不能是過去的時間" },
        { status: 400 }
      );
    }

    // Check for existing bookings at the same time
    const existingBooking = await prisma.booking.findFirst({
      where: {
        date: bookingDate,
        time: bookingDateTime,
      },
    });

    if (existingBooking) {
      return NextResponse.json({ error: "此時段已被預訂" }, { status: 409 });
    }

    const booking = await prisma.booking.create({
      data: {
        date: bookingDate,
        time: bookingDateTime,
        guests: numberOfPeople,
        notes: notes || "",
        userId,
        guestName,
        guestEmail,
        guestPhone,
        status: "PENDING",
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
      // Add more specific Prisma error handling
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }
    // If it's a regular Error object, return its message
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `預訂失敗: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "預訂失敗，請稍後再試" },
      { status: 500 }
    );
  }
}
