import { NextResponse } from "next/server";
import type { Restaurant } from "@/types/restaurant";

// This is mock data - in a real application, this would come from a database
const mockRestaurant: Restaurant = {
  id: "1",
  name: "日式料理餐廳",
  rating: 4.5,
  totalReviews: 128,
  licenseNumber: "R-2024-001",
  licenseType: "普通食肆",
  operatingHours: [
    { days: "星期一至五", hours: "11:00 - 22:00" },
    { days: "星期六、日", hours: "11:00 - 23:00" },
  ],
  promotions: [
    {
      id: "promo1",
      discountPercentage: 10,
      minimumOrder: 300,
      description: "訂單滿HK$300即享9折",
    },
  ],
  categories: [
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
        {
          id: "item4",
          name: "泰式青咖喱雞",
          description: "香濃青咖喱配雞肉及時令蔬菜",
          price: 88,
          image: "/images/green-curry.jpg",
          category: "亞洲美食",
          isAvailable: true,
        },
      ],
    },
    {
      id: "cat3",
      name: "麵類",
      items: [
        {
          id: "item5",
          name: "叉燒拉麵",
          description: "手工麵條配叉燒及溏心蛋",
          price: 78,
          image: "/images/ramen.jpg",
          category: "麵類",
          isAvailable: true,
        },
        {
          id: "item6",
          name: "擔擔麵",
          description: "四川風味擔擔麵，香辣可口",
          price: 68,
          image: "/images/dandan.jpg",
          category: "麵類",
          isAvailable: true,
        },
      ],
    },
  ],
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // In a real application, you would fetch this from a database
  if (params.id !== "1") {
    return NextResponse.json(
      { error: "Restaurant not found" },
      { status: 404 }
    );
  }

  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json(mockRestaurant);
}
