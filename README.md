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
   git clone https://github.com/kit-wwk/restaurant-ordering-system.git
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

- An AWS EC2 instance running Amazon Linux 2 or RHEL 9
- Docker and Docker Compose installed on the EC2 instance
- Git installed on the EC2 instance

### Deployment Steps

1. Connect to your EC2 instance:

   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-public-dns   # For Amazon Linux 2
   # OR
   ssh -i your-key.pem rhel-user@your-ec2-public-dns  # For RHEL 9
   ```

2. One-step deployment script:

   ```bash
   curl -s https://raw.githubusercontent.com/your-repo/pm-restaurant/main/scripts/deploy.sh | bash
   ```

   Or manually:

   a. Clone the repository:

   ```bash
   git clone https://github.com/kit-wwk/restaurant-ordering-system.git
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
   # For Amazon Linux 2 or systems with standalone docker-compose
   docker-compose up -d

   # For RHEL 9 or systems with the Docker Compose plugin
   docker compose up -d
   ```

3. Access the application at your EC2 instance's public DNS.

### RHEL 9 Specific Notes

If you're using Red Hat Enterprise Linux 9 (RHEL 9):

1. Node.js installation:

   ```bash
   # Install Node.js 20.x LTS on RHEL 9
   sudo dnf install --allowerasing --nogpgcheck -y https://rpm.nodesource.com/pub_20.x/nodistro/repo/nodesource-release-nodistro-1.noarch.rpm
   sudo dnf install --allowerasing --nogpgcheck -y nodejs

   # Update npm to specific version
   sudo npm install -g npm@11.2.0

   # Verify installation
   node -v
   npm -v
   ```

2. Docker setup is different from Amazon Linux:

   ```bash
   # Install Docker on RHEL 9
   sudo dnf install -y dnf-plugins-core
   sudo dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
   sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

   # Start and enable Docker
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -a -G docker $USER
   ```

3. RHEL 9 typically uses the Docker Compose plugin rather than standalone docker-compose:

   ```bash
   # Use this format with RHEL 9
   docker compose up -d
   ```

4. For backup and maintenance, if you need additional packages:
   ```bash
   # Install required tools
   sudo dnf install -y gzip findutils awscli nc netcat
   ```

### Important Security Notes

- Update the `NEXTAUTH_SECRET` in the `.env.production` file
- Configure HTTPS using AWS Certificate Manager or Let's Encrypt
- Set up a proper database backup strategy
- Review network security groups to restrict access as needed
- For RHEL 9, consider using SELinux for enhanced security

### Troubleshooting

#### Dependency Conflicts

If you encounter MUI-related dependency conflicts during installation:

```
npm error While resolving: @mui/x-date-pickers@6.20.2
npm error Found: @mui/material@7.0.1
npm error Could not resolve dependency:
npm error peer @mui/material@"^5.8.6" from @mui/x-date-pickers@6.20.2
```

Use the `--legacy-peer-deps` flag with npm:

```bash
npm install --legacy-peer-deps
# OR
npm ci --legacy-peer-deps
```

The deployment script automatically includes this flag when building with Docker.

#### MySQL Connection Issues

If you encounter MySQL connection issues with the start.sh script:

```
./start.sh: line 22: nc: command not found
```

Install the netcat package:

```bash
sudo dnf install -y nc netcat
```

The script has fallbacks for environments without netcat, but installing it is recommended.

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
