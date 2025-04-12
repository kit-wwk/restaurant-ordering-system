FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Add build argument for npm flags
ARG NPM_FLAGS=""

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci ${NPM_FLAGS}

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install necessary tools for database management and connectivity checks
RUN apk add --no-cache curl netcat-openbsd

# Install packages needed for database seeding in production
RUN npm install -g prisma typescript ts-node @types/node bcryptjs @types/bcryptjs

# Copy necessary files for Prisma
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma/
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma/

# Copy database seeding script for manual seeding
COPY --from=builder /app/prisma/seed.ts ./prisma/seed.ts

# Copy public directory and scripts
COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/package.json ./package.json

# Make scripts directory and files executable 
RUN ls -la /app/scripts || echo "Scripts directory not found!"
RUN find /app/scripts -type f -name "*.sh" -exec chmod +x {} \; || echo "No shell scripts found!"

# Set the correct permission for prerender cache
RUN mkdir -p .next
RUN chown nextjs:nodejs .next

# Copy the built app
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy and prepare start.sh script
COPY scripts/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Also copy to scripts directory and ensure permissions
RUN mkdir -p /app/scripts
COPY scripts/start.sh /app/scripts/start.sh
RUN chmod +x /app/scripts/start.sh
RUN chown -R nextjs:nodejs /app/scripts

# Create a writable logs directory
RUN mkdir -p /tmp/logs && chown -R nextjs:nodejs /tmp/logs

# Create seed-db.sh script for manual database seeding
RUN echo '#!/bin/sh' > /app/seed-db.sh
RUN echo 'cd /app' >> /app/seed-db.sh
RUN echo 'echo "Attempting to seed database..."' >> /app/seed-db.sh
RUN echo 'if command -v ts-node &> /dev/null; then' >> /app/seed-db.sh
RUN echo '  echo "Using ts-node for seeding"' >> /app/seed-db.sh
RUN echo '  npm install --no-save bcryptjs @types/bcryptjs 2>/dev/null || echo "Warning: Could not install bcryptjs"' >> /app/seed-db.sh
RUN echo '  npx prisma db seed || SEED_FAILED=1' >> /app/seed-db.sh
RUN echo 'else' >> /app/seed-db.sh
RUN echo '  echo "ts-node not available, using SQL fallback"' >> /app/seed-db.sh
RUN echo '  SEED_FAILED=1' >> /app/seed-db.sh
RUN echo 'fi' >> /app/seed-db.sh
RUN echo 'if [ "$SEED_FAILED" = "1" ]; then' >> /app/seed-db.sh
RUN echo '  echo "Falling back to direct SQL seeding"' >> /app/seed-db.sh
RUN echo '  npx prisma db execute --stdin <<SQL' >> /app/seed-db.sh
RUN echo '  -- Create database tables if they do not exist' >> /app/seed-db.sh
RUN echo '  CREATE TABLE IF NOT EXISTS Restaurant (' >> /app/seed-db.sh
RUN echo '      id INT PRIMARY KEY AUTO_INCREMENT,' >> /app/seed-db.sh
RUN echo '      name VARCHAR(255) NOT NULL,' >> /app/seed-db.sh
RUN echo '      address VARCHAR(255),' >> /app/seed-db.sh
RUN echo '      phone VARCHAR(50),' >> /app/seed-db.sh
RUN echo '      email VARCHAR(255),' >> /app/seed-db.sh
RUN echo '      description TEXT' >> /app/seed-db.sh
RUN echo '  );' >> /app/seed-db.sh
RUN echo '  CREATE TABLE IF NOT EXISTS Category (' >> /app/seed-db.sh
RUN echo '      id INT PRIMARY KEY AUTO_INCREMENT,' >> /app/seed-db.sh
RUN echo '      name VARCHAR(255) NOT NULL,' >> /app/seed-db.sh
RUN echo '      restaurantId INT,' >> /app/seed-db.sh
RUN echo '      FOREIGN KEY (restaurantId) REFERENCES Restaurant(id) ON DELETE CASCADE' >> /app/seed-db.sh
RUN echo '  );' >> /app/seed-db.sh
RUN echo '  CREATE TABLE IF NOT EXISTS MenuItem (' >> /app/seed-db.sh
RUN echo '      id INT PRIMARY KEY AUTO_INCREMENT,' >> /app/seed-db.sh
RUN echo '      name VARCHAR(255) NOT NULL,' >> /app/seed-db.sh
RUN echo '      description TEXT,' >> /app/seed-db.sh
RUN echo '      price DECIMAL(10, 2) NOT NULL,' >> /app/seed-db.sh
RUN echo '      imageUrl VARCHAR(255),' >> /app/seed-db.sh
RUN echo '      available BOOLEAN DEFAULT true,' >> /app/seed-db.sh
RUN echo '      categoryId INT,' >> /app/seed-db.sh
RUN echo '      FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE CASCADE' >> /app/seed-db.sh
RUN echo '  );' >> /app/seed-db.sh
RUN echo '  CREATE TABLE IF NOT EXISTS User (' >> /app/seed-db.sh
RUN echo '      id INT PRIMARY KEY AUTO_INCREMENT,' >> /app/seed-db.sh
RUN echo '      email VARCHAR(255) UNIQUE NOT NULL,' >> /app/seed-db.sh
RUN echo '      name VARCHAR(255),' >> /app/seed-db.sh
RUN echo '      password VARCHAR(255) NOT NULL,' >> /app/seed-db.sh
RUN echo '      role ENUM("USER", "ADMIN") DEFAULT "USER"' >> /app/seed-db.sh
RUN echo '  );' >> /app/seed-db.sh
RUN echo '  -- Insert a default restaurant if none exists' >> /app/seed-db.sh
RUN echo '  INSERT INTO Restaurant (id, name, address, phone, email, description)' >> /app/seed-db.sh
RUN echo '  SELECT 1, "Demo Restaurant", "123 Demo Street", "555-1234", "demo@restaurant.com", "A demo restaurant"' >> /app/seed-db.sh
RUN echo '  WHERE NOT EXISTS (SELECT * FROM Restaurant LIMIT 1);' >> /app/seed-db.sh
RUN echo '  -- Insert default categories if none exist' >> /app/seed-db.sh
RUN echo '  INSERT INTO Category (id, name, restaurantId)' >> /app/seed-db.sh
RUN echo '  SELECT 1, "Appetizers", 1' >> /app/seed-db.sh
RUN echo '  WHERE NOT EXISTS (SELECT * FROM Category WHERE name = "Appetizers");' >> /app/seed-db.sh
RUN echo '  INSERT INTO Category (id, name, restaurantId)' >> /app/seed-db.sh
RUN echo '  SELECT 2, "Main Courses", 1' >> /app/seed-db.sh
RUN echo '  WHERE NOT EXISTS (SELECT * FROM Category WHERE name = "Main Courses");' >> /app/seed-db.sh
RUN echo '  INSERT INTO Category (id, name, restaurantId)' >> /app/seed-db.sh
RUN echo '  SELECT 3, "Desserts", 1' >> /app/seed-db.sh
RUN echo '  WHERE NOT EXISTS (SELECT * FROM Category WHERE name = "Desserts");' >> /app/seed-db.sh
RUN echo '  -- Insert sample menu items if none exist' >> /app/seed-db.sh
RUN echo '  INSERT INTO MenuItem (name, description, price, imageUrl, available, categoryId)' >> /app/seed-db.sh
RUN echo '  SELECT "Garlic Bread", "Toasted bread with garlic butter", 5.99, "/images/garlic-bread.jpg", true, 1' >> /app/seed-db.sh
RUN echo '  WHERE NOT EXISTS (SELECT * FROM MenuItem WHERE name = "Garlic Bread");' >> /app/seed-db.sh
RUN echo '  INSERT INTO MenuItem (name, description, price, imageUrl, available, categoryId)' >> /app/seed-db.sh
RUN echo '  SELECT "Chicken Alfredo", "Chicken with creamy alfredo sauce", 14.99, "/images/chicken-alfredo.jpg", true, 2' >> /app/seed-db.sh
RUN echo '  WHERE NOT EXISTS (SELECT * FROM MenuItem WHERE name = "Chicken Alfredo");' >> /app/seed-db.sh
RUN echo '  INSERT INTO MenuItem (name, description, price, imageUrl, available, categoryId)' >> /app/seed-db.sh
RUN echo '  SELECT "Chocolate Cake", "Rich chocolate cake with frosting", 6.99, "/images/chocolate-cake.jpg", true, 3' >> /app/seed-db.sh
RUN echo '  WHERE NOT EXISTS (SELECT * FROM MenuItem WHERE name = "Chocolate Cake");' >> /app/seed-db.sh
RUN echo '  -- Insert an admin user if none exists (password is "admin123" hashed)' >> /app/seed-db.sh
RUN echo '  INSERT INTO User (email, name, password, role)' >> /app/seed-db.sh
RUN echo '  SELECT "admin@restaurant.com", "Admin User", "$2a$10$5iD2DmpGxLJ73Hcn0QVhYO6v7/8hNPVqcIFiXsOkj2CDl5/Y65EFq", "ADMIN"' >> /app/seed-db.sh
RUN echo '  WHERE NOT EXISTS (SELECT * FROM User WHERE email = "admin@restaurant.com");' >> /app/seed-db.sh
RUN echo 'SQL' >> /app/seed-db.sh
RUN echo 'fi' >> /app/seed-db.sh
RUN echo 'echo "Database seeding completed"' >> /app/seed-db.sh
RUN chmod +x /app/seed-db.sh
RUN chown nextjs:nodejs /app/seed-db.sh

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Use the full path to the script
CMD ["/bin/sh", "/app/scripts/start.sh"] 