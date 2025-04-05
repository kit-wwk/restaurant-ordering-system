import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  phone: string | null;
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "電郵地址和密碼為必填" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "電郵地址或密碼錯誤" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "電郵地址或密碼錯誤" },
        { status: 401 }
      );
    }

    // Create response without password
    const userResponse: UserResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
    };

    return NextResponse.json({ user: userResponse });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "登入時發生錯誤" }, { status: 500 });
  }
}
