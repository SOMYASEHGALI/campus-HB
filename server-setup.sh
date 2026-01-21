#!/bin/bash

# CampusHB Backend Setup Script
# Run this on your KVM server after uploading backend.zip

echo "🚀 CampusHB Backend Setup"
echo "========================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
BACKEND_DIR="/var/www/campushb/backend"
APP_NAME="campushb-backend"

echo ""
echo -e "${YELLOW}This script will:${NC}"
echo "1. Create application directory"
echo "2. Extract backend files"
echo "3. Install dependencies"
echo "4. Setup PM2"
echo "5. Start your backend"
echo ""

# Step 1: Create directories
echo -e "${YELLOW}Step 1: Creating directories...${NC}"
sudo mkdir -p /var/www/campushb/backend
sudo chown -R $USER:$USER /var/www/campushb
echo -e "${GREEN}✓ Directories created${NC}"

# Step 2: Extract backend files
echo ""
echo -e "${YELLOW}Step 2: Extracting backend files...${NC}"
cd $BACKEND_DIR

if [ -f ~/backend.zip ]; then
    unzip -o ~/backend.zip
    echo -e "${GREEN}✓ Files extracted${NC}"
else
    echo -e "${RED}✗ backend.zip not found in home directory!${NC}"
    echo "Please upload backend.zip to /home/$USER/ first"
    exit 1
fi

# Step 3: Install dependencies
echo ""
echo -e "${YELLOW}Step 3: Installing dependencies...${NC}"
npm install --production
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 4: Create necessary directories
echo ""
echo -e "${YELLOW}Step 4: Creating uploads and logs directories...${NC}"
mkdir -p uploads logs
echo -e "${GREEN}✓ Directories created${NC}"

# Step 5: Check for .env file
echo ""
echo -e "${YELLOW}Step 5: Checking .env file...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}✗ .env file not found!${NC}"
    echo ""
    echo "Creating .env template..."
    cat > .env <<EOF
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration (UPDATE THIS!)
MONGO_URI=mongodb://localhost:27017/campushb

# JWT Secret (CHANGE THIS!)
JWT_SECRET=$(openssl rand -base64 32)

# Admin Key
ADMIN_KEY=admin123

# Frontend URL (UPDATE THIS!)
FRONTEND_URL=https://your-domain.com

# Cloudinary (if using)
# CLOUDINARY_CLOUD_NAME=
# CLOUDINARY_API_KEY=
# CLOUDINARY_API_SECRET=
EOF
    echo -e "${GREEN}✓ .env template created${NC}"
    echo ""
    echo -e "${YELLOW}IMPORTANT: Edit .env file with your configuration:${NC}"
    echo "  nano .env"
    echo ""
    echo "Update these values:"
    echo "  - MONGO_URI (if using authentication)"
    echo "  - FRONTEND_URL (your actual domain)"
    echo ""
    read -p "Press Enter after editing .env file..."
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Step 6: Install PM2 if not installed
echo ""
echo -e "${YELLOW}Step 6: Checking PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
    echo -e "${GREEN}✓ PM2 installed${NC}"
else
    echo -e "${GREEN}✓ PM2 already installed${NC}"
fi

# Step 7: Start/Restart backend with PM2
echo ""
echo -e "${YELLOW}Step 7: Starting backend...${NC}"

if pm2 describe $APP_NAME > /dev/null 2>&1; then
    echo "Restarting existing backend..."
    pm2 restart $APP_NAME
else
    echo "Starting backend for the first time..."
    pm2 start ecosystem.config.js
    pm2 save
    
    # Setup PM2 startup
    echo ""
    echo -e "${YELLOW}Setting up PM2 to start on boot...${NC}"
    pm2 startup | grep "sudo" | bash
fi

echo -e "${GREEN}✓ Backend started${NC}"

# Step 8: Display status
echo ""
echo "================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "================================"
echo ""

# Show PM2 status
pm2 status

echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo "  View logs:       pm2 logs $APP_NAME"
echo "  Restart:         pm2 restart $APP_NAME"
echo "  Stop:            pm2 stop $APP_NAME"
echo "  Monitor:         pm2 monit"
echo ""

# Test backend
echo -e "${YELLOW}Testing backend...${NC}"
sleep 2
if curl -s http://localhost:5000 > /dev/null; then
    echo -e "${GREEN}✓ Backend is responding on port 5000${NC}"
else
    echo -e "${RED}✗ Backend is not responding. Check logs:${NC}"
    echo "  pm2 logs $APP_NAME"
fi

echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Update Nginx configuration"
echo "2. Test your API endpoints"
echo "3. Setup MongoDB authentication (if not done)"
echo ""
echo "Your backend is running at: http://localhost:5000"
