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

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // In a real app, you would:
    // 1. Validate the email and password
    // 2. Hash the password and compare with stored hash
    // 3. Create a session or JWT
    // 4. Set secure HTTP-only cookies

    const user = mockUsers.find((u) => u.email === email);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
