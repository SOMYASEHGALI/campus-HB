# 📊 CampusHB - Database Architecture

## Database: campushb

```
campushb (Database)
│
├── users (Collection)
│   ├── _id: ObjectId
│   ├── name: String
│   ├── email: String (unique index)
│   ├── password: String (bcrypt hashed)
│   ├── collegeName: String
│   ├── role: String (student/staff/admin)
│   ├── isActive: Boolean
│   └── createdAt: Date
│
├── jobs (Collection)
│   ├── _id: ObjectId
│   ├── title: String
│   ├── company: String
│   ├── location: String
│   ├── salary: String
│   ├── experience: String
│   ├── description: String
│   ├── skills: Array[String]
│   ├── allowedColleges: Array[String]
│   ├── formUrl: String
│   ├── postedBy: ObjectId → references users._id
│   └── createdAt: Date
│
└── applications (Collection)
    ├── _id: ObjectId
    ├── jobId: ObjectId → references jobs._id
    ├── studentId: ObjectId → references users._id
    ├── studentName: String
    ├── email: String
    ├── phone: String
    ├── rollNumber: String
    ├── resumeUrl: String
    ├── isBulk: Boolean
    ├── uploadedBy: ObjectId → references users._id
    └── appliedAt: Date
```

## Relationships

```
┌─────────────┐
│    users    │
│   (Admin)   │
└──────┬──────┘
       │ postedBy
       │
       ▼
┌─────────────┐
│    jobs     │
└──────┬──────┘
       │ jobId
       │
       ▼
┌─────────────────┐
│  applications   │
└─────────────────┘
       ▲
       │ studentId, uploadedBy
       │
┌──────┴──────┐
│    users    │
│ (Students)  │
└─────────────┘
```

## Indexes (Auto-created by Mongoose)

1. **users**
   - `email` (unique)
   - `_id` (default)

2. **jobs**
   - `_id` (default)
   - `postedBy` (for joins)

3. **applications**
   - `_id` (default)
   - `jobId` (for joins)
   - `studentId` (for joins)

## Sample Data Flow

### 1. User Registration
```javascript
POST /api/auth/register
{
  "name": "Divyanshu",
  "email": "divyanshu@example.com",
  "password": "password123",
  "collegeName": "JECRC"
}
↓
MongoDB creates document in 'users' collection
```

### 2. Job Posting (by Admin/Staff)
```javascript
POST /api/jobs
{
  "title": "Software Engineer",
  "company": "Google",
  "location": "Bangalore",
  "description": "...",
  "allowedColleges": ["JECRC", "IIT ROORKEE"]
}
↓
MongoDB creates document in 'jobs' collection
Links to user via 'postedBy' field
```

### 3. Job Application (by Student)
```javascript
POST /api/applications
{
  "jobId": "job_id_here",
  "studentName": "Divyanshu",
  "email": "divyanshu@example.com",
  "phone": "1234567890",
  "resumeUrl": "/uploads/resume.pdf"
}
↓
MongoDB creates document in 'applications' collection
Links to job via 'jobId' field
Links to user via 'studentId' field
```

## No Manual Setup Required! 🎉

All collections, indexes, and relationships are automatically created by Mongoose when:
- Your backend connects to MongoDB
- First document is inserted into each collection

Just make sure:
1. MongoDB is running
2. Connection string in .env is correct
3. Start your backend with PM2

That's it! 🚀
