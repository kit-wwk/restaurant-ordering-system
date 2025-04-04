import { NextResponse } from "next/server";
import type { User } from "@/types/user";

// Mock user data - in a real app, this would be in a database
const mockUsers: User[] = [
  {
    id: "1",
    name: "測試用戶",
    email: "user@example.com",
    role: "user",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
  },
  {
    id: "2",
    name: "管理員",
    email: "admin@example.com",
    role: "admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
  },
];

export async function GET() {
  try {
    // In a real app, you would:
    // 1. Check the session cookie or JWT
    // 2. Validate the token
    // 3. Return the user data if valid

    // For demo purposes, we'll return null (no session)
    // To test the admin interface, uncomment the next line
    // return NextResponse.json({ user: mockUsers[1] }) // Return admin user

    return NextResponse.json({ user: null });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
