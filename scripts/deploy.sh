#!/bin/bash
# Restaurant Ordering System Deployment Script for RHEL 9
# This script automates the deployment of the restaurant ordering system on RHEL 9.
# Usage: ./deploy.sh [server-ip]

# Exit on error
set -e

# Check if IP address is provided
if [ -z "$1" ]; then
    echo "Usage: ./deploy.sh [server-ip]"
    echo "Example: ./deploy.sh 13.230.196.201"
    
    # Attempt to get the public IP as a suggestion
    SUGGESTED_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "your-server-ip")
    echo "Suggested IP: $SUGGESTED_IP"
    exit 1
fi

SERVER_IP="$1"
echo "Using server IP/hostname: $SERVER_IP"

# Check if script is run with root privileges
if [ "$(id -u)" -eq 0 ]; then
    echo "This script should not be run as root. Please run as a regular user with sudo privileges."
    exit 1
fi

# Output messages with timestamps
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "Deploying to server: $SERVER_IP"

# Install Node.js and npm if not installed
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    log "Node.js or npm not found. Installing Node.js 20.x LTS..."
    
    # Add NodeSource repository for Node.js 20.x
    sudo dnf install --allowerasing --nogpgcheck -y https://rpm.nodesource.com/pub_20.x/nodistro/repo/nodesource-release-nodistro-1.noarch.rpm
    sudo dnf install --allowerasing --nogpgcheck -y nodejs
    
    # Update npm to specific version
    log "Updating npm to version 11.2.0..."
    sudo npm install -g npm@11.2.0
    
    # Verify installation
    NODE_VERSION=$(node -v)
    NPM_VERSION=$(npm -v)
    log "Node.js $NODE_VERSION and npm $NPM_VERSION installed successfully."
else
    NODE_VERSION=$(node -v)
    NPM_VERSION=$(npm -v)
    log "Node.js $NODE_VERSION and npm $NPM_VERSION are already installed."
    
    # Check if npm needs updating
    if [[ "$NPM_VERSION" != "11.2.0" ]]; then
        log "Updating npm to version 11.2.0..."
        sudo npm install -g npm@11.2.0
        NPM_VERSION=$(npm -v)
        log "npm updated to version $NPM_VERSION."
    fi
fi

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    log "Docker not found. Installing Docker..."
    # RHEL 9 specific Docker installation
    sudo dnf -y install dnf-plugins-core
    sudo dnf config-manager --add-repo https://download.docker.com/linux/rhel/docker-ce.repo
    sudo dnf -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Start and enable Docker service
    sudo systemctl enable --now docker
    
    # Add current user to docker group to allow non-root usage
    sudo usermod -aG docker $USER
    log "Docker installed. You may need to log out and log back in for group changes to take effect."
else
    log "Docker is already installed."
fi

# Check for Docker Compose (both standalone and plugin versions)
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    log "Docker Compose not found. Checking installation options..."
    
    # Check if docker compose plugin is available but not in PATH
    if sudo find /usr/libexec/docker/cli-plugins -name "docker-compose" | grep -q docker-compose; then
        log "Docker Compose plugin found but not accessible. Creating symlink..."
        sudo ln -s $(sudo find /usr/libexec/docker/cli-plugins -name "docker-compose") /usr/local/bin/docker-compose
    else
        # Install Docker Compose plugin if it's not already installed
        log "Installing Docker Compose plugin..."
        sudo dnf -y install docker-compose-plugin
    fi
else
    log "Docker Compose is already installed."
fi

# Determine which Docker Compose command to use
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    log "Error: Docker Compose not found after installation attempt."
    exit 1
fi

log "Using Docker Compose command: $DOCKER_COMPOSE"

# Install git if not installed
if ! command -v git &> /dev/null; then
    log "Git not found. Installing git..."
    sudo dnf install -y git
    
    # Verify installation
    GIT_VERSION=$(git --version)
    log "Git $GIT_VERSION installed successfully."
else
    GIT_VERSION=$(git --version)
    log "Git $GIT_VERSION is already installed."
fi

# Clone or update repository
REPO_DIR="$HOME/pm-restaurant"
if [ -d "$REPO_DIR" ]; then
    log "Repository exists. Updating..."
    cd "$REPO_DIR"
    git pull
else
    log "Cloning repository..."
    git clone https://github.com/kit-wwk/restaurant-ordering-system.git "$REPO_DIR"
    cd "$REPO_DIR"
fi

# Create/update the environment file
log "Setting up environment variables using server IP: $SERVER_IP"
if [ -f .env.production ]; then
    log "Environment file exists. Updating API URLs..."
    # Update existing environment file with correct API URL
    sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://${SERVER_IP}/api|g" .env.production
    sed -i "s|NEXT_PUBLIC_VERCEL_URL=.*|NEXT_PUBLIC_VERCEL_URL=${SERVER_IP}|g" .env.production
    sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=http://${SERVER_IP}|g" .env.production
else
    # Create new environment file
    cp .env.example .env.production
    # Generate a random NEXTAUTH_SECRET
    echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env.production
    echo "NEXTAUTH_URL=http://${SERVER_IP}" >> .env.production
    echo "NEXT_PUBLIC_API_URL=http://${SERVER_IP}/api" >> .env.production
    echo "NEXT_PUBLIC_VERCEL_URL=${SERVER_IP}" >> .env.production
fi

# Update docker-compose.yml to set correct API URL
log "Updating docker-compose.yml with server IP: $SERVER_IP"
if [ -f docker-compose.yml ]; then
    # Replace localhost with actual server IP in docker-compose.yml
    sed -i "s|NEXT_PUBLIC_API_URL=http://localhost/api|NEXT_PUBLIC_API_URL=http://${SERVER_IP}/api|g" docker-compose.yml
    sed -i "s|NEXT_PUBLIC_VERCEL_URL=localhost|NEXT_PUBLIC_VERCEL_URL=${SERVER_IP}|g" docker-compose.yml
    sed -i "s|NEXTAUTH_URL=http://localhost|NEXTAUTH_URL=http://${SERVER_IP}|g" docker-compose.yml
    
    # Add DATABASE_NEED_SEED flag to ensure database is seeded
    if ! grep -q "DATABASE_NEED_SEED" docker-compose.yml; then
        log "Adding DATABASE_NEED_SEED environment variable to docker-compose.yml"
        # Find the app environment section and add the new variable
        sed -i '/environment:/a \      - DATABASE_NEED_SEED=true' docker-compose.yml
    fi
    
    log "docker-compose.yml updated with server IP: $SERVER_IP"
fi

# Update next.config.js to disable trailing slashes (prevent 308 redirects)
log "Ensuring Next.js is configured to prevent API redirects..."
cat > next.config.js << 'EOL'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // This setting prevents automatic redirects for API routes with/without trailing slashes
  trailingSlash: false,
  // Allow CORS for API routes
  async headers() {
    return [
      {
        // Apply these headers to all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' }
        ],
      },
    ];
  },
};

module.exports = nextConfig;
EOL

# Set execute permissions on scripts
log "Setting script permissions..."
chmod +x scripts/*.sh

# For backup and maintenance, install required packages
log "Installing required system tools..."
# Try alternative package names for netcat on RHEL 9
if ! sudo dnf install -y gzip findutils nc &> /dev/null; then
    log "Note: 'nc' package not found, trying alternative packages..."
    # Try nmap-ncat which is commonly available on RHEL
    sudo dnf install -y nmap-ncat &> /dev/null || log "Warning: Could not install netcat. MySQL connectivity check will use fallback methods."
fi

# Install AWS CLI if needed
if ! command -v aws &> /dev/null; then
    log "Installing AWS CLI..."
    sudo dnf install -y awscli || log "Warning: Could not install AWS CLI"
fi

# Create a database backup script
log "Creating database backup script..."
cat > scripts/backup-db.sh << 'EOL'
#!/bin/bash
# Database backup script

# Get container name
MYSQL_CONTAINER=$(docker ps | grep mysql | awk '{print $NF}')

if [ -z "$MYSQL_CONTAINER" ]; then
    echo "MySQL container not found!"
    exit 1
fi

# Create backup directory
BACKUP_DIR="$HOME/db_backups"
mkdir -p "$BACKUP_DIR"

# Create backup with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/restaurant_db_$TIMESTAMP.sql"

echo "Creating backup: $BACKUP_FILE"
docker exec $MYSQL_CONTAINER sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" restaurant_db' > "$BACKUP_FILE"

echo "Backup completed: $BACKUP_FILE"
echo "To restore: cat $BACKUP_FILE | docker exec -i $MYSQL_CONTAINER mysql -uroot -p\"\$MYSQL_ROOT_PASSWORD\" restaurant_db"
EOL

chmod +x scripts/backup-db.sh

# Stop any running containers first
log "Stopping any existing containers..."
$DOCKER_COMPOSE -f docker-compose.yml down || true

# Build and start the containers
log "Building and starting the application..."
log "Note: Using --legacy-peer-deps to resolve MUI dependency conflicts"
$DOCKER_COMPOSE -f docker-compose.yml up -d --build

# Check if containers are running
if $DOCKER_COMPOSE ps | grep -q "Up"; then
    log "Deployment successful!"
    log "Application is running at: http://$SERVER_IP"
    log "API should be accessible at: http://$SERVER_IP/api"
    log "For HTTPS access, configure your domain and set up SSL certificates."
    
    # Test API health check
    log "Testing API health check endpoint..."
    sleep 10  # Give the app a moment to fully start
    if curl -s "http://$SERVER_IP/api/health" | grep -q "status.*ok"; then
        log "✅ API health check passed!"
        
        # Explain the enhanced health endpoint
        log "The health API now checks database connectivity and table records."
        log "You can view detailed health information at: http://$SERVER_IP/api/health"
        log "Sample health response fields:"
        log "  - status: API status"
        log "  - timestamp: Current server time"
        log "  - environment: Node environment"
        log "  - nextPublicApiUrl: API base URL"
        log "  - database.status: Database connectivity"
        
        # Verify database is properly seeded
        log "Verifying database seeding status..."
        DB_CHECK=$(curl -s "http://$SERVER_IP/api/health")
        
        # Extract restaurant count from health check using correct field name
        RESTAURANT_COUNT=$(echo "$DB_CHECK" | grep -o '"restaurants":[0-9]\+' | grep -o '[0-9]\+')
        
        if [ -z "$RESTAURANT_COUNT" ] || [ "$RESTAURANT_COUNT" -eq "0" ]; then
            log "⚠️ Warning: Database appears to be empty. Running manual database seeding..."
            
            # Get the app container name
            APP_CONTAINER=$(docker ps | grep restaurant_app | awk '{print $NF}')
            
            if [ -n "$APP_CONTAINER" ]; then
                log "Running database seeding in container $APP_CONTAINER..."
                docker exec $APP_CONTAINER /bin/sh /app/seed-db.sh
                
                # Verify seeding was successful
                sleep 5
                DB_CHECK_AFTER=$(curl -s "http://$SERVER_IP/api/health")
                RESTAURANT_COUNT_AFTER=$(echo "$DB_CHECK_AFTER" | grep -o '"restaurants":[0-9]\+' | grep -o '[0-9]\+')
                
                if [ -n "$RESTAURANT_COUNT_AFTER" ] && [ "$RESTAURANT_COUNT_AFTER" -gt "0" ]; then
                    log "✅ Database seeding successful!"
                else
                    log "⚠️ Database seeding may have failed. Please check logs and seed manually if needed."
                    log "To manually seed the database, connect to the app container and run: /app/seed-db.sh"
                fi
            else
                log "⚠️ Could not find app container. Please check container status and seed manually if needed."
            fi
        else
            log "✅ Database already contains data ($RESTAURANT_COUNT restaurants). No seeding needed."
        fi
        
        # Provide backup instructions
        log "A database backup script has been created at: $REPO_DIR/scripts/backup-db.sh"
        log "Run this script periodically to backup your database."
        
    else
        log "⚠️ API health check failed. Please check container logs for troubleshooting."
        log "You can view app logs with: $DOCKER_COMPOSE logs app"
    fi
else
    log "⚠️ Deployment may have issues. Please check container logs:"
    log "$DOCKER_COMPOSE logs"
    exit 1
fi

log "Deployment process completed. Enjoy your Restaurant Ordering System!" 