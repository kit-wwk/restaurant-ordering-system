import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create users
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.create({
    data: {
      email: "admin@restaurant.com",
      password: adminPassword,
      name: "管理員",
      role: "ADMIN",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    },
  });

  const userPassword = await hash("user123", 12);
  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      password: userPassword,
      name: "測試用戶",
      role: "CUSTOMER",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
    },
  });

  // Create restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: "日式料理餐廳",
      rating: 4.5,
      totalReviews: 128,
      licenseNumber: "R-2024-001",
      licenseType: "普通食肆",
      operatingHours: {
        create: [
          { days: "星期一至五", hours: "11:00 - 22:00" },
          { days: "星期六、日", hours: "11:00 - 23:00" },
        ],
      },
      promotions: {
        create: [
          {
            discountPercentage: 10,
            minimumOrder: 300,
            description: "訂單滿HK$300即享9折",
          },
        ],
      },
    },
  });

  // Create menu categories and items
  const categories = [
    {
      name: "日式料理",
      items: [
        {
          name: "刺身拼盤",
          description: "新鮮三文魚、吞拿魚、帶子刺身",
          price: 188,
          image: "/images/sashimi.jpg",
        },
        {
          name: "天婦羅拼盤",
          description: "炸蝦、蔬菜天婦羅",
          price: 128,
          image: "/images/tempura.jpg",
        },
      ],
    },
    {
      name: "亞洲美食",
      items: [
        {
          name: "韓式炸雞",
          description: "香脆韓式炸雞配特製醬料",
          price: 98,
          image: "/images/korean-chicken.jpg",
        },
        {
          name: "泰式青咖喱雞",
          description: "香濃青咖喱配雞肉及時令蔬菜",
          price: 88,
          image: "/images/green-curry.jpg",
        },
      ],
    },
    {
      name: "麵類",
      items: [
        {
          name: "叉燒拉麵",
          description: "手工麵條配叉燒及溏心蛋",
          price: 78,
          image: "/images/ramen.jpg",
        },
        {
          name: "擔擔麵",
          description: "四川風味擔擔麵，香辣可口",
          price: 68,
          image: "/images/dandan.jpg",
        },
      ],
    },
  ];

  for (const category of categories) {
    await prisma.category.create({
      data: {
        name: category.name,
      },
    });

    for (const item of category.items) {
      await prisma.menuItem.create({
        data: {
          ...item,
          category: category.name,
        },
      });
    }
  }

  // Create sample bookings
  const bookings = [
    {
      userId: user.id,
      date: new Date("2024-03-25"),
      time: new Date("2024-03-25T19:00:00"),
      guests: 4,
      status: "CONFIRMED" as const,
    },
    {
      userId: user.id,
      date: new Date("2024-03-26"),
      time: new Date("2024-03-26T18:30:00"),
      guests: 2,
      status: "PENDING" as const,
    },
  ];

  for (const booking of bookings) {
    await prisma.booking.create({
      data: booking,
    });
  }

  // Create sample orders
  const menuItems = await prisma.menuItem.findMany();
  const orders = [
    {
      userId: user.id,
      status: "COMPLETED" as const,
      total: 444,
      items: {
        create: [
          {
            menuItemId: menuItems[0].id,
            quantity: 1,
            price: menuItems[0].price,
          },
          {
            menuItemId: menuItems[1].id,
            quantity: 2,
            price: menuItems[1].price,
          },
        ],
      },
    },
    {
      userId: user.id,
      status: "PENDING" as const,
      total: 98,
      items: {
        create: [
          {
            menuItemId: menuItems[2].id,
            quantity: 1,
            price: menuItems[2].price,
          },
        ],
      },
    },
  ];

  for (const order of orders) {
    await prisma.order.create({
      data: order,
    });
  }

  console.log("Seeding completed:", {
    admin: admin.email,
    user: user.email,
    restaurant: restaurant.name,
    categoriesCount: categories.length,
    menuItemsCount: menuItems.length,
    bookingsCount: bookings.length,
    ordersCount: orders.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
