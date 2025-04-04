const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "管理員",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
      status: "ACTIVE",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    },
  });

  // Create customer user
  const customerUser = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      name: "測試用戶",
      password: await bcrypt.hash("customer123", 10),
      role: "CUSTOMER",
      status: "ACTIVE",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=customer",
    },
  });

  // Create default categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "主食" },
      update: {},
      create: { name: "主食" },
    }),
    prisma.category.upsert({
      where: { name: "小食" },
      update: {},
      create: { name: "小食" },
    }),
    prisma.category.upsert({
      where: { name: "飲品" },
      update: {},
      create: { name: "飲品" },
    }),
  ]);

  // Create some menu items
  const menuItems = await Promise.all([
    prisma.menuItem.upsert({
      where: { id: "1" },
      update: {},
      create: {
        name: "牛肉飯",
        description: "新鮮牛肉配上特製醬汁",
        price: 68.0,
        category: "主食",
        image: "https://picsum.photos/200",
        isAvailable: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: "2" },
      update: {},
      create: {
        name: "薯條",
        description: "香脆可口",
        price: 28.0,
        category: "小食",
        image: "https://picsum.photos/200",
        isAvailable: true,
      },
    }),
    prisma.menuItem.upsert({
      where: { id: "3" },
      update: {},
      create: {
        name: "可樂",
        description: "冰凍可口可樂",
        price: 12.0,
        category: "飲品",
        image: "https://picsum.photos/200",
        isAvailable: true,
      },
    }),
  ]);

  console.log({ adminUser, customerUser, categories, menuItems });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
