import { NextResponse } from "next/server";
import { mockBookings } from "../route";
import type { AdminBooking } from "../route";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    const bookingId = params.id;

    const booking = mockBookings.find((b: AdminBooking) => b.id === bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    booking.status = status as AdminBooking["status"];
    return NextResponse.json(booking);
  } catch (error) {
    console.error("Failed to update booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
