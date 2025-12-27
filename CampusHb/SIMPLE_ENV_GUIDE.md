# 🚀 Simple .env Setup

## ✅ Files:

1. **`.env`** - Actual environment file (NOT in Git)
2. **`.env.example`** - Example file (IN Git)
3. **`src/config/api.js`** - API helper

---

## 📝 Usage:

### Local Development:
```bash
# .env file mein:
VITE_API_URL=http://localhost:5000
```

### Production (Server):
```bash
# .env file mein:
VITE_API_URL=
# (empty = uses relative URLs)
```

---

## 🔄 Deployment:

### Local Machine:
```bash
# 1. Update components (Find & Replace)
# 2. Test
npm run dev

# 3. Build
npm run build

# 4. Commit (.env.example will be committed, not .env)
git add .
git commit -m "Add env-based API config"
git push
```

### Server:
```bash
cd /var/www/campus-HB
git pull

cd CampusHb

# Create .env file
nano .env
# Paste: VITE_API_URL=
# Save

# Build
npm run build
```

---

## ✅ Done!

- ✅ `.env` - Created (empty API URL)
- ✅ `.env.example` - Created (for reference)
- ✅ `.gitignore` - Updated (ignores .env)
- ✅ `src/config/api.js` - Created

**Ab bas components update karo using Find & Replace!**
