#!/bin/bash
# API Redirect Fix Script for EC2
# Usage: bash fix-api-redirect.sh [server-ip] [key-file]

if [ -z "$1" ]; then
  echo "Usage: bash fix-api-redirect.sh [server-ip] [key-file]"
  echo "Example: bash fix-api-redirect.sh 13.230.196.201 ~/.ssh/my-ec2-key.pem"
  exit 1
fi

SERVER_IP=$1
KEY_FILE=$2

# Set SSH options
SSH_OPTS=""
if [ ! -z "$KEY_FILE" ]; then
  SSH_OPTS="-i $KEY_FILE"
fi

echo "Fixing API redirects for server: $SERVER_IP"

# Create the nginx configuration that fixes trailing slash redirects
echo "Creating NGINX configuration..."
cat > nginx-fix.conf << 'EOL'
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

# Create next.config.js to properly handle trailing slashes
echo "Creating Next.js config to prevent redirect issues..."
cat > next-fix.config.js << 'EOL'
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

# Copy the files to the EC2 server
echo "Copying fix files to EC2 server..."
scp $SSH_OPTS -o StrictHostKeyChecking=no nginx-fix.conf next-fix.config.js ec2-user@$SERVER_IP:/home/ec2-user/

# Apply the fix on the EC2 server
echo "Applying fix on EC2 server..."
ssh $SSH_OPTS -o StrictHostKeyChecking=no ec2-user@$SERVER_IP << EOF
cd /home/ec2-user

# Backup the old config files
sudo mkdir -p backups
sudo mv nginx.conf backups/nginx.conf.bak || true
sudo mv next.config.js backups/next.config.js.bak || true

# Apply the new configuration
sudo mv nginx-fix.conf nginx.conf
sudo mv next-fix.config.js next.config.js

# Restart the containers to apply the changes
sudo docker compose restart nginx

echo "Fix applied. API redirects should now work correctly."
echo "If there are still issues, you might need to rebuild the app container:"
echo "sudo docker compose down && sudo docker compose up -d"
EOF

echo "API redirect fix has been deployed to $SERVER_IP"
echo "To test, try: curl -v http://$SERVER_IP/api/health" 