# 🚀 MongoDB Setup - Simple Guide

## आपके Database Schema (Already in Code!)

आपके application में **3 collections** हैं जो **automatically** बनेंगे:

### 1. **users** Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  collegeName: String,
  role: 'student' | 'staff' | 'admin',
  isActive: Boolean,
  createdAt: Date
}
```

### 2. **jobs** Collection
```javascript
{
  title: String,
  company: String,
  location: String,
  salary: String,
  experience: String,
  description: String,
  skills: [String],
  allowedColleges: [String],
  formUrl: String,
  postedBy: ObjectId (ref: User),
  createdAt: Date
}
```

### 3. **applications** Collection
```javascript
{
  jobId: ObjectId (ref: Job),
  studentId: ObjectId (ref: User),
  studentName: String,
  email: String,
  phone: String,
  rollNumber: String,
  resumeUrl: String,
  isBulk: Boolean,
  uploadedBy: ObjectId (ref: User),
  appliedAt: Date
}
```

---

## 🎯 Setup Steps (Choose One)

### **Option A: Simple Setup (No Authentication - Development Only)**

अगर आप सिर्फ testing कर रहे हैं:

1. **MongoDB already running है** ✅
2. **Backend .env में यह डालें:**
```env
MONGO_URI=mongodb://localhost:27017/campushb
```
3. **Done!** Collections automatically बनेंगे जब app चलेगी

---

### **Option B: Secure Setup (With Authentication - Production)**

Production के लिए (recommended):

#### **Step 1: Upload और Run Setup Script**
```bash
# Upload script to server
scp setup-mongodb.sh user@server:/home/user/

# SSH into server
ssh user@server

# Make executable and run
chmod +x setup-mongodb.sh
./setup-mongodb.sh
```

यह script automatically:
- Admin user बनाएगा
- Application user बनाएगा
- Strong passwords generate करेगा
- Connection string दे देगा

#### **Step 2: Credentials Save करें**
Script run करने के बाद, यह file में credentials save कर देगा:
```bash
cat ~/mongodb-credentials.txt
```

#### **Step 3: Enable Authentication**
```bash
sudo nano /etc/mongod.conf
```

Add these lines:
```yaml
security:
  authorization: enabled
```

Save and restart:
```bash
sudo systemctl restart mongod
```

#### **Step 4: Update Backend .env**
Script से मिला connection string copy करें:
```env
MONGO_URI=mongodb://campushb_user:PASSWORD@localhost:27017/campushb?authSource=campushb
```

---

## ❓ FAQs

### Q: Tables/Collections manually बनाने हैं?
**A:** नहीं! Mongoose automatically बनाएगा जब आप पहली बार data insert करेंगे।

### Q: Schema कहाँ define है?
**A:** `server/models/` folder में:
- `User.js` - Users schema
- `Job.js` - Jobs schema
- `Application.js` - Applications schema

### Q: क्या मुझे SQL queries लिखनी होंगी?
**A:** नहीं! MongoDB NoSQL है। आपका code already Mongoose use कर रहा है:
```javascript
// Example from your code
const user = await User.create({ name, email, password });
const jobs = await Job.find({ allowedColleges: collegeName });
```

### Q: Authentication जरूरी है?
**A:** 
- **Development:** Optional
- **Production:** **MUST HAVE** (security के लिए)

### Q: Collections कब बनेंगे?
**A:** जब आप पहली बार:
- User register करेंगे → `users` collection बनेगा
- Job post करेंगे → `jobs` collection बनेगा
- Application submit करेंगे → `applications` collection बनेगा

---

## 🔍 Verify Setup

### Check if MongoDB is running:
```bash
sudo systemctl status mongod
```

### Connect to MongoDB:
```bash
# Without authentication
mongosh

# With authentication
mongosh -u campushb_user -p --authenticationDatabase campushb campushb
```

### Check collections (after app runs):
```javascript
// In mongosh
use campushb
show collections  // Should show: users, jobs, applications
db.users.countDocuments()  // Count users
```

---

## 🎯 Quick Start Recommendation

**For your first deployment:**

1. **Start Simple** (Option A - No Auth)
   - Get your app working first
   - Test everything

2. **Then Secure** (Option B - With Auth)
   - Once everything works
   - Add authentication
   - Update .env

---

## 📝 Summary

| What | Where | Auto-Created? |
|------|-------|---------------|
| Database `campushb` | MongoDB | ✅ Yes (on first connection) |
| Collection `users` | From User.js model | ✅ Yes (on first insert) |
| Collection `jobs` | From Job.js model | ✅ Yes (on first insert) |
| Collection `applications` | From Application.js model | ✅ Yes (on first insert) |
| Indexes | Defined in models | ✅ Yes (Mongoose creates) |

**You don't need to manually create anything!** 🎉

---

**Next Step:** Deploy your backend and let Mongoose handle the database setup automatically!
