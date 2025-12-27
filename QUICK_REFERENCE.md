# 🚀 CampusHB - Quick Reference Card

## 📋 File Checklist
- ✅ `DEPLOYMENT_GUIDE.md` - Complete step-by-step deployment guide
- ✅ `ecosystem.config.js` - PM2 configuration for backend
- ✅ `nginx-full.conf` - Complete Nginx configuration
- ✅ `.env.example` - Environment variables template
- ✅ `deploy.sh` - Automated deployment script
- ✅ `backup-mongodb.sh` - MongoDB backup script

---

## 🎯 Quick Start (3 Main Steps)

### 1️⃣ Install MongoDB
```bash
# Follow Part 1 of DEPLOYMENT_GUIDE.md
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
# ... (see full guide)
```

### 2️⃣ Deploy Backend
```bash
# Upload backend
scp backend.tar.gz user@server:/home/user/

# Run deployment script
bash deploy.sh
```

### 3️⃣ Update Nginx
```bash
# Copy nginx-full.conf to server
sudo cp nginx-full.conf /etc/nginx/sites-available/campushb.conf
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔑 Important Paths

| Component | Path |
|-----------|------|
| Frontend | `/var/www/campushb/frontend/dist` |
| Backend | `/var/www/campushb/backend` |
| Nginx Config | `/etc/nginx/sites-available/campushb.conf` |
| MongoDB Data | `/var/lib/mongodb` |
| Backups | `/var/backups/mongodb` |

---

## 🛠️ Essential Commands

### PM2 (Backend)
```bash
pm2 status                    # Check status
pm2 logs campushb-backend     # View logs
pm2 restart campushb-backend  # Restart
pm2 monit                     # Monitor resources
```

### MongoDB
```bash
sudo systemctl status mongod  # Check status
mongosh -u campushb_user -p   # Connect to DB
sudo systemctl restart mongod # Restart
```

### Nginx
```bash
sudo nginx -t                 # Test config
sudo systemctl reload nginx   # Reload
sudo tail -f /var/log/nginx/error.log  # View errors
```

---

## 🔍 Troubleshooting Quick Fixes

### Backend won't start
```bash
pm2 logs campushb-backend --lines 50
cd /var/www/campushb/backend
cat .env  # Check configuration
```

### 502 Bad Gateway
```bash
pm2 restart campushb-backend
sudo systemctl reload nginx
```

### MongoDB connection error
```bash
sudo systemctl status mongod
mongosh  # Test connection
```

---

## 📦 Update Workflow

### Update Backend
```bash
# Local
tar -czf backend.tar.gz --exclude=node_modules .
scp backend.tar.gz user@server:/home/user/

# Server
cd /var/www/campushb/backend
tar -xzf ~/backend.tar.gz
npm install --production
pm2 restart campushb-backend
```

### Update Frontend
```bash
# Local
npm run build
scp -r dist/* user@server:/var/www/campushb/frontend/dist/
```

---

## 🔐 Security Checklist
- [ ] Changed all default passwords
- [ ] MongoDB authentication enabled
- [ ] Strong JWT_SECRET generated
- [ ] SSL certificate installed
- [ ] Firewall configured (80, 443 open; 5000, 27017 closed)
- [ ] Regular backups scheduled

---

## 📊 Monitoring

### Check Application Health
```bash
# Backend
curl '/api/health

# Frontend
curl http://localhost

# Full stack
curl https://your-domain.com/api/jobs
```

### View Logs
```bash
# Backend
pm2 logs campushb-backend

# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# MongoDB
sudo tail -f /var/log/mongodb/mongod.log
```

---

## 🔄 Backup & Restore

### Create Backup
```bash
bash backup-mongodb.sh
```

### Restore Backup
```bash
mongorestore --db=campushb --username=campushb_user \
  --password=YourPassword --authenticationDatabase=campushb \
  /path/to/backup/campushb
```

---

## 📞 Support

For detailed instructions, see: **DEPLOYMENT_GUIDE.md**

**Common Issues:**
1. MIME type error → Check nginx-full.conf
2. 502 Gateway → Check PM2 status
3. DB connection → Check MongoDB status & credentials
4. CORS error → Check FRONTEND_URL in .env

---

**Last Updated:** 2025-12-27
