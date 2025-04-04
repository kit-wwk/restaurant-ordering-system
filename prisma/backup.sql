generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id        String     @id @default(uuid())
  email     String     @unique
  password  String
  name      String
  role      Role       @default(CUSTOMER)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  avatar    String?
  phone     String?
  lastLogin DateTime?
  status    UserStatus @default(ACTIVE)
  bookings  Booking[]
  orders    Order[]
}

model MenuItem {
  id          String      @id @default(uuid())
  name        String
  description String?
  price       Decimal     @db.Decimal(10, 2)
  category    String
  image       String?
  isAvailable Boolean     @default(true)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  orderItems  OrderItem[]
}

model Order {
  id        String      @id @default(uuid())
  userId    String
  status    OrderStatus @default(PENDING)
  total     Decimal     @db.Decimal(10, 2)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  user      User        @relation(fields: [userId], references: [id])
  items     OrderItem[]

  @@index([userId], map: "Order_userId_fkey")
}

model OrderItem {
  id         String   @id @default(uuid())
  orderId    String
  menuItemId String
  quantity   Int
  price      Decimal  @db.Decimal(10, 2)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  menuItem   MenuItem @relation(fields: [menuItemId], references: [id])
  order      Order    @relation(fields: [orderId], references: [id])

  @@index([menuItemId], map: "OrderItem_menuItemId_fkey")
  @@index([orderId], map: "OrderItem_orderId_fkey")
}

model Booking {
  id        String        @id @default(uuid())
  userId    String
  date      DateTime
  time      DateTime
  guests    Int
  status    BookingStatus @default(PENDING)
  notes     String?
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  user      User          @relation(fields: [userId], references: [id])

  @@index([userId], map: "Booking_userId_fkey")
}

model Category {
  id        String   @id @default(uuid())
  name      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Restaurant {
  id             String           @id @default(uuid())
  name           String
  rating         Float            @default(0)
  totalReviews   Int              @default(0)
  licenseNumber  String?
  licenseType    String?
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  operatingHours OperatingHours[]
  promotions     Promotion[]
}

model OperatingHours {
  id           String     @id @default(uuid())
  restaurantId String
  days         String
  hours        String
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  restaurant   Restaurant @relation(fields: [restaurantId], references: [id])

  @@index([restaurantId], map: "OperatingHours_restaurantId_fkey")
}

model Promotion {
  id                 String     @id @default(uuid())
  restaurantId       String
  discountPercentage Int
  minimumOrder       Decimal    @db.Decimal(10, 2)
  description        String
  createdAt          DateTime   @default(now())
  updatedAt          DateTime   @updatedAt
  restaurant         Restaurant @relation(fields: [restaurantId], references: [id])

  @@index([restaurantId], map: "Promotion_restaurantId_fkey")
}

enum Role {
  ADMIN
  STAFF
  CUSTOMER
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PREPARING
  READY
  COMPLETED
  CANCELLED
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
}

enum UserStatus {
  ACTIVE
  INACTIVE
}


