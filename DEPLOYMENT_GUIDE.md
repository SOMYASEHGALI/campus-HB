# CampusHB - Complete Deployment Guide for KVM Server

## 🎯 Overview
This guide will help you deploy:
- ✅ Frontend (React + Vite) - Already Done!
- 🔄 Backend (Express.js + Node.js)
- 🔄 Database (MongoDB)

---

## 📦 Part 1: MongoDB Installation

### Step 1: SSH into your KVM server
```bash
ssh your-username@your-server-ip
```

### Step 2: Install MongoDB
```bash
# Import MongoDB public GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package list
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod

# Check MongoDB status
sudo systemctl status mongod
```

### Step 3: Secure MongoDB (IMPORTANT!)
```bash
# Connect to MongoDB shell
mongosh

# Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "YourStrongPassword123!",  # Change this!
  roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
})

# Create database user for your app
use campushb
db.createUser({
  user: "campushb_user",
  pwd: "YourAppPassword123!",  # Change this!
  roles: [ { role: "readWrite", db: "campushb" } ]
})

# Exit mongosh
exit
```

### Step 4: Enable MongoDB Authentication
```bash
# Edit MongoDB config
sudo nano /etc/mongod.conf
```

Add/modify these lines:
```yaml
security:
  authorization: enabled

net:
  bindIp: 127.0.0.1
  port: 27017
```

Save and restart MongoDB:
```bash
sudo systemctl restart mongod
```

---

## 🚀 Part 2: Backend Deployment

### Step 1: Install Node.js and npm (if not already installed)
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 2: Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### Step 3: Upload your backend code
```bash
# On your local machine, create a deployment package
cd c:\Divyanshu\Divyanshu\Project\HiringBazar\CampusHB\Application\server

# Create .tar.gz file (excluding node_modules)
tar -czf backend.tar.gz --exclude=node_modules --exclude=uploads --exclude=logs .

# Upload to server using SCP
scp backend.tar.gz your-username@your-server-ip:/home/your-username/
```

### Step 4: Setup backend on server
```bash
# SSH into server
ssh your-username@your-server-ip

# Create application directory
sudo mkdir -p /var/www/campushb/backend
sudo chown -R $USER:$USER /var/www/campushb

# Extract backend files
cd /var/www/campushb/backend
tar -xzf ~/backend.tar.gz

# Install dependencies
npm install --production

# Create necessary directories
mkdir -p uploads logs

# Create .env file
nano .env
```

### Step 5: Configure .env file
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration
MONGO_URI=mongodb://campushb_user:YourAppPassword123!@localhost:27017/campushb?authSource=campushb

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Admin Key
ADMIN_KEY=admin123

# Cloudinary Configuration (if using)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (for CORS)
FRONTEND_URL=https://your-domain.com
```

Save and exit (Ctrl + X, then Y, then Enter)

### Step 6: Start backend with PM2
```bash
cd /var/www/campushb/backend

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the command it gives you (usually starts with 'sudo')

# Check status
pm2 status
pm2 logs campushb-backend
```

---

## 🔧 Part 3: Update Nginx Configuration

### Step 1: Update Nginx to proxy API requests
```bash
sudo nano /etc/nginx/sites-available/campushb.conf
```

Replace with this complete configuration:
```nginx
# Upstream for backend API
upstream backend_api {
    server 127.0.0.1:5000;
    keepalive 64;
}

server {
    listen 80;
    server_name your-domain.com;  # Change this
    
    # Frontend - Static files
    root /var/www/campushb/frontend/dist;
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
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Uploaded files - Serve from backend
    location /uploads/ {
        alias /var/www/campushb/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
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

    # Static assets
    location ~* \.(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        add_header Cache-Control "public, max-age=31536000";
    }

    # SPA routing - Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Client max body size (for file uploads)
    client_max_body_size 50M;
}
```

### Step 2: Test and reload Nginx
```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔍 Part 4: Verification & Testing

### Check MongoDB
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Test connection
mongosh -u campushb_user -p YourAppPassword123! --authenticationDatabase campushb campushb
```

### Check Backend
```bash
# Check PM2 status
pm2 status
pm2 logs campushb-backend

# Test backend directly
curl '/api/auth/test
# or whatever test endpoint you have
```

### Check Nginx
```bash
# Check Nginx status
sudo systemctl status nginx

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### Test from browser
```
https://your-domain.com/api/jobs
```

---

## 🔐 Part 5: SSL/HTTPS Setup (Recommended)

### Install Certbot
```bash
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
```

### Get SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com
```

Follow the prompts and Certbot will automatically configure HTTPS!

---

## 📊 Useful Commands

### PM2 Commands
```bash
pm2 list                    # List all processes
pm2 logs campushb-backend   # View logs
pm2 restart campushb-backend # Restart app
pm2 stop campushb-backend   # Stop app
pm2 delete campushb-backend # Delete app from PM2
pm2 monit                   # Monitor resources
```

### MongoDB Commands
```bash
sudo systemctl status mongod   # Check status
sudo systemctl start mongod    # Start MongoDB
sudo systemctl stop mongod     # Stop MongoDB
sudo systemctl restart mongod  # Restart MongoDB
mongosh                        # Connect to MongoDB shell
```

### Nginx Commands
```bash
sudo nginx -t                  # Test configuration
sudo systemctl reload nginx    # Reload Nginx
sudo systemctl restart nginx   # Restart Nginx
sudo systemctl status nginx    # Check status
```

### View Logs
```bash
# Backend logs
pm2 logs campushb-backend

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

---

## 🔄 Updating Your Application

### Update Frontend
```bash
# On local machine
cd c:\Divyanshu\Divyanshu\Project\HiringBazar\CampusHB\Application\CampusHb
npm run build

# Upload to server
scp -r dist/* your-username@your-server-ip:/var/www/campushb/frontend/dist/
```

### Update Backend
```bash
# On local machine
cd c:\Divyanshu\Divyanshu\Project\HiringBazar\CampusHB\Application\server
tar -czf backend.tar.gz --exclude=node_modules --exclude=uploads --exclude=logs .
scp backend.tar.gz your-username@your-server-ip:/tmp/

# On server
cd /var/www/campushb/backend
tar -xzf /tmp/backend.tar.gz
npm install --production
pm2 restart campushb-backend
```

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check logs
pm2 logs campushb-backend --lines 100

# Check if port 5000 is in use
sudo lsof -i :5000

# Check .env file
cat /var/www/campushb/backend/.env
```

### MongoDB connection issues
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Test connection
mongosh -u campushb_user -p --authenticationDatabase campushb campushb

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### 502 Bad Gateway
```bash
# Check if backend is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart services
pm2 restart campushb-backend
sudo systemctl reload nginx
```

---

## 📝 Notes

1. **Security**: Change all default passwords!
2. **Firewall**: Make sure ports 80, 443 are open, port 5000 should NOT be exposed
3. **Backups**: Setup regular MongoDB backups
4. **Monitoring**: Consider setting up monitoring tools
5. **Updates**: Keep your system and packages updated

---

## ✅ Checklist

- [ ] MongoDB installed and secured
- [ ] Backend code uploaded
- [ ] Dependencies installed
- [ ] .env file configured
- [ ] PM2 running backend
- [ ] Nginx configured for API proxy
- [ ] SSL certificate installed
- [ ] Application tested and working
- [ ] Logs are accessible
- [ ] Backups configured

---

**Need help?** Check the logs first, they usually tell you what's wrong!
