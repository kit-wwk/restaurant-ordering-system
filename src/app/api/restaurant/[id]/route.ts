import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Restaurant, Category } from "@/types/restaurant";

export async function GET() {
  try {
    const restaurant = await prisma.restaurant.findFirst({
      include: {
        operatingHours: true,
        promotions: true,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Get menu items grouped by category
    const menuItems = await prisma.menuItem.findMany({
      orderBy: {
        category: "asc",
      },
    });

    // Group menu items by category
    type MenuItem = (typeof menuItems)[number];
    type OperatingHour = (typeof restaurant.operatingHours)[number];
    type Promotion = (typeof restaurant.promotions)[number];

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

    const response: Restaurant = {
      id: restaurant.id,
      name: restaurant.name,
      rating: restaurant.rating,
      totalReviews: restaurant.totalReviews,
      licenseNumber: restaurant.licenseNumber || "",
      licenseType: restaurant.licenseType || "",
      operatingHours: restaurant.operatingHours.map((oh: OperatingHour) => ({
        days: oh.days,
        hours: oh.hours,
      })),
      promotions: restaurant.promotions.map((p: Promotion) => ({
        id: p.id,
        discountPercentage: p.discountPercentage,
        minimumOrder: Number(p.minimumOrder),
        description: p.description,
      })),
      categories,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurant data" },
      { status: 500 }
    );
  }
}
