import { NextResponse } from "next/server";
import type { MenuItem, Category } from "@/types/restaurant";

// Mock data - in a real app, this would be in a database
export const mockMenu: Category[] = [
  {
    id: "cat1",
    name: "日式料理",
    items: [
      {
        id: "item1",
        name: "刺身拼盤",
        description: "新鮮三文魚、吞拿魚、帶子刺身",
        price: 188,
        image: "/images/sashimi.jpg",
        category: "日式料理",
        isAvailable: true,
      },
      {
        id: "item2",
        name: "天婦羅拼盤",
        description: "炸蝦、蔬菜天婦羅",
        price: 128,
        image: "/images/tempura.jpg",
        category: "日式料理",
        isAvailable: true,
      },
    ],
  },
  {
    id: "cat2",
    name: "亞洲美食",
    items: [
      {
        id: "item3",
        name: "韓式炸雞",
        description: "香脆韓式炸雞配特製醬料",
        price: 98,
        image: "/images/korean-chicken.jpg",
        category: "亞洲美食",
        isAvailable: true,
      },
    ],
  },
];

// GET /api/admin/menu - Get all menu items
export async function GET() {
  return NextResponse.json(mockMenu);
}

// POST /api/admin/menu - Create new menu item
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { categoryId, item } = body;

    const category = mockMenu.find((c) => c.id === categoryId);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const newItem: MenuItem = {
      id: `item${Date.now()}`,
      ...item,
      category: category.name,
      isAvailable: true,
    };

    category.items.push(newItem);
    return NextResponse.json(newItem);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/menu - Update menu item
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { categoryId, item } = body;

    const category = mockMenu.find((c) => c.id === categoryId);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const itemIndex = category.items.findIndex((i) => i.id === item.id);
    if (itemIndex === -1) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    category.items[itemIndex] = { ...category.items[itemIndex], ...item };
    return NextResponse.json(category.items[itemIndex]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/menu - Delete menu item
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const itemId = searchParams.get("itemId");

    if (!categoryId || !itemId) {
      return NextResponse.json(
        { error: "Missing categoryId or itemId" },
        { status: 400 }
      );
    }

    const category = mockMenu.find((c) => c.id === categoryId);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    category.items = category.items.filter((item) => item.id !== itemId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
