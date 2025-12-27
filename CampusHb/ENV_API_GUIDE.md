# 🚀 Environment-Based API Configuration - Quick Guide

## ✅ Files Created:

1. **`.env.production`** - Production environment (empty API_URL = relative URLs)
2. **`.env.development`** - Development environment (localhost:5000)
3. **`src/config/api.js`** - API helper functions

---

## 📝 How to Use in Components:

### Import the helper:
```javascript
import { getApiUrl } from '../config/api';
```

### Use in axios calls:
```javascript
// OLD (hardcoded):
axios.post('http://localhost:5000/api/auth/register', data)

// NEW (environment-based):
axios.post(getApiUrl('auth/register'), data)
```

---

## 🔄 Update All Components:

Run this in VS Code:

**Find & Replace (Ctrl + Shift + H):**

### Replace 1:
- **Find:** `axios.post('http://localhost:5000/api/`
- **Replace:** `axios.post(getApiUrl('`

### Replace 2:
- **Find:** `axios.get('http://localhost:5000/api/`
- **Replace:** `axios.get(getApiUrl('`

### Replace 3:
- **Find:** `axios.get(\`http://localhost:5000/api/`
- **Replace:** `axios.get(\`${getApiUrl('`

### Replace 4:
- **Find:** `axios.patch(\`http://localhost:5000/api/`
- **Replace:** `axios.patch(\`${getApiUrl('`

### Replace 5:
- **Find:** `axios.delete(\`http://localhost:5000/api/`
- **Replace:** `axios.delete(\`${getApiUrl('`

---

## 🎯 Then Add Import:

In each file that uses `getApiUrl`, add at top:
```javascript
import { getApiUrl } from '../config/api';
```

---

## 🧪 Testing:

### Development (localhost):
```bash
npm run dev
# Uses .env.development
# API calls go to: http://localhost:5000/api/...
```

### Production (build):
```bash
npm run build
# Uses .env.production
# API calls go to: /api/... (relative, same domain)
```

---

## 📦 Deployment Steps:

```bash
# 1. Commit changes
git add .
git commit -m "Add environment-based API configuration"
git push origin main

# 2. On server
cd /var/www/campus-HB
git pull origin main

# 3. Rebuild frontend
cd CampusHb
npm run build

# 4. Done! ✅
```

---

## ✅ Benefits:

- ✅ No hardcoded URLs
- ✅ Works in dev (localhost) and production (domain)
- ✅ Easy to change API URL (just update .env)
- ✅ No code changes needed for deployment

---

## 📝 Example: Register.jsx (DONE ✅)

Already updated! Check the file to see how it's used.

---

**Next:** Update remaining components using Find & Replace above!
