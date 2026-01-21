#!/bin/bash

# MongoDB Setup Script for CampusHB
# Run this on your KVM server after MongoDB is installed

echo "🔐 Setting up MongoDB for CampusHB"
echo "===================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}This script will:${NC}"
echo "1. Create admin user for MongoDB"
echo "2. Create application user for CampusHB"
echo "3. Enable authentication"
echo ""
read -p "Continue? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

# Generate random passwords (you can change these)
ADMIN_PASSWORD="Admin$(openssl rand -base64 12)"
APP_PASSWORD="CampusHB$(openssl rand -base64 12)"

echo ""
echo -e "${GREEN}Creating MongoDB users...${NC}"

# Create users using mongosh
mongosh <<EOF
// Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "$ADMIN_PASSWORD",
  roles: [ 
    { role: "userAdminAnyDatabase", db: "admin" }, 
    "readWriteAnyDatabase" 
  ]
})

// Create application user
use campushb
db.createUser({
  user: "campushb_user",
  pwd: "$APP_PASSWORD",
  roles: [ 
    { role: "readWrite", db: "campushb" } 
  ]
})

exit
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Users created successfully!${NC}"
    echo ""
    echo "===================================="
    echo "IMPORTANT: Save these credentials!"
    echo "===================================="
    echo ""
    echo "Admin User:"
    echo "  Username: admin"
    echo "  Password: $ADMIN_PASSWORD"
    echo ""
    echo "Application User (for CampusHB):"
    echo "  Username: campushb_user"
    echo "  Password: $APP_PASSWORD"
    echo ""
    echo "MongoDB Connection String:"
    echo "  mongodb://campushb_user:$APP_PASSWORD@localhost:27017/campushb?authSource=campushb"
    echo ""
    echo "===================================="
    echo ""
    echo "Next steps:"
    echo "1. Copy the MongoDB connection string above"
    echo "2. Update your backend .env file with MONGO_URI"
    echo "3. Enable MongoDB authentication (see below)"
    echo ""
    
    # Save credentials to file
    cat > ~/mongodb-credentials.txt <<CREDS
CampusHB MongoDB Credentials
Generated: $(date)

Admin User:
  Username: admin
  Password: $ADMIN_PASSWORD

Application User:
  Username: campushb_user
  Password: $APP_PASSWORD

MongoDB Connection String:
mongodb://campushb_user:$APP_PASSWORD@localhost:27017/campushb?authSource=campushb

CREDS
    
    echo -e "${GREEN}✓ Credentials saved to: ~/mongodb-credentials.txt${NC}"
    echo ""
    echo "To enable authentication, run:"
    echo "  sudo nano /etc/mongod.conf"
    echo ""
    echo "Add these lines:"
    echo "  security:"
    echo "    authorization: enabled"
    echo ""
    echo "Then restart MongoDB:"
    echo "  sudo systemctl restart mongod"
else
    echo "✗ Failed to create users. MongoDB might already have authentication enabled."
    echo "Try connecting with existing credentials or reset MongoDB."
fi
