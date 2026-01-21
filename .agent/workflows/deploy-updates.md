---
description: Deploy updates to KVM server
---

# Deploy Updates to KVM Server

This workflow guides you through deploying updates to your already-deployed CampusHB application on the KVM server.

## Prerequisites
- SSH access to your KVM server
- Git repository is up to date
- Application is already deployed (MongoDB, PM2, Nginx configured)

---

## Step 1: Commit and Push Local Changes

First, ensure all your local changes are committed and pushed to your Git repository:

```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Update: [describe your changes]"

# Push to remote
git push origin main
```

---

## Step 2: SSH into Your KVM Server

```bash
ssh your-username@your-server-ip
```

Replace `your-username` and `your-server-ip` with your actual credentials.

---

## Step 3: Update Backend Code

```bash
# Navigate to backend directory
cd /var/www/campushb/backend

# Pull latest changes from Git
git pull origin main

# Install any new dependencies
npm install --production

# Restart the backend service
pm2 restart campushb-backend

# Check status
pm2 status
pm2 logs campushb-backend --lines 50
```

**Note:** If you see any errors in the logs, check:
- MongoDB connection
- Environment variables in `.env`
- Port conflicts

---

## Step 4: Update Frontend Code

```bash
# Navigate to frontend directory
cd /var/www/campushb/frontend

# Pull latest changes from Git
git pull origin main

# Install any new dependencies
npm install

# Build the production bundle
npm run build

# The dist folder is now updated with latest changes
```

**Alternative:** If you prefer to build locally and upload:

```bash
# On your local machine (Windows)
cd c:\Divyanshu\Divyanshu\Project\HiringBazar\NewCHB\campus-HB\CampusHb
npm run build

# Upload to server using SCP
scp -r dist/* your-username@your-server-ip:/var/www/campushb/frontend/dist/
```

---

## Step 5: Reload Nginx (if needed)

If you made any changes to Nginx configuration:

```bash
# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Step 6: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check backend logs
pm2 logs campushb-backend --lines 30

# Check Nginx status
sudo systemctl status nginx

# Check Nginx error logs (if any issues)
sudo tail -f /var/log/nginx/error.log
```

**Test in browser:**
1. Visit your domain: `https://your-domain.com`
2. Test API endpoints: `https://your-domain.com/api/jobs`
3. Check browser console for any errors
4. Test key functionality (login, job posting, etc.)

---

## Step 7: Monitor for Issues

After deployment, monitor the application for a few minutes:

```bash
# Watch PM2 logs in real-time
pm2 logs campushb-backend

# Watch Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Watch Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

### Backend Issues

**If backend won't start:**
```bash
# Check detailed logs
pm2 logs campushb-backend --lines 100

# Check if port is in use
sudo lsof -i :5000

# Restart PM2
pm2 restart campushb-backend
```

**If MongoDB connection fails:**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB if needed
sudo systemctl restart mongod

# Test MongoDB connection
mongosh -u campushb_user -p --authenticationDatabase campushb campushb
```

### Frontend Issues

**If changes don't appear:**
```bash
# Clear browser cache (Ctrl + Shift + R)
# Or rebuild and redeploy
cd /var/www/campushb/frontend
npm run build
```

**If you get 404 errors:**
```bash
# Check Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
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

## Quick Update Commands (Cheat Sheet)

**Full deployment update:**
```bash
# Backend
cd /var/www/campushb/backend && git pull && npm install --production && pm2 restart campushb-backend

# Frontend
cd /var/www/campushb/frontend && git pull && npm install && npm run build

# Check status
pm2 status && pm2 logs campushb-backend --lines 20
```

**Backend only:**
```bash
cd /var/www/campushb/backend && git pull && npm install --production && pm2 restart campushb-backend && pm2 logs campushb-backend --lines 20
```

**Frontend only:**
```bash
cd /var/www/campushb/frontend && git pull && npm install && npm run build
```

---

## Rollback (If Something Goes Wrong)

If the update causes issues, you can rollback:

```bash
# Backend rollback
cd /var/www/campushb/backend
git log --oneline -10  # Find the commit hash to rollback to
git reset --hard <commit-hash>
npm install --production
pm2 restart campushb-backend

# Frontend rollback
cd /var/www/campushb/frontend
git reset --hard <commit-hash>
npm install
npm run build
```

---

## Notes

1. **Always test locally** before deploying to production
2. **Backup your database** before major updates: `mongodump --db campushb --out /backup/$(date +%Y%m%d)`
3. **Monitor logs** for at least 5-10 minutes after deployment
4. **Keep .env file secure** - never commit it to Git
5. **Update during low-traffic hours** if possible

---

## Checklist

- [ ] Local changes committed and pushed to Git
- [ ] SSH into KVM server
- [ ] Backend code updated and restarted
- [ ] Frontend code updated and built
- [ ] Nginx reloaded (if needed)
- [ ] Deployment verified in browser
- [ ] Logs monitored for errors
- [ ] Key functionality tested
- [ ] No errors in console or logs

---

**Deployment Complete!** 🎉

Your updates are now live on the KVM server.
