# ✅ All Hardcoded URLs Fixed!

## Files Updated:

1. ✅ **Register.jsx** - Added getApiUrl import, fixed auth/register
2. ✅ **Login.jsx** - Added getApiUrl import, fixed auth/login  
3. ✅ **Home.jsx** - Added getApiUrl import, fixed jobs endpoint
4. ✅ **AdminLogin.jsx** - Added getApiUrl import, fixed auth/admin-login
5. ✅ **ApplyJob.jsx** - Added getApiUrl import, fixed 3 endpoints:
   - jobs/${id}
   - applications/submit
   - applications/upload-single-cv
6. ✅ **AdminDashboard.jsx** - Added getApiUrl & getUploadUrl imports, fixed 11 endpoints:
   - jobs (GET, POST, DELETE)
   - applications/admin/stats
   - users (GET, PATCH, DELETE)
   - applications/export/${jobId}
   - applications/export-all
   - applications/export-by-college
   - Upload URL handling

## Configuration Files:

1. ✅ **src/config/api.js** - API helper functions
2. ✅ **.env** - Main environment file (empty VITE_API_URL for production)
3. ✅ **.env.example** - Example file for reference
4. ✅ **.gitignore** - Updated to ignore .env

---

## Next Steps:

### 1. Test Locally
```bash
npm run dev
# Should work with localhost:5000
```

### 2. Build for Production
```bash
npm run build
# Creates dist folder
```

### 3. Commit & Push
```bash
git add .
git commit -m "Replace all hardcoded URLs with environment-based API config"
git push origin main
```

### 4. Deploy on Server
```bash
# SSH into server
ssh root@your-server

# Pull latest code
cd /var/www/campus-HB
git pull origin main

# Create .env file
cd CampusHb
nano .env
# Add: VITE_API_URL=
# Save (Ctrl+X, Y, Enter)

# Build
npm run build

# Done! ✅
```

---

## How It Works:

### Development (Local):
- `.env` has: `VITE_API_URL=http://localhost:5000`
- API calls go to: `http://localhost:5000/api/...`

### Production (Server):
- `.env` has: `VITE_API_URL=` (empty)
- API calls go to: `/api/...` (relative URLs)
- Nginx proxies `/api` to backend on port 5000

---

## Verification:

**No hardcoded `localhost:5000` found in src folder!** ✅

All API calls now use:
- `getApiUrl('endpoint')` for API calls
- `getUploadUrl(path)` for file URLs

---

**Ready to deploy!** 🚀
