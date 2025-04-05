import { PrismaClient, BookingStatus, OrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: await bcrypt.hash("admin123", 10),
      name: "Administrator",
      role: "ADMIN",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      status: "ACTIVE",
    },
  });

  // Create default customer user
  const customerUser = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      password: await bcrypt.hash("customer123", 10),
      name: "Test User",
      role: "CUSTOMER",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=customer",
      status: "ACTIVE",
    },
  });

  // Create default restaurant profile
  const restaurant = await prisma.restaurantProfile.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "Hidden Fusion",
      description:
        "Hidden Fusion offers Japanese fusion cuisine, combining traditional Japanese cooking with Western culinary techniques for a unique dining experience.",
      address:
        "Shops 4-5, 8/F, Global Gateway Tower, 20 Sheung Yuet Road, Kowloon Bay",
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
      metaTitle: "Hidden Fusion - Japanese Fusion Cuisine",
      metaDescription:
        "Hidden Fusion offers Japanese fusion cuisine, combining traditional Japanese cooking with Western culinary techniques for a unique dining experience.",
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
        name: "Japanese Dishes",
        restaurantId: restaurant.id,
      },
      create: {
        id: "1",
        name: "Japanese Dishes",
        restaurantId: restaurant.id,
      },
    }),
    prisma.category.upsert({
      where: { id: "2" },
      update: {
        name: "Rice Bowls",
        restaurantId: restaurant.id,
      },
      create: {
        id: "2",
        name: "Rice Bowls",
        restaurantId: restaurant.id,
      },
    }),
    prisma.category.upsert({
      where: { id: "3" },
      update: {
        name: "Ramen",
        restaurantId: restaurant.id,
      },
      create: {
        id: "3",
        name: "Ramen",
        restaurantId: restaurant.id,
      },
    }),
    prisma.category.upsert({
      where: { id: "4" },
      update: {
        name: "Udon",
        restaurantId: restaurant.id,
      },
      create: {
        id: "4",
        name: "Udon",
        restaurantId: restaurant.id,
      },
    }),
    prisma.category.upsert({
      where: { id: "5" },
      update: {
        name: "Asian Cuisine",
        restaurantId: restaurant.id,
      },
      create: {
        id: "5",
        name: "Asian Cuisine",
        restaurantId: restaurant.id,
      },
    }),
    prisma.category.upsert({
      where: { id: "6" },
      update: {
        name: "Drinks",
        restaurantId: restaurant.id,
      },
      create: {
        id: "6",
        name: "Drinks",
        restaurantId: restaurant.id,
      },
    }),
  ]);

  // Create menu items
  const menuItems = await Promise.all([
    // Japanese Dishes
    prisma.menuItem.upsert({
      where: { id: "1" },
      update: {},
      create: {
        id: "1",
        name: "Beef Tongue with Garlic Chili Oil",
        description:
          "Pan-fried beef tongue with special garlic chili oil, tender and juicy",
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
        name: "Wagyu Beef Patty",
        description: "Premium wagyu beef patty, juicy and flavorful",
        price: 98,
        categoryId: categories[0].id,
        imageUrl: "/images/tempura.jpg",
        isAvailable: true,
      },
    }),
    // Rice Bowls
    prisma.menuItem.upsert({
      where: { id: "3" },
      update: {},
      create: {
        id: "3",
        name: "Grilled Salmon & Avocado Rice Bowl",
        description: "Grilled salmon with fresh avocado, healthy and delicious",
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
        name: "Beef Tongue Rice Bowl",
        description: "Tender beef tongue with Japanese sauce over steamed rice",
        price: 98,
        categoryId: categories[1].id,
        imageUrl: "/images/gyudon.jpg",
        isAvailable: true,
      },
    }),
    // Ramen
    prisma.menuItem.upsert({
      where: { id: "5" },
      update: {},
      create: {
        id: "5",
        name: "Seafood Ramen",
        description:
          "Rich seafood ramen with springy noodles and flavorful broth",
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
        name: "Black Garlic Tonkotsu Ramen",
        description:
          "Special black garlic oil tonkotsu broth with springy noodles",
        price: 78,
        categoryId: categories[2].id,
        imageUrl: "/images/dandan.jpg",
        isAvailable: true,
      },
    }),
    // Udon
    prisma.menuItem.upsert({
      where: { id: "7" },
      update: {},
      create: {
        id: "7",
        name: "Mentaiko Fried Udon",
        description: "Spicy cod roe fried udon, rich in flavor and texture",
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
        name: "Japanese Fried Udon",
        description: "Japanese-style fried udon with various vegetables",
        price: 68,
        categoryId: categories[3].id,
        imageUrl: "/images/tempura-udon.jpg",
        isAvailable: true,
      },
    }),
    // Asian Cuisine
    prisma.menuItem.upsert({
      where: { id: "9" },
      update: {},
      create: {
        id: "9",
        name: "Thai Fried Rice",
        description: "Spicy Thai fried rice with shrimp and vegetables",
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
        name: "Korean Kimchi Fried Rice",
        description: "Korean kimchi fried rice with fried egg on top",
        price: 78,
        categoryId: categories[4].id,
        imageUrl: "/images/korean-chicken.jpg",
        isAvailable: true,
      },
    }),
    // Drinks
    prisma.menuItem.upsert({
      where: { id: "11" },
      update: {},
      create: {
        id: "11",
        name: "Plum Soda",
        description:
          "Refreshing plum soda, sweet and sour, perfect for hot days",
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
        name: "Matcha Latte",
        description:
          "Rich matcha with milk foam, smooth with a slight bitterness",
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
        description: "10% Discount",
        discountPercentage: 10,
        minimumOrder: 120,
        isAutoApplied: true,
      },
    }),
  ]);

  // Create some bookings
  const bookings = await Promise.all([
    // Registered user booking
    prisma.booking.create({
      data: {
        userId: customerUser.id,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        time: new Date(
          Date.now() + 5 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000
        ), // 7pm
        guests: 4,
        status: BookingStatus.CONFIRMED,
        notes: "Window seat preferred",
      },
    }),
    // Guest bookings
    ...new Array(3).fill(null).map((_, index) => {
      const guestNames = ["David Chan", "Lee Ming", "Helen Wong"];
      const guestEmails = [
        "chan@example.com",
        "lee@example.com",
        "wong@example.com",
      ];
      const guestPhones = ["9876-5432", "9876-1234", "9888-8888"];
      const statuses = [
        BookingStatus.PENDING,
        BookingStatus.CONFIRMED,
        BookingStatus.CANCELLED,
      ];

      return prisma.booking.create({
        data: {
          date: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000),
          time: new Date(
            Date.now() + (index + 2) * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000
          ), // 9am
          guests: index + 2,
          status: statuses[index],
          notes: "No special requests",
          guestName: guestNames[index],
          guestEmail: guestEmails[index],
          guestPhone: guestPhones[index],
        },
      });
    }),
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
