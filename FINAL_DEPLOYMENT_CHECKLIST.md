# 🚀 Final Deployment Checklist for campushb.hiringbazaar.in

## Pre-Deployment (On Windows - Local Machine)

### Step 1: Fix API URLs ⚠️ CRITICAL
```powershell
cd c:\Divyanshu\Divyanshu\Project\HiringBazar\CampusHB\Application\CampusHb

# Option A: Use VS Code Find & Replace
# Ctrl + Shift + H
# Find: ''/api/
# Replace: '/api/
# Click "Replace All"

# Option B: Run PowerShell script
.\fix-api-urls.ps1
```

### Step 2: Test Locally
```powershell
npm run dev
# Test that everything still works
```

### Step 3: Build Frontend
```powershell
npm run build
# Creates optimized production build in 'dist' folder
```

### Step 4: Commit Changes to Git
```powershell
git add .
git commit -m "Fix API URLs for production deployment"
git push origin main
```

---

## Deployment (On Server - via SSH)

### Step 1: SSH into Server
```bash
ssh username@your-server-ip
```

### Step 2: Navigate to Your Cloned Repo
```bash
cd /path/to/your/CampusHB
# Example: cd /root/CampusHB or cd /home/user/CampusHB
```

### Step 3: Pull Latest Changes
```bash
git pull origin main
```

### Step 4: Run Quick Setup Script
```bash
chmod +x Application/quick-setup.sh
cd Application
./quick-setup.sh
```

**When prompted:**
- Domain name: `campushb.hiringbazaar.in`
- Edit .env: Press Enter (default values are fine for now)

---

## Manual Setup (If Script Fails)

### Backend Setup
```bash
cd /path/to/repo/Application/server

# Install dependencies
npm install --production

# Create directories
mkdir -p uploads logs

# Create .env file
nano .env
```

Paste this:
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb://localhost:27017/campushb
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_KEY=admin123
FRONTEND_URL=http://campushb.hiringbazaar.in
```

Save (Ctrl+X, Y, Enter)

```bash
# Install PM2
sudo npm install -g pm2

# Start backend
pm2 start server.js --name campushb-backend
pm2 save
pm2 startup
# Run the command it gives you
```

### Frontend Setup
```bash
cd /path/to/repo/Application/CampusHb

# Install dependencies
npm install

# Build
npm run build

# Copy to web directory
sudo mkdir -p /var/www/campushb/frontend
sudo cp -r dist/* /var/www/campushb/frontend/
sudo chown -R www-data:www-data /var/www/campushb/frontend
```

### Nginx Setup
```bash
sudo nano /etc/nginx/sites-available/campushb.conf
```

Paste this:
```nginx
upstream backend_api {
    server 127.0.0.1:5000;
    keepalive 64;
}

server {
    listen 80;
    server_name campushb.hiringbazaar.in;
    
    root /var/www/campushb/frontend;
    index index.html;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript;

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
    }

    location /uploads/ {
        alias /path/to/repo/Application/server/uploads/;
        expires 30d;
    }

    location ~* \.(js|mjs)$ {
        add_header Content-Type application/javascript;
        add_header Cache-Control "public, max-age=31536000";
    }

    location ~* \.css$ {
        add_header Content-Type text/css;
        add_header Cache-Control "public, max-age=31536000";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    client_max_body_size 50M;
}
```

**IMPORTANT:** Replace `/path/to/repo/Application/server/uploads/` with your actual path!

Save and enable:
```bash
sudo ln -s /etc/nginx/sites-available/campushb.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## Verification

### Check All Services
```bash
# MongoDB
sudo systemctl status mongod

# Backend (PM2)
pm2 status
pm2 logs campushb-backend --lines 20

# Nginx
sudo systemctl status nginx
```

### Test API
```bash
# Test backend directly
curl http://localhost:5000

# Test through Nginx
curl http://campushb.hiringbazaar.in/api/jobs
```

### Test in Browser
1. Open: `http://campushb.hiringbazaar.in`
2. Open browser console (F12)
3. Check for errors
4. Try to register/login
5. Test job listings

---

## Post-Deployment

### Setup SSL (Recommended)
```bash
# Install Certbot
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d campushb.hiringbazaar.in

# Auto-renewal test
sudo certbot renew --dry-run
```

After SSL, your site will be: `https://campushb.hiringbazaar.in`

### Setup MongoDB Authentication (Recommended)
```bash
# Run MongoDB setup script
cd /path/to/repo/Application
chmod +x setup-mongodb.sh
./setup-mongodb.sh

# Update backend .env with the connection string it provides
```

### Setup Automated Backups
```bash
# Setup MongoDB backup
chmod +x backup-mongodb.sh

# Add to crontab (daily backup at 2 AM)
crontab -e

# Add this line:
0 2 * * * /path/to/repo/Application/backup-mongodb.sh
```

---

## Troubleshooting

### Frontend shows blank page
```bash
# Check if files exist
ls -la /var/www/campushb/frontend/

# Rebuild and redeploy
cd /path/to/repo/Application/CampusHb
npm run build
sudo cp -r dist/* /var/www/campushb/frontend/
```

### API calls return 404
```bash
# Check backend is running
pm2 status

# Check Nginx config
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### CORS errors
```bash
# Update backend .env
cd /path/to/repo/Application/server
nano .env
# Set: FRONTEND_URL=http://campushb.hiringbazaar.in

# Restart backend
pm2 restart campushb-backend
```

### 502 Bad Gateway
```bash
# Backend not running
pm2 restart campushb-backend

# Check if port 5000 is in use
sudo lsof -i :5000

# Check backend logs
pm2 logs campushb-backend
```

---

## Quick Commands Reference

```bash
# Backend
pm2 status                      # Check status
pm2 logs campushb-backend       # View logs
pm2 restart campushb-backend    # Restart
pm2 stop campushb-backend       # Stop

# Frontend rebuild
cd /path/to/CampusHb
npm run build
sudo cp -r dist/* /var/www/campushb/frontend/

# Nginx
sudo nginx -t                   # Test config
sudo systemctl reload nginx     # Reload
sudo tail -f /var/log/nginx/error.log  # Errors

# MongoDB
sudo systemctl status mongod    # Status
sudo systemctl restart mongod   # Restart
```

---

## ✅ Final Checklist

### Before Deployment
- [ ] Fixed all `localhost:5000` URLs to `/api`
- [ ] Tested locally
- [ ] Built production bundle
- [ ] Committed changes to Git

### On Server
- [ ] Pulled latest code
- [ ] Backend running (PM2)
- [ ] Frontend built and deployed
- [ ] Nginx configured with correct domain
- [ ] MongoDB running
- [ ] All services started

### Testing
- [ ] Site loads: `http://campushb.hiringbazaar.in`
- [ ] Can register new user
- [ ] Can login
- [ ] Can view jobs
- [ ] Can apply to jobs
- [ ] Admin panel works
- [ ] File uploads work
- [ ] No console errors

### Optional (Recommended)
- [ ] SSL certificate installed
- [ ] MongoDB authentication enabled
- [ ] Automated backups configured
- [ ] Monitoring setup

---

## 🎉 Success!

Your application should now be live at:
**http://campushb.hiringbazaar.in**

(Or **https://campushb.hiringbazaar.in** if SSL is configured)

---

## Support

If you encounter issues:
1. Check logs first (PM2, Nginx, MongoDB)
2. Verify all services are running
3. Test each component individually
4. Review the troubleshooting section

**Logs locations:**
- Backend: `pm2 logs campushb-backend`
- Nginx: `/var/log/nginx/error.log`
- MongoDB: `/var/log/mongodb/mongod.log`
