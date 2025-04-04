import { NextResponse } from "next/server";
import type { TableBooking } from "@/types/user";

// Mock bookings data - in a real app, this would be in a database
const mockBookings: TableBooking[] = [
  {
    id: "1",
    userId: "1",
    date: "2024-03-25",
    time: "19:00",
    numberOfPeople: 4,
    status: "confirmed",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: "2",
    userId: "1",
    date: "2024-03-26",
    time: "18:30",
    numberOfPeople: 2,
    status: "pending",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
  },
  {
    id: "3",
    userId: "1",
    date: "2024-03-24",
    time: "20:00",
    numberOfPeople: 6,
    status: "cancelled",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: "4",
    userId: "1",
    date: "2024-03-27",
    time: "19:30",
    numberOfPeople: 3,
    status: "confirmed",
    createdAt: new Date().toISOString(), // Just now
  },
];

export async function GET() {
  try {
    // In a real app, you would:
    // 1. Validate the user's session/token
    // 2. Query the database for the user's bookings

    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({ bookings: mockBookings });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { date, time, numberOfPeople } = await request.json();

    // In a real app, you would:
    // 1. Validate the user's session/token
    // 2. Validate the booking data
    // 3. Check table availability
    // 4. Create the booking in the database

    const newBooking: TableBooking = {
      id: (mockBookings.length + 1).toString(),
      userId: "1", // In a real app, this would come from the authenticated user
      date,
      time,
      numberOfPeople,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    mockBookings.push(newBooking);

    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({ booking: newBooking });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
