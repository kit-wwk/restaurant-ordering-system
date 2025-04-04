import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Category } from "@/types/restaurant";

// GET /api/admin/menu - Get all menu items
export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      orderBy: {
        category: "asc",
      },
    });

    // Group menu items by category
    type MenuItem = (typeof menuItems)[number];
    const categories = menuItems.reduce((acc: Category[], item: MenuItem) => {
      const category = acc.find((c: Category) => c.name === item.category);
      if (category) {
        category.items.push({
          id: item.id,
          name: item.name,
          description: item.description || "",
          price: Number(item.price),
          image: item.image || "",
          category: item.category,
          isAvailable: item.isAvailable,
        });
      } else {
        acc.push({
          id: `cat-${acc.length + 1}`,
          name: item.category,
          items: [
            {
              id: item.id,
              name: item.name,
              description: item.description || "",
              price: Number(item.price),
              image: item.image || "",
              category: item.category,
              isAvailable: item.isAvailable,
            },
          ],
        });
      }
      return acc;
    }, []);

    return NextResponse.json(categories);
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
    const { item } = body;

    const newItem = await prisma.menuItem.create({
      data: {
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        image: item.image,
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
    const { item } = body;

    const updatedItem = await prisma.menuItem.update({
      where: {
        id: item.id,
      },
      data: {
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        image: item.image,
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
