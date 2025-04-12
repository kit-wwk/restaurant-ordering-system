# Setup Guide

This guide provides detailed instructions on how to set up the PM Restaurant project from a zipped code package.

## System Requirements

### Development Environment

- **Operating System**: Windows 10+, macOS 10.15+, or Linux
- **Node.js**: v18.x or later
- **NPM**: v9.x or later
- **Docker**: Latest version (for local database)
- **Git**: Latest version (optional, for version control)
- **IDE**: Visual Studio Code (recommended)

### Production Environment

- **Server**: Linux server (AWS EC2 or equivalent)
  - At least 2GB RAM
  - At least 10GB disk space
  - Ubuntu 20.04+, Amazon Linux 2, or RHEL 9
- **Docker**: Latest version
- **Docker Compose**: Latest version

## Installation from Zip Package

### Step 1: Extract the Zip File

```bash
# Create a project directory
mkdir pm-restaurant
cd pm-restaurant

# Extract the zip file
unzip pm-restaurant.zip -d .
```

### Step 2: Install Dependencies

```bash
# Install project dependencies
npm install --legacy-peer-deps
```

The `--legacy-peer-deps` flag is used to resolve potential conflicts with MUI dependencies.

### Step 3: Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local
```

Edit the `.env.local` file to include your database connection details and other configuration settings:

```
# Database connection
DATABASE_URL="mysql://username:password@localhost:3306/restaurant_db"

# NextAuth.js configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key

# Other configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Step 4: Set Up the Database

#### Option 1: Using Docker (Recommended)

```bash
# Start the MySQL container
docker-compose up -d mysql
```

Wait for the MySQL container to start, then run:

```bash
# Apply database migrations
npx prisma migrate dev

# Seed the database with initial data
npx prisma db seed
```

#### Option 2: Using Existing MySQL Server

If you have an existing MySQL server, update the `DATABASE_URL` in your `.env.local` file, then run:

```bash
# Apply database migrations
npx prisma migrate dev

# Seed the database with initial data
npx prisma db seed
```

### Step 5: Start the Development Server

```bash
# Start the Next.js development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Exporting Data to the Data Folder

The project includes tools to export database data to JSON files. These files can be used for backup or to transfer data between environments.

### Step 1: Create Data Directory

```bash
mkdir -p data
```

### Step 2: Run the Export Script

```bash
# Export all data categories
node export-categories.js

# Export database using the clone script
node clone-database.js
```

The exported data will be saved in the `data` directory with timestamped filenames.

## Default Credentials

After setting up the application, you can use the following default credentials to log in:

- **Admin**

  - Email: admin@restaurant.com
  - Password: admin123

- **Customer** (if seeded)
  - Email: customer@example.com
  - Password: 123456

## Troubleshooting

### Common Issues and Solutions

#### Database Connection Errors

If you encounter database connection issues:

1. Verify that your MySQL server is running
2. Check the `DATABASE_URL` in your `.env.local` file
3. Ensure the database specified in the URL exists

```bash
# Create the database manually if needed
mysql -u root -p
CREATE DATABASE restaurant_db;
EXIT;
```

#### Dependency Installation Issues

If you encounter issues installing dependencies:

```bash
# Clear npm cache
npm cache clean --force

# Try installing with legacy peer deps flag
npm install --legacy-peer-deps
```

#### Prisma Migration Issues

If you encounter Prisma migration issues:

```bash
# Reset the database (WARNING: this will delete all data)
npx prisma migrate reset

# Or try to fix Prisma's shadow database
npx prisma migrate dev --create-only
```

## Next Steps

After successful installation, you can:

1. Visit the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin)
2. Configure your restaurant profile
3. Add menu categories and items
4. Test the booking and ordering system

For more details on how to use the system, refer to the other documentation sections.
