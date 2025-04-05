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
      name: "示範餐廳",
      description: "這是一家示範餐廳，提供各種美食。",
      address: "香港九龍灣宏開道15號",
      phone: "2345-6789",
      email: "info@example.com",
      openingHours: {
        monday: { open: "11:00", close: "22:00" },
        tuesday: { open: "11:00", close: "22:00" },
        wednesday: { open: "11:00", close: "22:00" },
        thursday: { open: "11:00", close: "22:00" },
        friday: { open: "11:00", close: "22:00" },
        saturday: { open: "11:00", close: "22:00" },
        sunday: { open: "11:00", close: "22:00" },
      },
      facebook: "https://facebook.com/demo-restaurant",
      instagram: "https://instagram.com/demo-restaurant",
      website: "https://demo-restaurant.com",
      logoUrl: "https://picsum.photos/200",
      bannerUrl: "https://picsum.photos/800/400",
      maxBookingDays: 14,
      maxBookingPerSlot: 10,
      maxTableSize: 12,
      currency: "HKD",
      taxRate: 0,
      serviceCharge: 0,
      metaTitle: "示範餐廳 - 提供各種美食",
      metaDescription:
        "這是一家示範餐廳，提供各種美食。位於香港九龍灣宏開道15號。",
      licenseNumber: "REST-12345",
      rating: 4.5,
      totalReviews: 128,
    },
  });

  // Create default categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "主食" },
      update: { restaurantId: restaurant.id },
      create: { name: "主食", restaurantId: restaurant.id },
    }),
    prisma.category.upsert({
      where: { name: "小食" },
      update: { restaurantId: restaurant.id },
      create: { name: "小食", restaurantId: restaurant.id },
    }),
    prisma.category.upsert({
      where: { name: "飲品" },
      update: { restaurantId: restaurant.id },
      create: { name: "飲品", restaurantId: restaurant.id },
    }),
  ]);

  // Create some menu items
  const menuItems = await Promise.all([
    prisma.menuItem.upsert({
      where: { id: "1" },
      update: { categoryId: categories[0].id },
      create: {
        id: "1",
        name: "牛肉飯",
        description: "新鮮牛肉配上特製醬汁",
        price: 68.0,
        categoryId: categories[0].id,
        imageUrl: "https://picsum.photos/200",
        isAvailable: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: "2" },
      update: { categoryId: categories[1].id },
      create: {
        id: "2",
        name: "薯條",
        description: "香脆可口",
        price: 28.0,
        categoryId: categories[1].id,
        imageUrl: "https://picsum.photos/200",
        isAvailable: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: "3" },
      update: { categoryId: categories[2].id },
      create: {
        id: "3",
        name: "可樂",
        description: "冰凍可口可樂",
        price: 12.0,
        categoryId: categories[2].id,
        imageUrl: "https://picsum.photos/200",
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
        description: "滿$100減$20",
        discountPercentage: 20,
        minimumOrder: 100,
        isAutoApplied: true,
      },
    }),
    prisma.promotion.upsert({
      where: { id: "2" },
      update: { restaurantId: restaurant.id },
      create: {
        id: "2",
        restaurantId: restaurant.id,
        description: "滿$200減$50",
        discountPercentage: 25,
        minimumOrder: 200,
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
  const orders = await Promise.all([
    // Registered user orders
    prisma.order.create({
      data: {
        userId: customerUser.id,
        status: OrderStatus.COMPLETED,
        total: 108.0,
        items: {
          create: [
            {
              menuItemId: menuItems[0].id,
              quantity: 1,
              price: 68.0,
            },
            {
              menuItemId: menuItems[1].id,
              quantity: 1,
              price: 28.0,
            },
            {
              menuItemId: menuItems[2].id,
              quantity: 1,
              price: 12.0,
            },
          ],
        },
      },
    }),
    // Guest orders
    ...guestUsers.map((guest, index) =>
      prisma.order.create({
        data: {
          status: [
            OrderStatus.PENDING,
            OrderStatus.CONFIRMED,
            OrderStatus.PREPARING,
          ][index],
          total: 68.0 * (index + 1),
          guestName: guest.name,
          guestEmail: guest.email,
          guestPhone: guest.phone,
          items: {
            create: [
              {
                menuItemId: menuItems[0].id,
                quantity: index + 1,
                price: 68.0,
              },
              {
                menuItemId: menuItems[2].id,
                quantity: index + 1,
                price: 12.0,
              },
            ],
          },
        },
      })
    ),
  ]);

  console.log({
    adminUser,
    customerUser,
    restaurant,
    categories,
    menuItems,
    promotions,
    bookings,
    orders,
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
