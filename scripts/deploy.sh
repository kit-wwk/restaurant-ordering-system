#!/bin/bash
set -e

# Restaurant Ordering System Deployment Script for RHEL 9
# Run this script on your EC2 instance to deploy the application

echo "🚀 Starting Restaurant Ordering System deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "🔧 Docker not found, installing..."
    # RHEL 9 uses dnf and podman by default, but we'll install docker-ce
    sudo dnf install -y dnf-plugins-core
    sudo dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
    sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Start and enable Docker service
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -a -G docker $USER
    
    echo "🔄 Please log out and log back in to apply Docker group changes"
    echo "   Then run this script again."
    exit 0
fi

# Check if Docker Compose is installed - RHEL 9 typically uses the docker compose plugin
if ! command -v docker-compose &> /dev/null && ! command -v docker compose &> /dev/null; then
    echo "🔧 Docker Compose not found, installing docker-compose-plugin..."
    sudo dnf install -y docker-compose-plugin
fi

# Clone or update the repository
if [ -d "pm-restaurant" ]; then
    echo "📂 Repository exists, updating..."
    cd pm-restaurant
    git pull
else
    echo "📂 Cloning repository..."
    git clone https://github.com/your-repo/pm-restaurant.git
    cd pm-restaurant
fi

# Set up environment variables
echo "🔐 Setting up environment variables..."
if [ ! -f ".env.production" ]; then
    echo "⚠️ .env.production file not found, creating..."
    # RHEL 9 EC2 uses the same metadata service
    cat > .env.production << EOF
# Production environment variables
DATABASE_URL="mysql://restaurant_user:restaurant_password@mysql:3306/restaurant_db"
NEXTAUTH_SECRET="$(openssl rand -hex 32)"
NEXTAUTH_URL="http://$(curl -s http://169.254.169.254/latest/meta-data/public-hostname)"
NODE_ENV="production"
EOF
fi

# Set permissions for scripts
echo "🔒 Setting script permissions..."
chmod +x scripts/*.sh

# Build and start the containers
echo "🏗️ Building and starting containers..."
# Check which docker-compose command to use
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.yml build
    docker-compose -f docker-compose.yml up -d
else
    # Use the docker compose plugin format
    docker compose -f docker-compose.yml build
    docker compose -f docker-compose.yml up -d
fi

# Show container status
echo "📊 Container status:"
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.yml ps
else
    docker compose -f docker-compose.yml ps
fi

echo "🌐 Application should now be running at:"
echo "http://$(curl -s http://169.254.169.254/latest/meta-data/public-hostname)"
echo
echo "✅ Deployment complete!" 