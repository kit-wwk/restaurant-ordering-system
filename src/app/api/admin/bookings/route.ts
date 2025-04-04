import { NextResponse } from "next/server";

// Mock data for demonstration
const mockBookings = [
  {
    id: "1",
    customerName: "陳大文",
    phoneNumber: "91234567",
    date: "2024-03-20",
    time: "19:00",
    numberOfPeople: 4,
    status: "confirmed",
  },
  {
    id: "2",
    customerName: "李小明",
    phoneNumber: "98765432",
    date: "2024-03-21",
    time: "18:30",
    numberOfPeople: 2,
    status: "pending",
  },
  {
    id: "3",
    customerName: "黃美玲",
    phoneNumber: "94567890",
    date: "2024-03-22",
    time: "20:00",
    numberOfPeople: 6,
    status: "cancelled",
  },
];

export async function GET() {
  return NextResponse.json(mockBookings);
}

export async function POST(request: Request) {
  const body = await request.json();
  // In a real application, you would save this to a database
  return NextResponse.json({ message: "Booking created successfully" });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  // In a real application, you would update this in a database
  return NextResponse.json({ message: "Booking updated successfully" });
}
