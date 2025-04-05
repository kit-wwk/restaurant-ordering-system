#!/bin/bash
set -e

# Restaurant Ordering System Deployment Script
# Run this script on your EC2 instance to deploy the application

echo "🚀 Starting Restaurant Ordering System deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "🔧 Docker not found, installing..."
    sudo amazon-linux-extras install docker -y
    sudo service docker start
    sudo systemctl enable docker
    sudo usermod -a -G docker ec2-user
    
    # Install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    echo "🔄 Please log out and log back in to apply Docker group changes"
    echo "   Then run this script again."
    exit 0
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "🔧 Docker Compose not found, installing..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
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
docker-compose -f docker-compose.yml build
docker-compose -f docker-compose.yml up -d

# Show container status
echo "📊 Container status:"
docker-compose -f docker-compose.yml ps

echo "🌐 Application should now be running at:"
echo "http://$(curl -s http://169.254.169.254/latest/meta-data/public-hostname)"
echo
echo "✅ Deployment complete!" 