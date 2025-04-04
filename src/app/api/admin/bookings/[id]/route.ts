import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    const bookingId = params.id;

    const booking = await prisma.booking.update({
      where: { id: bookingId },
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

    // Transform the data to match the expected format
    const formattedBooking = {
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

    return NextResponse.json(formattedBooking);
  } catch (error) {
    console.error("Failed to update booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;

    await prisma.booking.delete({
      where: { id: bookingId },
    });

    return NextResponse.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Failed to delete booking:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
