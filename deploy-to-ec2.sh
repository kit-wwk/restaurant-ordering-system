#!/bin/bash
# EC2 Deployment Script with API route handling
# Usage: bash deploy-to-ec2.sh [server-ip]

if [ -z "$1" ]; then
  echo "Usage: bash deploy-to-ec2.sh [server-ip]"
  exit 1
fi

SERVER_IP=$1

# Build the app locally
echo "Building application..."
docker compose build app

# Create the nginx configuration with special API handling
echo "Creating nginx configuration for API routes..."
cat > nginx.conf << 'EOL'
server {
    listen 80;
    server_name _;
    
    # Set client max body size to 10M
    client_max_body_size 10M;

    # Enhanced logging for debugging redirects
    error_log /var/log/nginx/restaurant_error.log debug;
    access_log /var/log/nginx/restaurant_access.log;

    # Node.js app
    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        # Add header to help identify proxy source in debugging
        proxy_set_header X-NGINX-PROXY true;
    }

    # Special handling for API routes - more direct approach
    # Important: No trailing slash in the location to match both /api and /api/
    location /api {
        # Important: No trailing slash in proxy_pass to prevent redirect
        proxy_pass http://app:3000/api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # Add header to help identify proxy source in debugging
        proxy_set_header X-NGINX-PROXY true;
        # Disable caching for API requests
        proxy_no_cache 1;
        proxy_cache_bypass 1;
        # Increase timeout for API calls
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
        send_timeout 300;
        # Add CORS headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range' always;
    }

    # Special handling for admin API routes without trailing slash
    location /api/admin {
        # Important: No trailing slash to prevent redirects
        proxy_pass http://app:3000/api/admin;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # Add header to help identify proxy source in debugging
        proxy_set_header X-NGINX-PROXY true;
        proxy_set_header X-Original-URI $request_uri;
        # Disable caching for admin API requests
        proxy_no_cache 1;
        proxy_cache_bypass 1;
        # Increase timeout for API calls
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
        send_timeout 300;
    }

    # Health check endpoint
    location = /health {
        access_log off;
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
EOL

# Create a docker-compose configuration for EC2
echo "Creating docker-compose configuration for EC2..."
cat > docker-compose.ec2.yml << 'EOL'
version: "3.8"
services:
  app:
    container_name: restaurant_app
    image: pm-restaurant-app:latest
    restart: always
    ports:
      - "3000:3000"
      - "9229:9229"
    environment:
      - DATABASE_URL=mysql://restaurant_user:restaurant_password@mysql:3306/restaurant_db
      - NEXTAUTH_SECRET=your-ec2-deployment-secret-key-change-me
      - NEXTAUTH_URL=http://${SERVER_IP}
      - NODE_ENV=production
      - NEXT_PUBLIC_SKIP_ESLINT_CHECK=true
      - DEBUG=1
      - NEXT_PUBLIC_API_URL=http://${SERVER_IP}/api
      - NEXT_PUBLIC_VERCEL_URL=${SERVER_IP}
      - HOSTNAME=0.0.0.0
      - PORT=3000
    depends_on:
      - mysql
    networks:
      - restaurant_network

  mysql:
    image: mysql:8.0
    container_name: restaurant_mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: restaurant_db
      MYSQL_USER: restaurant_user
      MYSQL_PASSWORD: restaurant_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - restaurant_network
    command: --default-authentication-plugin=mysql_native_password --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

  nginx:
    image: nginx:alpine
    container_name: restaurant_nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - app
    networks:
      - restaurant_network

networks:
  restaurant_network:
    driver: bridge

volumes:
  mysql_data:
EOL

# Replace server IP in the docker-compose file
sed -i.bak "s/\${SERVER_IP}/$SERVER_IP/g" docker-compose.ec2.yml

# Create or update the next.config.js file to properly handle trailing slashes
echo "Creating Next.js configuration for API handling..."
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

# Create a deployment package
echo "Creating deployment package..."
tar -czf deployment.tar.gz \
  docker-compose.ec2.yml \
  scripts \
  nginx.conf \
  next.config.js \
  .env.production

# Copy files to EC2 (add your key file path if needed)
echo "Copying files to EC2 server at $SERVER_IP..."
scp -o StrictHostKeyChecking=no deployment.tar.gz ec2-user@$SERVER_IP:/home/ec2-user/

# Execute deployment on EC2
echo "Executing deployment on EC2..."
ssh -o StrictHostKeyChecking=no ec2-user@$SERVER_IP << 'ENDSSH'
cd /home/ec2-user
tar -xzf deployment.tar.gz
mv docker-compose.ec2.yml docker-compose.yml

# Make sure we have the scripts directory
mkdir -p scripts

# Ensure everything is readable
chmod -R +r .

# Pull and rebuild
sudo docker compose pull || true
sudo docker compose down || true
sudo docker compose up -d

# Clean up
rm deployment.tar.gz
ENDSSH

echo "Deployment completed to $SERVER_IP"
echo "You can access the application at http://$SERVER_IP" 

echo "=== IMPORTANT NEXT STEPS ==="
echo "1. SSH into your server and run: 'sudo docker logs restaurant_app' to check for errors"
echo "2. Test API endpoints with: curl -v http://$SERVER_IP/api/health"
echo "3. If API issues persist, check NGINX logs: 'sudo docker logs restaurant_nginx'" 