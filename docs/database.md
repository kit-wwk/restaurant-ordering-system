# Database Documentation

This document provides information about the database structure, data models, and procedures for importing and exporting data.

## Database Overview

The PM Restaurant application uses MySQL as its primary database, with Prisma as the ORM (Object-Relational Mapper) for database interactions. The schema is defined in the `prisma/schema.prisma` file.

## Data Models

```mermaid
erDiagram
    User {
        string id PK
        string email
        string password
        string name
        enum role
        datetime createdAt
        datetime updatedAt
        string avatar
        string phone
        datetime lastLogin
        enum status
    }

    RestaurantProfile {
        string id PK "default"
        string name
        string description
        string address
        string phone
        string email
        json openingHours
        string facebook
        string instagram
        string logoUrl
        string bannerUrl
        int maxBookingDays
        int maxBookingPerSlot
        int maxTableSize
        string currency
        float taxRate
        float serviceCharge
        string metaTitle
        string metaDescription
        datetime createdAt
        datetime updatedAt
        string licenseNumber
        float rating
        int totalReviews
        string website
    }

    Category {
        string id PK
        string name
        datetime createdAt
        datetime updatedAt
        string restaurantId FK
    }

    MenuItem {
        string id PK
        string name
        string description
        decimal price
        boolean isAvailable
        datetime createdAt
        datetime updatedAt
        string categoryId FK
        string imageUrl
    }

    Order {
        string id PK
        string userId FK
        enum status
        decimal subtotal
        decimal discount
        decimal total
        string promotionId FK
        datetime createdAt
        datetime updatedAt
        string guestEmail
        string guestName
        string guestPhone
    }

    OrderItem {
        string id PK
        string orderId FK
        string menuItemId FK
        int quantity
        decimal price
        datetime createdAt
        datetime updatedAt
    }

    Booking {
        string id PK
        string userId FK
        datetime date
        datetime time
        int guests
        enum status
        string notes
        datetime createdAt
        datetime updatedAt
        string guestEmail
        string guestName
        string guestPhone
    }

    Promotion {
        string id PK
        string restaurantId FK
        int discountPercentage
        decimal minimumOrder
        string description
        datetime createdAt
        datetime updatedAt
        boolean isAutoApplied
    }

    User ||--o{ Order : places
    User ||--o{ Booking : makes
    RestaurantProfile ||--o{ Category : has
    RestaurantProfile ||--o{ Promotion : offers
    Category ||--o{ MenuItem : contains
    MenuItem ||--o{ OrderItem : included_in
    Order ||--o{ OrderItem : contains
    Order }o--|| Promotion : applies
```

## Schema Details

### User

This model represents system users, including administrators, staff, and customers.

| Field     | Type      | Description                      |
| --------- | --------- | -------------------------------- |
| id        | String    | UUID primary key                 |
| email     | String    | Unique email address             |
| password  | String    | Hashed password                  |
| name      | String    | Full name                        |
| role      | Enum      | Role: ADMIN, STAFF, CUSTOMER     |
| createdAt | DateTime  | Creation timestamp               |
| updatedAt | DateTime  | Last update timestamp            |
| avatar    | String?   | Optional URL to profile image    |
| phone     | String?   | Optional phone number            |
| lastLogin | DateTime? | Optional timestamp of last login |
| status    | Enum      | Status: ACTIVE, INACTIVE         |

### RestaurantProfile

This model stores information about the restaurant.

| Field             | Type     | Description                          |
| ----------------- | -------- | ------------------------------------ |
| id                | String   | Default ID (always "default")        |
| name              | String   | Restaurant name                      |
| description       | String?  | Optional restaurant description      |
| address           | String   | Physical address                     |
| phone             | String   | Contact phone number                 |
| email             | String?  | Optional contact email               |
| openingHours      | Json     | JSON structure of opening hours      |
| facebook          | String?  | Optional Facebook page URL           |
| instagram         | String?  | Optional Instagram profile URL       |
| logoUrl           | String?  | Optional logo image URL              |
| bannerUrl         | String?  | Optional banner image URL            |
| maxBookingDays    | Int      | Maximum days in advance for bookings |
| maxBookingPerSlot | Int      | Maximum bookings per time slot       |
| maxTableSize      | Int      | Maximum people per table             |
| currency          | String   | Currency code (default "HKD")        |
| taxRate           | Float    | Tax rate percentage                  |
| serviceCharge     | Float    | Service charge percentage            |
| metaTitle         | String?  | Optional SEO meta title              |
| metaDescription   | String?  | Optional SEO meta description        |
| createdAt         | DateTime | Creation timestamp                   |
| updatedAt         | DateTime | Last update timestamp                |
| licenseNumber     | String?  | Optional business license number     |
| rating            | Float    | Average rating (default 4.5)         |
| totalReviews      | Int      | Number of reviews (default 0)        |
| website           | String?  | Optional website URL                 |

### Category

This model represents menu categories.

| Field        | Type     | Description               |
| ------------ | -------- | ------------------------- |
| id           | String   | UUID primary key          |
| name         | String   | Unique category name      |
| createdAt    | DateTime | Creation timestamp        |
| updatedAt    | DateTime | Last update timestamp     |
| restaurantId | String   | Foreign key to restaurant |

### MenuItem

This model represents items on the menu.

| Field       | Type     | Description                 |
| ----------- | -------- | --------------------------- |
| id          | String   | UUID primary key            |
| name        | String   | Item name                   |
| description | String?  | Optional item description   |
| price       | Decimal  | Price with 2 decimal places |
| isAvailable | Boolean  | Availability status         |
| createdAt   | DateTime | Creation timestamp          |
| updatedAt   | DateTime | Last update timestamp       |
| categoryId  | String   | Foreign key to category     |
| imageUrl    | String?  | Optional URL to item image  |

### Order

This model represents customer orders.

| Field       | Type     | Description                       |
| ----------- | -------- | --------------------------------- |
| id          | String   | UUID primary key                  |
| userId      | String?  | Optional foreign key to user      |
| status      | Enum     | Status: PENDING, CONFIRMED, etc.  |
| subtotal    | Decimal  | Subtotal amount before discounts  |
| discount    | Decimal  | Discount amount                   |
| total       | Decimal  | Total amount after discounts      |
| promotionId | String?  | Optional foreign key to promotion |
| createdAt   | DateTime | Creation timestamp                |
| updatedAt   | DateTime | Last update timestamp             |
| guestEmail  | String?  | Optional email for guest orders   |
| guestName   | String?  | Optional name for guest orders    |
| guestPhone  | String?  | Optional phone for guest orders   |

### OrderItem

This model represents individual items in an order.

| Field      | Type     | Description              |
| ---------- | -------- | ------------------------ |
| id         | String   | UUID primary key         |
| orderId    | String   | Foreign key to order     |
| menuItemId | String   | Foreign key to menu item |
| quantity   | Int      | Quantity ordered         |
| price      | Decimal  | Price at time of order   |
| createdAt  | DateTime | Creation timestamp       |
| updatedAt  | DateTime | Last update timestamp    |

### Booking

This model represents table reservations.

| Field      | Type     | Description                       |
| ---------- | -------- | --------------------------------- |
| id         | String   | UUID primary key                  |
| userId     | String?  | Optional foreign key to user      |
| date       | DateTime | Booking date                      |
| time       | DateTime | Booking time                      |
| guests     | Int      | Number of guests                  |
| status     | Enum     | Status: PENDING, CONFIRMED, etc.  |
| notes      | String?  | Optional booking notes            |
| createdAt  | DateTime | Creation timestamp                |
| updatedAt  | DateTime | Last update timestamp             |
| guestEmail | String?  | Optional email for guest bookings |
| guestName  | String?  | Optional name for guest bookings  |
| guestPhone | String?  | Optional phone for guest bookings |

### Promotion

This model represents promotional discounts.

| Field              | Type     | Description                             |
| ------------------ | -------- | --------------------------------------- |
| id                 | String   | UUID primary key                        |
| restaurantId       | String   | Foreign key to restaurant               |
| discountPercentage | Int      | Percentage discount to apply            |
| minimumOrder       | Decimal  | Minimum order amount for eligibility    |
| description        | String   | Promotion description                   |
| createdAt          | DateTime | Creation timestamp                      |
| updatedAt          | DateTime | Last update timestamp                   |
| isAutoApplied      | Boolean  | Whether promotion applies automatically |

Refer to the `prisma/schema.prisma` file for the complete schema definition for all models.

## Database Connection

The database connection is configured through the `DATABASE_URL` environment variable, which should be set in your `.env` file:

```
DATABASE_URL="mysql://username:password@localhost:3306/restaurant_db"
```

## Database Management

### Creating Migrations

When you make changes to the Prisma schema, you need to create a migration:

```bash
npx prisma migrate dev --name descriptive_name
```

### Applying Migrations

To apply migrations to the database:

```bash
npx prisma migrate deploy
```

### Seeding the Database

Initial data can be populated using the seed script:

```bash
npx prisma db seed
```

The seed script is defined in `prisma/seed.ts` and creates:

- Default restaurant profile
- Sample menu categories
- Sample menu items
- Default admin user

## Exporting and Importing Data

### Creating a Data Folder

First, create a data folder to store exported data:

```bash
mkdir -p data
```

### Exporting Data

The project includes scripts to export data from the database:

#### Using export-categories.js

This script exports menu categories:

```bash
node export-categories.js
```

#### Using clone-database.js

This script exports all data models:

```bash
node clone-database.js
```

The data is exported as JSON files in the format:

```
backup-{model-name}-{timestamp}.json
```

For example: `backup-categories-2023-04-15T12-30-45.123Z.json`

### Imported Data Structure

Here's an example of the data structure for exported categories:

```json
[
  {
    "id": "f7c8d456-1234-5678-abcd-ef1234567890",
    "name": "Appetizers",
    "createdAt": "2023-04-15T12:30:45.123Z",
    "updatedAt": "2023-04-15T12:30:45.123Z",
    "restaurantId": "default"
  },
  {
    "id": "a1b2c3d4-5678-90ab-cdef-123456789012",
    "name": "Main Courses",
    "createdAt": "2023-04-15T12:30:45.123Z",
    "updatedAt": "2023-04-15T12:30:45.123Z",
    "restaurantId": "default"
  }
]
```

### Importing Data

To import the data:

1. Place the exported JSON files in the `data` folder
2. Use the database cloning script with a source parameter:

```bash
node clone-database.js --import-from=data/backup-categories-2023-04-15T12-30-45.123Z.json
```

## Database Backup

For production environments, it's recommended to set up regular database backups. MySQL dumps can be created using:

```bash
# Inside Docker container
docker exec -it mysql-container mysqldump -u root -p restaurant_db > backup.sql

# Or directly with MySQL client
mysqldump -u root -p restaurant_db > backup.sql
```

## Troubleshooting

### Prisma Errors

If you encounter Prisma-related errors:

```bash
# Reset Prisma client
npx prisma generate

# Reset database (caution: this will delete all data)
npx prisma migrate reset
```

### Connection Issues

If you have connection issues:

1. Verify the `DATABASE_URL` in your `.env` file
2. Check that the MySQL server is running
3. Ensure the database exists:

```bash
mysql -u root -p
CREATE DATABASE IF NOT EXISTS restaurant_db;
EXIT;
```
