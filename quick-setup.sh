#!/bin/bash

# CampusHB - Quick Setup Script (Code Already on Server)
# Run this script where your code is cloned

echo "🚀 CampusHB Quick Setup"
echo "======================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get current directory
CURRENT_DIR=$(pwd)

echo ""
echo -e "${YELLOW}Current directory: $CURRENT_DIR${NC}"
echo ""
echo "This script will setup:"
echo "1. Backend (Express.js + MongoDB)"
echo "2. Frontend (React build)"
echo "3. PM2 process manager"
echo "4. Nginx configuration"
echo ""
read -p "Continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# ============================================
# PART 1: BACKEND SETUP
# ============================================

echo ""
echo "================================"
echo "PART 1: Backend Setup"
echo "================================"

# Find backend directory
if [ -d "server" ]; then
    BACKEND_DIR="$CURRENT_DIR/server"
elif [ -d "Application/server" ]; then
    BACKEND_DIR="$CURRENT_DIR/Application/server"
else
    echo -e "${RED}✗ Backend directory not found!${NC}"
    read -p "Enter backend directory path: " BACKEND_DIR
fi

echo -e "${YELLOW}Backend directory: $BACKEND_DIR${NC}"
cd $BACKEND_DIR

# Install backend dependencies
echo ""
echo -e "${YELLOW}Installing backend dependencies...${NC}"
npm install --production
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Create necessary directories
echo ""
echo -e "${YELLOW}Creating uploads and logs directories...${NC}"
mkdir -p uploads logs
echo -e "${GREEN}✓ Directories created${NC}"

# Check/Create .env file
echo ""
echo -e "${YELLOW}Checking .env file...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}✗ .env file not found!${NC}"
    echo "Creating .env template..."
    
    cat > .env <<EOF
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/campushb

# JWT Secret (Auto-generated)
JWT_SECRET=$(openssl rand -base64 32)

# Admin Key
ADMIN_KEY=admin123

# Frontend URL
FRONTEND_URL=http://localhost

# Cloudinary (Optional)
# CLOUDINARY_CLOUD_NAME=
# CLOUDINARY_API_KEY=
# CLOUDINARY_API_SECRET=
EOF
    
    echo -e "${GREEN}✓ .env template created${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit .env file if needed${NC}"
    echo "Run: nano .env"
    echo ""
    read -p "Press Enter to continue..."
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Install PM2 globally
echo ""
echo -e "${YELLOW}Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    echo -e "${GREEN}✓ PM2 installed${NC}"
else
    echo -e "${GREEN}✓ PM2 already installed${NC}"
fi

# Start backend with PM2
echo ""
echo -e "${YELLOW}Starting backend with PM2...${NC}"

# Check if ecosystem.config.js exists
if [ ! -f ecosystem.config.js ]; then
    echo "Creating ecosystem.config.js..."
    cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'campushb-backend',
    script: './server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF
fi

# Start or restart PM2
if pm2 describe campushb-backend > /dev/null 2>&1; then
    pm2 restart campushb-backend
    echo -e "${GREEN}✓ Backend restarted${NC}"
else
    pm2 start ecosystem.config.js
    pm2 save
    echo -e "${GREEN}✓ Backend started${NC}"
fi

# Setup PM2 startup
pm2 startup systemd -u $USER --hp $HOME | grep "sudo" | bash

# ============================================
# PART 2: FRONTEND SETUP
# ============================================

echo ""
echo "================================"
echo "PART 2: Frontend Setup"
echo "================================"

# Find frontend directory
cd $CURRENT_DIR
if [ -d "CampusHb" ]; then
    FRONTEND_DIR="$CURRENT_DIR/CampusHb"
elif [ -d "Application/CampusHb" ]; then
    FRONTEND_DIR="$CURRENT_DIR/Application/CampusHb"
else
    echo -e "${RED}✗ Frontend directory not found!${NC}"
    read -p "Enter frontend directory path: " FRONTEND_DIR
fi

echo -e "${YELLOW}Frontend directory: $FRONTEND_DIR${NC}"
cd $FRONTEND_DIR

# Install frontend dependencies
echo ""
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Build frontend
echo ""
echo -e "${YELLOW}Building frontend...${NC}"
npm run build
echo -e "${GREEN}✓ Frontend built successfully${NC}"

# Copy dist to web directory
echo ""
echo -e "${YELLOW}Setting up web directory...${NC}"
sudo mkdir -p /var/www/campushb/frontend
sudo cp -r dist/* /var/www/campushb/frontend/
sudo chown -R www-data:www-data /var/www/campushb/frontend
echo -e "${GREEN}✓ Frontend files copied${NC}"

# ============================================
# PART 3: NGINX SETUP
# ============================================

echo ""
echo "================================"
echo "PART 3: Nginx Configuration"
echo "================================"

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Nginx not found. Installing...${NC}"
    sudo apt-get update
    sudo apt-get install -y nginx
    echo -e "${GREEN}✓ Nginx installed${NC}"
else
    echo -e "${GREEN}✓ Nginx already installed${NC}"
fi

# Create Nginx configuration
echo ""
echo -e "${YELLOW}Creating Nginx configuration...${NC}"

read -p "Enter your domain name (or press Enter for 'localhost'): " DOMAIN_NAME
DOMAIN_NAME=${DOMAIN_NAME:-localhost}

sudo tee /etc/nginx/sites-available/campushb.conf > /dev/null <<EOF
# Upstream for backend API
upstream backend_api {
    server 127.0.0.1:5000;
    keepalive 64;
}

server {
    listen 80;
    server_name $DOMAIN_NAME;
    
    # Frontend - Static files
    root /var/www/campushb/frontend;
    index index.html;

    # MIME types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # API requests - Proxy to backend
    location /api/ {
        proxy_pass http://backend_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Uploaded files
    location /uploads/ {
        alias $BACKEND_DIR/uploads/;
        expires 30d;
    }

    # JavaScript files
    location ~* \.(js|mjs)$ {
        add_header Content-Type application/javascript;
        add_header Cache-Control "public, max-age=31536000";
    }

    # CSS files
    location ~* \.css$ {
        add_header Content-Type text/css;
        add_header Cache-Control "public, max-age=31536000";
    }

    # SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Max upload size
    client_max_body_size 50M;
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/campushb.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
echo ""
echo -e "${YELLOW}Testing Nginx configuration...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✓ Nginx configuration valid${NC}"
    sudo systemctl restart nginx
    echo -e "${GREEN}✓ Nginx restarted${NC}"
else
    echo -e "${RED}✗ Nginx configuration error${NC}"
    exit 1
fi

# ============================================
# PART 4: MONGODB CHECK
# ============================================

echo ""
echo "================================"
echo "PART 4: MongoDB Check"
echo "================================"

if sudo systemctl is-active --quiet mongod; then
    echo -e "${GREEN}✓ MongoDB is running${NC}"
else
    echo -e "${YELLOW}MongoDB is not running${NC}"
    echo "Starting MongoDB..."
    sudo systemctl start mongod
    sudo systemctl enable mongod
    echo -e "${GREEN}✓ MongoDB started${NC}"
fi

# ============================================
# FINAL STATUS
# ============================================

echo ""
echo "================================"
echo "✅ SETUP COMPLETE!"
echo "================================"
echo ""

# Show status
echo -e "${GREEN}Backend Status:${NC}"
pm2 status

echo ""
echo -e "${GREEN}Services Status:${NC}"
echo "MongoDB: $(sudo systemctl is-active mongod)"
echo "Nginx: $(sudo systemctl is-active nginx)"

echo ""
echo -e "${YELLOW}Your application is ready!${NC}"
echo "URL: http://$DOMAIN_NAME"
echo ""

echo -e "${YELLOW}Useful Commands:${NC}"
echo "  Backend logs:    pm2 logs campushb-backend"
echo "  Restart backend: pm2 restart campushb-backend"
echo "  Nginx logs:      sudo tail -f /var/log/nginx/error.log"
echo "  MongoDB status:  sudo systemctl status mongod"
echo ""

# Test backend
echo -e "${YELLOW}Testing backend...${NC}"
sleep 2
if curl -s http://localhost:5000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is responding${NC}"
else
    echo -e "${RED}✗ Backend not responding. Check logs: pm2 logs${NC}"
fi

echo ""
echo -e "${GREEN}🎉 All Done! Visit: http://$DOMAIN_NAME${NC}"
