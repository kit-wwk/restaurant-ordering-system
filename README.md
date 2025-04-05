# Restaurant Ordering System

A full-featured restaurant ordering system built with Next.js, Prisma, and MySQL.

## Features

- Online ordering system for restaurants
- Menu management with categories
- Order management with status tracking
- Booking system for reservations
- User management with authentication
- Admin dashboard for restaurant management
- Responsive design for all devices

## Tech Stack

- **Frontend:** Next.js, React, Material UI
- **Backend:** Next.js API routes, Prisma ORM
- **Database:** MySQL
- **Authentication:** NextAuth.js
- **Deployment:** Docker, Docker Compose, AWS EC2

## Local Development

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/pm-restaurant.git
   cd pm-restaurant
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the database with Docker:

   ```bash
   docker-compose up -d mysql
   ```

4. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

5. Run database migrations and seed:

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Deployment to AWS EC2

### Prerequisites

- An AWS EC2 instance (Amazon Linux 2 recommended)
- Docker and Docker Compose installed on the EC2 instance
- Git installed on the EC2 instance

### Deployment Steps

1. Connect to your EC2 instance:

   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-public-dns
   ```

2. One-step deployment script:

   ```bash
   curl -s https://raw.githubusercontent.com/your-repo/pm-restaurant/main/scripts/deploy.sh | bash
   ```

   Or manually:

   a. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/pm-restaurant.git
   cd pm-restaurant
   ```

   b. Create production environment file:

   ```bash
   cp .env.example .env.production
   # Edit .env.production to match your production settings
   ```

   c. Set script permissions:

   ```bash
   chmod +x scripts/*.sh
   ```

   d. Start the application with Docker Compose:

   ```bash
   docker-compose up -d
   ```

3. Access the application at your EC2 instance's public DNS.

### Important Security Notes

- Update the `NEXTAUTH_SECRET` in the `.env.production` file
- Configure HTTPS using AWS Certificate Manager or Let's Encrypt
- Set up a proper database backup strategy
- Review network security groups to restrict access as needed

## Database Management

The application uses Prisma ORM to manage the database schema and queries.

- View the database schema in `prisma/schema.prisma`
- Create a new migration: `npx prisma migrate dev --name your-migration-name`
- Seed the database: `npx prisma db seed`
- Reset the database: `npx prisma migrate reset`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
