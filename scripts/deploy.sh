#!/bin/bash
# Restaurant Ordering System Deployment Script for RHEL 9
# This script automates the deployment of the restaurant ordering system on RHEL 9.

# Exit on error
set -e

# Check if script is run with root privileges
if [ "$(id -u)" -eq 0 ]; then
    echo "This script should not be run as root. Please run as a regular user with sudo privileges."
    exit 1
fi

# Output messages with timestamps
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

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

# Clone or update repository
REPO_DIR="$HOME/pm-restaurant"
if [ -d "$REPO_DIR" ]; then
    log "Repository exists. Updating..."
    cd "$REPO_DIR"
    git pull
else
    log "Cloning repository..."
    git clone https://github.com/your-repo/pm-restaurant.git "$REPO_DIR"
    cd "$REPO_DIR"
fi

# Set up environment if not already configured
if [ ! -f .env.production ]; then
    log "Setting up environment variables..."
    cp .env.example .env.production
    # Generate a random NEXTAUTH_SECRET
    echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env.production
    echo "NEXTAUTH_URL=http://$(curl -s http://169.254.169.254/latest/meta-data/public-hostname)" >> .env.production
    log "Environment file created. Please review .env.production and update values if needed."
fi

# Set execute permissions on scripts
log "Setting script permissions..."
chmod +x scripts/*.sh

# Build and start the containers
log "Building and starting the application..."
$DOCKER_COMPOSE -f docker-compose.yml up -d --build

# Check if containers are running
if $DOCKER_COMPOSE ps | grep -q "Up"; then
    PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
    log "Deployment successful!"
    log "Application is running at: http://$PUBLIC_IP"
    log "For HTTPS access, configure your domain and set up SSL certificates."
else
    log "Error: Containers failed to start. Check logs with: $DOCKER_COMPOSE logs"
    exit 1
fi

# Final instructions
log "To view logs: $DOCKER_COMPOSE logs -f"
log "To stop the application: $DOCKER_COMPOSE down"
log "To set up HTTPS, configure a domain and SSL certificates." 