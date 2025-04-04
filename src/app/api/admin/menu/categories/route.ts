import { NextResponse } from "next/server";
import type { Category } from "@/types/restaurant";

// Import the mock menu data from the parent menu API
import { mockMenu } from "../route";

// POST /api/admin/menu/categories - Create new category
export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    const newCategory: Category = {
      id: `cat${Date.now()}`,
      name,
      items: [],
    };

    mockMenu.push(newCategory);
    return NextResponse.json(newCategory);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/menu/categories - Update category
export async function PUT(request: Request) {
  try {
    const { id, name } = await request.json();

    const category = mockMenu.find((c) => c.id === id);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    category.name = name;
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/menu/categories - Delete category
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing category id" },
        { status: 400 }
      );
    }

    const index = mockMenu.findIndex((c) => c.id === id);
    if (index === -1) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    mockMenu.splice(index, 1);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
