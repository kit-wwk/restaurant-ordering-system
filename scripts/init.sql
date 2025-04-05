-- MySQL initialization script for restaurant-ordering-system
-- This script runs when the MySQL container is first created

-- Grant proper privileges to application user
GRANT ALL PRIVILEGES ON restaurant_db.* TO 'restaurant_user'@'%';
FLUSH PRIVILEGES;

-- Select the database
USE restaurant_db;

-- Note: Prisma migrations will handle the schema creation
-- This file is primarily for database initialization and any custom SQL needed 