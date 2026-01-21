# 🚀 CampusHB - Quick Setup Guide (Code Already Cloned)

## ✅ Prerequisites Check
- [x] Code cloned on server
- [x] MongoDB installed and running
- [ ] Node.js installed
- [ ] Nginx installed (script will install if needed)

---

## 🎯 One-Command Setup

### Step 1: Upload Setup Script to Server

**From Windows (PowerShell):**
```powershell
# Navigate to your project
cd c:\Divyanshu\Divyanshu\Project\HiringBazar\CampusHB\Application

# Upload script to server
scp quick-setup.sh username@server-ip:/path/to/your/cloned/repo/

# Example:
# scp quick-setup.sh root@192.168.1.100:/root/CampusHB/
```

**Or use WinSCP:**
1. Connect to server
2. Navigate to your cloned repository folder
3. Upload `quick-setup.sh`

---

### Step 2: Run Setup Script on Server

SSH into your server:
```bash
ssh username@server-ip
```

Navigate to your cloned repository:
```bash
# Example paths (adjust to your actual path):
cd /root/CampusHB
# or
cd /home/username/CampusHB
# or wherever you cloned it
```

Make script executable and run:
```bash
chmod +x quick-setup.sh
./quick-setup.sh
```

**That's it!** 🎉 Script will automatically:
- ✅ Install backend dependencies
- ✅ Create .env file
- ✅ Setup PM2
- ✅ Build frontend
- ✅ Configure Nginx
- ✅ Start everything

---

## 📋 Manual Setup (If You Prefer Step-by-Step)

### Part 1: Backend Setup

```bash
# Navigate to backend directory
cd /path/to/your/repo/Application/server
# or wherever your server folder is

# Install dependencies
npm install --production

# Create directories
mkdir -p uploads logs

# Create .env file
nano .env
```

Paste this in `.env`:
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb://localhost:27017/campushb
JWT_SECRET=your-secret-key-change-this
ADMIN_KEY=admin123
FRONTEND_URL=http://your-domain.com
```

Save (Ctrl+X, Y, Enter)

```bash
# Install PM2
sudo npm install -g pm2

# Start backend
pm2 start server.js --name campushb-backend

# Save PM2 config
pm2 save

# Setup PM2 startup
pm2 startup
# Run the command it gives you
```

---

### Part 2: Frontend Setup

```bash
# Navigate to frontend directory
cd /path/to/your/repo/Application/CampusHb

# Install dependencies
npm install

# Build
npm run build

# Copy to web directory
sudo mkdir -p /var/www/campushb/frontend
sudo cp -r dist/* /var/www/campushb/frontend/
```

---

### Part 3: Nginx Setup

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/campushb.conf
```

Paste this (update paths and domain):
```nginx
upstream backend_api {
    server 127.0.0.1:5000;
    keepalive 64;
}

server {
    listen 80;
    server_name your-domain.com;  # Change this
    
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
        alias /path/to/your/repo/Application/server/uploads/;  # Update this path
        expires 30d;
    }

    location ~* \.(js|mjs)$ {
        add_header Content-Type application/javascript;
    }

    location ~* \.css$ {
        add_header Content-Type text/css;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    client_max_body_size 50M;
}
```

Save and enable:
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/campushb.conf /etc/nginx/sites-enabled/

# Remove default
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔍 Verify Everything

```bash
# Check backend
pm2 status
pm2 logs campushb-backend

# Check MongoDB
sudo systemctl status mongod

# Check Nginx
sudo systemctl status nginx

# Test backend
curl http://localhost:5000

# Test frontend
curl http://localhost
```

---

## 🆘 Troubleshooting

### Backend won't start
```bash
pm2 logs campushb-backend --lines 50
cd /path/to/server
cat .env  # Check configuration
```

### Frontend shows blank page
```bash
# Check if dist folder exists
ls -la /var/www/campushb/frontend/

# Rebuild if needed
cd /path/to/CampusHb
npm run build
sudo cp -r dist/* /var/www/campushb/frontend/
```

### 502 Bad Gateway
```bash
# Backend not running
pm2 restart campushb-backend

# Check if port 5000 is listening
sudo lsof -i :5000
```

### MIME type error still showing
```bash
# Check Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Clear browser cache (Ctrl + Shift + Delete)
```

---

## 📝 Quick Commands Reference

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
sudo tail -f /var/log/nginx/error.log  # View errors

# MongoDB
sudo systemctl status mongod    # Check status
sudo systemctl restart mongod   # Restart
```

---

## ✅ Success Checklist

- [ ] Backend running (pm2 status shows "online")
- [ ] MongoDB running (systemctl status mongod)
- [ ] Nginx running (systemctl status nginx)
- [ ] Frontend accessible (http://your-domain.com)
- [ ] API working (http://your-domain.com/api/jobs)
- [ ] No console errors in browser

---

## 🎉 You're Done!

Your application should now be live at: **http://your-domain.com**

**Next steps:**
1. Setup SSL certificate (optional but recommended)
2. Configure MongoDB authentication
3. Setup automated backups

Need help? Check logs first:
- Backend: `pm2 logs campushb-backend`
- Nginx: `sudo tail -f /var/log/nginx/error.log`
- MongoDB: `sudo tail -f /var/log/mongodb/mongod.log`
