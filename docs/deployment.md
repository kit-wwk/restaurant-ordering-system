# Deployment Guide

This guide provides instructions for deploying the PM Restaurant application to a production environment.

## Deployment Options

The application can be deployed in several ways:

1. **Docker Deployment (Recommended)**: Using Docker and Docker Compose
2. **Manual Deployment**: Running the application directly on a server
3. **AWS EC2 Deployment**: Specific steps for deploying to AWS EC2

## Docker Deployment

### Prerequisites

- Docker (version 20.10.x or later)
- Docker Compose (version 2.x or later)
- Git (optional, for cloning the repository)

### Steps

#### 1. Prepare the Project

Clone the repository or extract the zip file:

```bash
# Option 1: Clone the repository
git clone https://github.com/kit-wwk/restaurant-ordering-system.git
cd pm-restaurant

# Option 2: Extract from zip
mkdir pm-restaurant
cd pm-restaurant
unzip pm-restaurant.zip -d .
```

#### 2. Configure Environment Variables

```bash
# Copy the production environment example
cp .env.example .env.production
```

Edit the `.env.production` file to set production values:

```
# Database connection
DATABASE_URL="mysql://username:password@mysql:3306/restaurant_db"

# NextAuth.js configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_strong_secret_key

# API configuration
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

#### 3. Build and Start Containers

```bash
# Start all services
docker-compose up -d

# Or for newer Docker versions
docker compose up -d
```

This command starts:

- The Next.js application
- MySQL database
- Nginx web server

#### 4. Verify Deployment

Check if the containers are running:

```bash
docker ps
```

Access the application at `http://localhost` or your configured domain.

## AWS EC2 Deployment

### Prerequisites

- An AWS account
- EC2 instance (t3.small or larger recommended)
  - Amazon Linux 2 or RHEL 9 AMI
  - At least 2GB RAM
  - At least 10GB storage
- Security group with ports 80 and 443 open

### Steps

#### 1. Connect to Your EC2 Instance

```bash
ssh -i your-key.pem ec2-user@your-ec2-public-dns
```

#### 2. Install Required Software

For Amazon Linux 2:

```bash
# Update system packages
sudo yum update -y

# Install Docker
sudo amazon-linux-extras install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo yum install git -y
```

For RHEL 9:

```bash
# Update system packages
sudo dnf update -y

# Install Docker
sudo dnf install -y dnf-plugins-core
sudo dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker $USER

# Install Git
sudo dnf install -y git
```

Log out and log back in to apply group changes.

#### 3. Deploy the Application

##### Option 1: Using the Deploy Script

```bash
# Clone the repository
git clone https://github.com/kit-wwk/restaurant-ordering-system.git
cd pm-restaurant

# Set executable permissions on the deploy script
chmod +x deploy-to-ec2.sh

# Run the deploy script
./deploy-to-ec2.sh
```

##### Option 2: Manual Deployment

```bash
# Clone the repository
git clone https://github.com/kit-wwk/restaurant-ordering-system.git
cd pm-restaurant

# Create environment file
cp .env.example .env.production

# Edit environment file
nano .env.production

# Make scripts executable
chmod +x scripts/*.sh

# Start the application
docker-compose up -d
```

#### 4. Set Up Domain and SSL (Optional)

For a production deployment, you should set up a domain and SSL certificate:

1. Register a domain name (e.g., through Route 53 or another provider)
2. Point the domain to your EC2 instance's IP address
3. Set up SSL using Let's Encrypt:

```bash
# Install Certbot (Amazon Linux 2)
sudo amazon-linux-extras install epel -y
sudo yum install certbot python-certbot-nginx -y

# Install Certbot (RHEL 9)
sudo dnf install -y certbot python-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Manual Deployment

### Prerequisites

- Node.js (v18.x or later)
- npm (v9.x or later)
- MySQL (v8.x)

### Steps

#### 1. Prepare the Project

```bash
# Clone or extract the project
git clone https://github.com/kit-wwk/restaurant-ordering-system.git
cd pm-restaurant

# Install dependencies
npm ci --legacy-peer-deps
```

#### 2. Configure Environment Variables

```bash
cp .env.example .env.production
```

Edit the `.env.production` file to set production values.

#### 3. Build the Application

```bash
npm run build
```

#### 4. Set Up Database

```bash
# Apply database migrations
npx prisma migrate deploy

# Seed the database
npx prisma db seed
```

#### 5. Start the Application

For a production environment, you can use PM2 to manage the Node.js process:

```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start npm --name "restaurant" -- start

# Set up PM2 to start on system boot
pm2 startup
pm2 save
```

## Updates and Maintenance

### Updating the Application

```bash
# Navigate to your project directory
cd pm-restaurant

# Pull latest changes (if using Git)
git pull

# Or extract new zip file
unzip -o new-version.zip -d .

# Rebuild and restart (Docker deployment)
docker-compose up -d --build

# Or for manual deployment:
npm ci --legacy-peer-deps
npm run build
npx prisma migrate deploy
pm2 restart restaurant
```

### Database Backups

Set up regular database backups:

```bash
# Create a backup script
cat > backup-db.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/path/to/backups
mkdir -p $BACKUP_DIR

# For Docker deployment
docker exec -it mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD restaurant_db > $BACKUP_DIR/backup_$TIMESTAMP.sql

# For direct MySQL access
# mysqldump -u root -p restaurant_db > $BACKUP_DIR/backup_$TIMESTAMP.sql

# Keep only the last 7 backups
find $BACKUP_DIR -name "backup_*.sql" -type f -mtime +7 -delete
EOF

chmod +x backup-db.sh

# Set up a cron job to run daily
(crontab -l 2>/dev/null; echo "0 2 * * * /path/to/backup-db.sh") | crontab -
```

## Security Considerations

### Environment Variables

- Use strong, unique values for secrets
- Never commit `.env.production` to version control
- Rotate sensitive credentials periodically

### Network Security

- Configure AWS security groups to allow only necessary traffic
- Use a Web Application Firewall (WAF) if available
- Enable HTTPS and redirect HTTP to HTTPS

### Docker Security

- Keep Docker and Docker Compose updated
- Use specific image versions instead of `latest` tag
- Run containers with non-root users when possible

## Monitoring and Logging

### Server Monitoring

Set up monitoring for your EC2 instance using Amazon CloudWatch or another monitoring solution.

### Application Logs

View logs for Docker containers:

```bash
# View logs for the Next.js application
docker logs -f pm-restaurant_app_1

# View logs for MySQL
docker logs -f pm-restaurant_mysql_1

# View logs for Nginx
docker logs -f pm-restaurant_nginx_1
```

## Troubleshooting

### Common Issues

#### Docker Container Fails to Start

```bash
# Check container logs
docker logs -f container_name

# Check Docker Compose configuration
docker-compose config

# Try rebuilding
docker-compose up -d --build
```

#### Database Connection Issues

```bash
# Check if MySQL container is running
docker ps | grep mysql

# Check if the database exists
docker exec -it pm-restaurant_mysql_1 mysql -u root -p
# Enter password when prompted
SHOW DATABASES;
USE restaurant_db;
SHOW TABLES;
```

#### Nginx Configuration Issues

```bash
# Validate Nginx configuration
docker exec -it pm-restaurant_nginx_1 nginx -t

# Check Nginx logs
docker logs pm-restaurant_nginx_1
```

## Scaling

For higher traffic loads, consider:

1. Increasing EC2 instance size
2. Setting up a load balancer with multiple instances
3. Moving the database to a managed service like RDS
4. Implementing a CDN for static assets

## Deployment Diagram

```mermaid
flowchart TD
    A[User] --> B{Load Balancer}
    B --> C1[EC2 Instance 1]
    B --> C2[EC2 Instance 2]

    subgraph EC2-1["EC2 Instance 1"]
        D1[Nginx] --> E1[Next.js App]
        E1 --> F1[Local MySQL]
    end

    subgraph EC2-2["EC2 Instance 2"]
        D2[Nginx] --> E2[Next.js App]
        E2 --> F2[Local MySQL]
    end

    C1 -.-> G[(RDS MySQL)]
    C2 -.-> G

    style A fill:#f9f9f9,stroke:#333,stroke-width:2px
    style B fill:#D5F5E3,stroke:#333,stroke-width:2px
    style EC2-1 fill:#F8F9F9,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5
    style EC2-2 fill:#F8F9F9,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5
    style G fill:#D6EAF8,stroke:#333,stroke-width:2px
```

The dashed lines to RDS represent an optional high-availability setup where the application connects to an external managed database instead of the local MySQL instance.
