# 🌐 API Configuration Guide for campushb.hiringbazaar.in

## Your Domain URLs

```
Frontend:  http://campushb.hiringbazaar.in
Backend:   http://campushb.hiringbazaar.in/api
Uploads:   http://campushb.hiringbazaar.in/uploads
```

---

## ⚠️ IMPORTANT: Fix Required Before Deployment

Your frontend code has **hardcoded `localhost:5000` URLs** which won't work in production.

### Quick Fix (2 Options)

---

### **Option 1: Use Relative URLs (Recommended)** ⭐

Since Nginx proxies `/api` to your backend, you can use **relative URLs**.

#### Step 1: Create API config file

File already created: `src/config/api.js`

#### Step 2: Update all component files

Replace all instances of:
```javascript
''/api/...'
```

With:
```javascript
'/api/...'
```

**Files to update:**
1. `src/pages/Register.jsx` - Line 42
2. `src/pages/Login.jsx` - Line 17
3. `src/pages/Home.jsx` - Line 24
4. `src/pages/ApplyJob.jsx` - Lines 40, 75, 119
5. `src/pages/AdminLogin.jsx` - Line 17
6. `src/pages/AdminDashboard.jsx` - Lines 34, 48, 61, 75, 99, 115, 142, 157, 162, 171, 177

#### Example Changes:

**Before:**
```javascript
const res = await axios.post(''/api/auth/register', values);
```

**After:**
```javascript
const res = await axios.post('/api/auth/register', values);
```

**For uploads (AdminDashboard.jsx line 177):**

**Before:**
```javascript
return `url}`;
```

**After:**
```javascript
return url; // Just return the path as-is
```

---

### **Option 2: Use Environment Variables**

#### Step 1: Files already created
- `.env.development` - For local development
- `.env.production` - For production

#### Step 2: Import and use in components

```javascript
import { getApiUrl } from '../config/api';

// Instead of:
axios.post(''/api/auth/register', values)

// Use:
axios.post(getApiUrl('auth/register'), values)
```

---

## 🚀 Quick Fix Script

### For Windows (PowerShell):

```powershell
cd c:\Divyanshu\Divyanshu\Project\HiringBazar\CampusHB\Application\CampusHb

# Run the fix script
.\fix-api-urls.ps1
```

### Manual Find & Replace (VS Code):

1. Open VS Code
2. Press `Ctrl + Shift + H` (Find and Replace in Files)
3. Find: `''/api/`
4. Replace: `'/api/`
5. Click "Replace All"

6. Then find: `` `'/api/ ``
7. Replace: `` `/api/ ``
8. Click "Replace All"

9. Finally find: `'`
10. Replace: `'${` (or just `''` depending on context)
11. Review and replace carefully

---

## 📝 Complete List of Changes Needed

### Register.jsx (Line 42)
```javascript
// Before
const res = await axios.post(''/api/auth/register', values);

// After
const res = await axios.post('/api/auth/register', values);
```

### Login.jsx (Line 17)
```javascript
// Before
const res = await axios.post(''/api/auth/login', values);

// After
const res = await axios.post('/api/auth/login', values);
```

### Home.jsx (Line 24)
```javascript
// Before
const res = await axios.get(''/api/jobs', {

// After
const res = await axios.get('/api/jobs', {
```

### ApplyJob.jsx (Line 40)
```javascript
// Before
const res = await axios.get(`'/api/jobs/${id}`, {

// After
const res = await axios.get(`/api/jobs/${id}`, {
```

### ApplyJob.jsx (Line 75)
```javascript
// Before
await axios.post(''/api/applications/submit', formData, {

// After
await axios.post('/api/applications/submit', formData, {
```

### ApplyJob.jsx (Line 119)
```javascript
// Before
await axios.post(''/api/applications/upload-single-cv', formData, {

// After
await axios.post('/api/applications/upload-single-cv', formData, {
```

### AdminLogin.jsx (Line 17)
```javascript
// Before
const res = await axios.post(''/api/auth/admin-login', values);

// After
const res = await axios.post('/api/auth/admin-login', values);
```

### AdminDashboard.jsx (Multiple lines)
```javascript
// Line 34
const res = await axios.get('/api/jobs', {

// Line 48
const res = await axios.get('/api/applications/admin/stats', {

// Line 61
const res = await axios.get('/api/users', {

// Line 75
const response = await axios.patch(`/api/users/${userId}/toggle-status`, {}, {

// Line 99
await axios.delete(`/api/users/${userId}`, {

// Line 115
await axios.post('/api/jobs', {

// Line 142
await axios.delete(`/api/jobs/${jobId}`, {

// Line 157
window.open(`/api/applications/export/${jobId}?token=${token}`, '_blank');

// Line 162
window.open(`/api/applications/export-all?token=${token}`, '_blank');

// Line 171
window.open(`/api/applications/export-by-college/${encodeURIComponent(collegeName)}?token=${token}`, '_blank');

// Line 177
return url; // Just return the path
```

---

## ✅ After Making Changes

### 1. Test Locally
```bash
npm run dev
```
Make sure everything still works with localhost backend.

### 2. Build for Production
```bash
npm run build
```

### 3. Deploy to Server
```bash
# Copy build to server
scp -r dist/* user@server:/var/www/campushb/frontend/

# Or if code is already on server, just rebuild:
cd /path/to/CampusHb
npm run build
sudo cp -r dist/* /var/www/campushb/frontend/
```

---

## 🔧 Server Configuration

### Backend .env
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb://localhost:27017/campushb
JWT_SECRET=your-secret-key
ADMIN_KEY=admin123
FRONTEND_URL=http://campushb.hiringbazaar.in
```

### Nginx Configuration
Already configured in `nginx-full.conf` with domain: `campushb.hiringbazaar.in`

---

## 🧪 Testing After Deployment

### Test Frontend
```
http://campushb.hiringbazaar.in
```

### Test API Endpoints
```bash
# Test jobs endpoint
curl http://campushb.hiringbazaar.in/api/jobs

# Should return JSON response
```

### Test in Browser Console
```javascript
// Open browser console on your site
fetch('/api/jobs')
  .then(r => r.json())
  .then(console.log)
```

---

## 🆘 Troubleshooting

### API calls fail with 404
- Check Nginx configuration
- Verify backend is running: `pm2 status`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

### CORS errors
- Update backend .env: `FRONTEND_URL=http://campushb.hiringbazaar.in`
- Restart backend: `pm2 restart campushb-backend`

### Still seeing localhost URLs
- Clear browser cache (Ctrl + Shift + Delete)
- Hard reload (Ctrl + Shift + R)
- Check if you rebuilt the frontend after changes

---

## 📋 Deployment Checklist

- [ ] Replace all `localhost:5000` URLs with `/api`
- [ ] Test locally after changes
- [ ] Build production bundle (`npm run build`)
- [ ] Update backend `.env` with correct `FRONTEND_URL`
- [ ] Update Nginx config with domain `campushb.hiringbazaar.in`
- [ ] Deploy frontend build to server
- [ ] Restart Nginx
- [ ] Test all API endpoints
- [ ] Test file uploads
- [ ] Clear browser cache and test

---

**Ready to deploy!** 🚀

After fixing the URLs, your app will work perfectly on `campushb.hiringbazaar.in`
