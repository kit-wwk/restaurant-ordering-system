import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/menu - Get all menu items
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        items: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    // Transform the data to match frontend expectations
    const transformedCategories = categories.map((category) => ({
      ...category,
      items: category.items.map((item) => ({
        ...item,
        price: Number(item.price),
        image: item.imageUrl || "/images/default-menu-item.jpg",
        category: category.name,
      })),
    }));

    return NextResponse.json(transformedCategories);
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

// POST /api/admin/menu - Create new menu item
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { categoryId, item } = body;

    const newItem = await prisma.menuItem.create({
      data: {
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId: categoryId,
        imageUrl: item.image,
        isAvailable: true,
      },
    });

    return NextResponse.json(newItem);
  } catch (error) {
    console.error("Error creating menu item:", error);
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

    const updatedItem = await prisma.menuItem.update({
      where: {
        id: item.id,
      },
      data: {
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId: categoryId,
        imageUrl: item.image,
        isAvailable: item.isAvailable,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating menu item:", error);
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
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "Missing itemId" }, { status: 400 });
    }

    await prisma.menuItem.delete({
      where: {
        id: itemId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return NextResponse.json(
      { error: "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
