import { PrismaClient, BookingStatus, OrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      password: await bcrypt.hash("123456", 10),
    },
    create: {
      email: "admin@example.com",
      name: "管理員",
      password: await bcrypt.hash("123456", 10),
      role: "ADMIN",
      status: "ACTIVE",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    },
  });

  // Create customer user
  const customerUser = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {
      password: await bcrypt.hash("123456", 10),
    },
    create: {
      email: "customer@example.com",
      name: "測試用戶",
      password: await bcrypt.hash("123456", 10),
      role: "CUSTOMER",
      status: "ACTIVE",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=customer",
    },
  });

  // Create some guest users
  const guestUsers = [
    {
      name: "陳大文",
      email: "chan@example.com",
      phone: "9876-5432",
    },
    {
      name: "李小明",
      email: "lee@example.com",
      phone: "9876-1234",
    },
    {
      name: "黃麗華",
      email: "wong@example.com",
      phone: "9888-8888",
    },
  ];

  // Create default restaurant profile
  const restaurant = await prisma.restaurantProfile.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "和洋食屋 Hidden",
      description:
        "Hidden 提供日式和洋食料理，結合傳統日本料理與西式烹飪技巧，為您帶來獨特的美食體驗。",
      address: "九龍灣常悅道20號環球工商大廈8樓4-5號舖",
      phone: "2345-6789",
      email: "info@hidden-restaurant.com",
      openingHours: {
        monday: { open: "11:00", close: "21:00" },
        tuesday: { open: "11:00", close: "21:00" },
        wednesday: { open: "11:00", close: "21:00" },
        thursday: { open: "11:00", close: "21:00" },
        friday: { open: "11:00", close: "21:00" },
        saturday: { open: "11:00", close: "21:00" },
        sunday: { open: "", close: "" }, // Closed on Sunday
      },
      facebook: "hidden.restaurant",
      instagram: "hidden_restaurant",
      website: "https://hidden-restaurant.com",
      logoUrl: "/images/ramen.jpg",
      bannerUrl: "/images/ramen.jpg",
      maxBookingDays: 14,
      maxBookingPerSlot: 10,
      maxTableSize: 12,
      currency: "HKD",
      taxRate: 0,
      serviceCharge: 0,
      metaTitle: "和洋食屋 Hidden - 日式和洋食料理",
      metaDescription:
        "Hidden 提供日式和洋食料理，結合傳統日本料理與西式烹飪技巧，為您帶來獨特的美食體驗。",
      licenseNumber: "2551162194",
      rating: 4.9,
      totalReviews: 100,
    },
  });

  // Create default categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: "1" },
      update: {
        name: "日式料理",
        restaurantId: restaurant.id,
      },
      create: {
        id: "1",
        name: "日式料理",
        restaurantId: restaurant.id,
      },
    }),
    prisma.category.upsert({
      where: { id: "2" },
      update: {
        name: "丼飯",
        restaurantId: restaurant.id,
      },
      create: {
        id: "2",
        name: "丼飯",
        restaurantId: restaurant.id,
      },
    }),
    prisma.category.upsert({
      where: { id: "3" },
      update: {
        name: "麵類",
        restaurantId: restaurant.id,
      },
      create: {
        id: "3",
        name: "麵類",
        restaurantId: restaurant.id,
      },
    }),
    prisma.category.upsert({
      where: { id: "4" },
      update: {
        name: "烏冬",
        restaurantId: restaurant.id,
      },
      create: {
        id: "4",
        name: "烏冬",
        restaurantId: restaurant.id,
      },
    }),
    prisma.category.upsert({
      where: { id: "5" },
      update: {
        name: "亞洲菜",
        restaurantId: restaurant.id,
      },
      create: {
        id: "5",
        name: "亞洲菜",
        restaurantId: restaurant.id,
      },
    }),
    prisma.category.upsert({
      where: { id: "6" },
      update: {
        name: "飲品",
        restaurantId: restaurant.id,
      },
      create: {
        id: "6",
        name: "飲品",
        restaurantId: restaurant.id,
      },
    }),
  ]);

  // Create menu items
  const menuItems = await Promise.all([
    // 日式料理
    prisma.menuItem.upsert({
      where: { id: "1" },
      update: {},
      create: {
        id: "1",
        name: "牛舌蒜蓉辣油",
        description: "香煎牛舌配特製蒜蓉辣油，口感鮮嫩多汁",
        price: 88,
        categoryId: categories[0].id,
        imageUrl: "/images/sashimi.jpg",
        isAvailable: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: "2" },
      update: {},
      create: {
        id: "2",
        name: "和牛漢堡扒",
        description: "優質和牛製成的漢堡扒，肉質鮮嫩多汁",
        price: 98,
        categoryId: categories[0].id,
        imageUrl: "/images/tempura.jpg",
        isAvailable: true,
      },
    }),
    // 丼飯
    prisma.menuItem.upsert({
      where: { id: "3" },
      update: {},
      create: {
        id: "3",
        name: "燒三文魚牛油果飯",
        description: "香煎三文魚配上新鮮牛油果，健康美味",
        price: 88,
        categoryId: categories[1].id,
        imageUrl: "/images/tendon.jpg",
        isAvailable: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: "4" },
      update: {},
      create: {
        id: "4",
        name: "牛舌飯",
        description: "嫩滑牛舌配上日式醬汁，搭配白飯，豐富美味",
        price: 98,
        categoryId: categories[1].id,
        imageUrl: "/images/gyudon.jpg",
        isAvailable: true,
      },
    }),
    // 麵類
    prisma.menuItem.upsert({
      where: { id: "5" },
      update: {},
      create: {
        id: "5",
        name: "海鮮拉麵",
        description: "豐富海鮮配上濃郁湯底，麵條彈牙爽滑",
        price: 88,
        categoryId: categories[2].id,
        imageUrl: "/images/ramen.jpg",
        isAvailable: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: "6" },
      update: {},
      create: {
        id: "6",
        name: "黑蒜油豚骨拉麵",
        description: "特製黑蒜油豚骨湯底，香濃醇厚，配上彈牙麵條",
        price: 78,
        categoryId: categories[2].id,
        imageUrl: "/images/dandan.jpg",
        isAvailable: true,
      },
    }),
    // 烏冬
    prisma.menuItem.upsert({
      where: { id: "7" },
      update: {},
      create: {
        id: "7",
        name: "炒明太子烏冬",
        description: "香辣明太子炒烏冬，口感豐富，辣香可口",
        price: 78,
        categoryId: categories[3].id,
        imageUrl: "/images/beef-udon.jpg",
        isAvailable: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: "8" },
      update: {},
      create: {
        id: "8",
        name: "日式炒烏冬",
        description: "日式風味炒烏冬，加入多種蔬菜，口感豐富",
        price: 68,
        categoryId: categories[3].id,
        imageUrl: "/images/tempura-udon.jpg",
        isAvailable: true,
      },
    }),
    // 亞洲菜
    prisma.menuItem.upsert({
      where: { id: "9" },
      update: {},
      create: {
        id: "9",
        name: "泰式炒飯",
        description: "香辣泰式炒飯，加入蝦仁和蔬菜，風味獨特",
        price: 68,
        categoryId: categories[4].id,
        imageUrl: "/images/green-curry.jpg",
        isAvailable: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: "10" },
      update: {},
      create: {
        id: "10",
        name: "韓式泡菜炒飯",
        description: "韓式泡菜炒飯，酸辣開胃，搭配煎蛋",
        price: 78,
        categoryId: categories[4].id,
        imageUrl: "/images/korean-chicken.jpg",
        isAvailable: true,
      },
    }),
    // 飲品
    prisma.menuItem.upsert({
      where: { id: "11" },
      update: {},
      create: {
        id: "11",
        name: "梅子蘇打",
        description: "清爽的梅子蘇打水，酸甜可口，消暑解渴",
        price: 28,
        categoryId: categories[5].id,
        imageUrl: "/images/gyudon.jpg",
        isAvailable: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: "12" },
      update: {},
      create: {
        id: "12",
        name: "抹茶拿鐵",
        description: "香濃抹茶配上奶泡，口感順滑，微苦回甘",
        price: 38,
        categoryId: categories[5].id,
        imageUrl: "/images/green-curry.jpg",
        isAvailable: true,
      },
    }),
  ]);

  // Create default promotions
  const promotions = await Promise.all([
    prisma.promotion.upsert({
      where: { id: "1" },
      update: { restaurantId: restaurant.id },
      create: {
        id: "1",
        restaurantId: restaurant.id,
        description: "10%折扣",
        discountPercentage: 10,
        minimumOrder: 120,
        isAutoApplied: true,
      },
    }),
  ]);

  // Create some bookings
  const bookings = await Promise.all([
    // Registered user bookings
    prisma.booking.create({
      data: {
        userId: customerUser.id,
        date: new Date("2025-04-10"),
        time: new Date("2025-04-10T19:00:00Z"),
        guests: 4,
        status: BookingStatus.CONFIRMED,
        notes: "靠窗座位",
      },
    }),
    // Guest bookings
    ...guestUsers.map((guest, index) =>
      prisma.booking.create({
        data: {
          date: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000), // Next few days
          time: new Date(
            Date.now() + (index + 1) * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000
          ), // 7 PM
          guests: 2 + index,
          status: [
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED,
            BookingStatus.CANCELLED,
          ][index],
          notes: "無特別要求",
          guestName: guest.name,
          guestEmail: guest.email,
          guestPhone: guest.phone,
        },
      })
    ),
  ]);

  // Create some orders
  for (let i = 0; i < 4; i++) {
    const status = ["PENDING", "CONFIRMED", "PREPARING", "COMPLETED"][
      i
    ] as OrderStatus;
    const userId = i < 2 ? adminUser.id : customerUser.id;
    const items = [
      {
        menuItemId: menuItems[0].id,
        quantity: 2,
        price: Number(menuItems[0].price),
      },
      {
        menuItemId: menuItems[1].id,
        quantity: 1,
        price: Number(menuItems[1].price),
      },
    ];
    const itemsTotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // For logged in users
    if (i < 2) {
      await prisma.order.create({
        data: {
          userId,
          status,
          subtotal: itemsTotal,
          total: itemsTotal,
          items: {
            create: items,
          },
        },
      });
    } else {
      // For guest orders
      await prisma.order.create({
        data: {
          status,
          subtotal: itemsTotal,
          total: itemsTotal,
          guestName: "Guest User",
          guestEmail: "guest@example.com",
          guestPhone: "98765432",
          items: {
            create: items,
          },
        },
      });
    }
  }

  console.log({
    adminUser,
    customerUser,
    restaurant,
    categories,
    menuItems,
    promotions,
    bookings,
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
