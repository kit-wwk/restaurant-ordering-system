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

    # Node.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Special handling for API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # Increase timeout for API calls
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
        send_timeout 300;
    }

    # Health check endpoint
    location /health {
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

# Create a deployment package
echo "Creating deployment package..."
tar -czf deployment.tar.gz \
  docker-compose.ec2.yml \
  scripts \
  nginx.conf \
  .env.production

# Copy files to EC2
echo "Copying files to EC2 server at $SERVER_IP..."
scp -o StrictHostKeyChecking=no deployment.tar.gz ec2-user@$SERVER_IP:/home/ec2-user/

# Execute deployment on EC2
echo "Executing deployment on EC2..."
ssh -o StrictHostKeyChecking=no ec2-user@$SERVER_IP << 'ENDSSH'
cd /home/ec2-user
tar -xzf deployment.tar.gz
mv docker-compose.ec2.yml docker-compose.yml
sudo docker compose pull || true
sudo docker compose down || true
sudo docker compose up -d
rm deployment.tar.gz
ENDSSH

echo "Deployment completed to $SERVER_IP"
echo "You can access the application at http://$SERVER_IP" 