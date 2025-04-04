import { NextResponse } from "next/server";

// Mock data for demonstration
const mockUsers = [
  {
    id: "1",
    username: "admin",
    email: "admin@example.com",
    role: "admin",
    status: "active",
    lastLogin: "2024-03-20 10:30:00",
  },
  {
    id: "2",
    username: "staff1",
    email: "staff1@example.com",
    role: "staff",
    status: "active",
    lastLogin: "2024-03-19 15:45:00",
  },
  {
    id: "3",
    username: "user1",
    email: "user1@example.com",
    role: "user",
    status: "inactive",
    lastLogin: "2024-03-18 09:20:00",
  },
];

export async function GET() {
  return NextResponse.json(mockUsers);
}

export async function POST(request: Request) {
  const body = await request.json();
  // In a real application, you would save this to a database
  return NextResponse.json({ message: "User created successfully" });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  // In a real application, you would update this in a database
  return NextResponse.json({ message: "User updated successfully" });
}
