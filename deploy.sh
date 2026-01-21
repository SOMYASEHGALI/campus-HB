#!/bin/bash

# CampusHB - Quick Deployment Script
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 CampusHB Deployment Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="/var/www/campushb/backend"
FRONTEND_DIR="/var/www/campushb/frontend/dist"
APP_NAME="campushb-backend"

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run this script as root"
    exit 1
fi

# Step 1: Check MongoDB
echo ""
print_info "Checking MongoDB..."
if sudo systemctl is-active --quiet mongod; then
    print_success "MongoDB is running"
else
    print_error "MongoDB is not running. Starting MongoDB..."
    sudo systemctl start mongod
    sleep 2
    if sudo systemctl is-active --quiet mongod; then
        print_success "MongoDB started successfully"
    else
        print_error "Failed to start MongoDB. Please check logs."
        exit 1
    fi
fi

# Step 2: Check Node.js and PM2
echo ""
print_info "Checking Node.js and PM2..."
if command -v node &> /dev/null; then
    print_success "Node.js $(node --version) is installed"
else
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if command -v pm2 &> /dev/null; then
    print_success "PM2 is installed"
else
    print_error "PM2 is not installed. Installing PM2..."
    sudo npm install -g pm2
    print_success "PM2 installed successfully"
fi

# Step 3: Create directories if they don't exist
echo ""
print_info "Creating application directories..."
sudo mkdir -p /var/www/campushb/backend
sudo mkdir -p /var/www/campushb/frontend/dist
sudo chown -R $USER:$USER /var/www/campushb
print_success "Directories created"

# Step 4: Deploy Backend
echo ""
print_info "Deploying backend..."
if [ -f ~/backend.tar.gz ]; then
    cd $BACKEND_DIR
    tar -xzf ~/backend.tar.gz
    print_success "Backend files extracted"
    
    # Install dependencies
    print_info "Installing backend dependencies..."
    npm install --production
    print_success "Dependencies installed"
    
    # Create necessary directories
    mkdir -p uploads logs
    
    # Check if .env exists
    if [ ! -f .env ]; then
        print_error ".env file not found! Please create it from .env.example"
        print_info "Run: cp .env.example .env and edit it with your configuration"
        exit 1
    fi
    
    # Start/Restart with PM2
    if pm2 describe $APP_NAME > /dev/null 2>&1; then
        print_info "Restarting backend..."
        pm2 restart $APP_NAME
    else
        print_info "Starting backend for the first time..."
        pm2 start ecosystem.config.js
        pm2 save
    fi
    
    print_success "Backend deployed successfully"
else
    print_error "backend.tar.gz not found in home directory"
    print_info "Please upload backend.tar.gz to your home directory first"
fi

# Step 5: Check Nginx
echo ""
print_info "Checking Nginx configuration..."
if sudo nginx -t 2>&1 | grep -q "successful"; then
    print_success "Nginx configuration is valid"
    sudo systemctl reload nginx
    print_success "Nginx reloaded"
else
    print_error "Nginx configuration has errors. Please fix them."
    sudo nginx -t
    exit 1
fi

# Step 6: Display status
echo ""
echo "================================"
print_success "Deployment completed!"
echo ""
print_info "Application Status:"
pm2 status

echo ""
print_info "Useful commands:"
echo "  View logs:        pm2 logs $APP_NAME"
echo "  Restart backend:  pm2 restart $APP_NAME"
echo "  Stop backend:     pm2 stop $APP_NAME"
echo "  MongoDB status:   sudo systemctl status mongod"
echo "  Nginx status:     sudo systemctl status nginx"

echo ""
print_info "Check your application at: http://your-domain.com"
