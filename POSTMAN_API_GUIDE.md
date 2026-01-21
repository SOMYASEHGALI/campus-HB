# 📮 CampusHB API Testing Guide - Postman

## Quick Start

### Import Postman Collection
1. Open Postman
2. Click **Import** button
3. Select `CampusHB_Postman_Collection.json`
4. Collection will be imported with all endpoints

### Set Base URL
The collection has a variable `{{base_url}}` which defaults to `http://localhost:5000`

**To change for production:**
1. Click on collection name
2. Go to **Variables** tab
3. Update `base_url` to `http://campushb.hiringbazaar.in`

---

## 🔐 Authentication Endpoints

### 1. Register Student
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "Divyanshu Sharma",
  "email": "divyanshu@jecrc.ac.in",
  "password": "password123",
  "collegeName": "JECRC",
  "role": "student"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65abc123def456...",
    "name": "Divyanshu Sharma",
    "role": "student",
    "collegeName": "JECRC"
  }
}
```

---

### 2. Register Staff/TPO
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "Dr. Rajesh Kumar",
  "email": "tpo@jecrc.ac.in",
  "password": "tpo@123",
  "collegeName": "JECRC",
  "role": "staff"
}
```

**Valid Roles:**
- `student` - For students
- `staff` - For college staff/TPO
- `admin` - For system administrators (usually created via admin-login)

---

### 3. Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "divyanshu@jecrc.ac.in",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65abc123def456...",
    "name": "Divyanshu Sharma",
    "role": "student",
    "collegeName": "JECRC"
  }
}
```

**💡 Tip:** Token is automatically saved to collection variable `{{token}}`

---

### 4. Admin Login
**POST** `/api/auth/admin-login`

**Request Body:**
```json
{
  "adminKey": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65abc123def456...",
    "name": "System Admin",
    "role": "admin",
    "collegeName": "HiringBazar Headquarters"
  }
}
```

**Note:** First time creates admin user with:
- Email: `admin@campushb.com`
- Password: `admin@123`

---

## 💼 Jobs Endpoints

### 1. Get All Jobs
**GET** `/api/jobs`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Response:**
```json
[
  {
    "_id": "65abc123...",
    "title": "Software Engineer",
    "company": "Google India",
    "location": "Bangalore, India",
    "salary": "₹15-20 LPA",
    "experience": "0-2 years",
    "description": "We are looking for talented software engineers...",
    "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
    "allowedColleges": ["JECRC", "IIT Roorkee"],
    "formUrl": "apply/65abc123...",
    "postedBy": "65def456...",
    "createdAt": "2025-12-27T10:00:00.000Z"
  }
]
```

---

### 2. Get Job by ID
**GET** `/api/jobs/:id`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Example:**
```
GET /api/jobs/65abc123def456
```

---

### 3. Create Job (Admin/Staff Only)
**POST** `/api/jobs`

**Headers:**
```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Software Engineer",
  "company": "Google India",
  "location": "Bangalore, India",
  "salary": "₹15-20 LPA",
  "experience": "0-2 years",
  "description": "We are looking for talented software engineers to join our team. You will work on cutting-edge technologies and solve complex problems.",
  "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "allowedColleges": ["JECRC", "IIT Roorkee", "BITS Mesra"]
}
```

**Response:**
```json
{
  "_id": "65abc123...",
  "title": "Software Engineer",
  "company": "Google India",
  "formUrl": "apply/65abc123...",
  "postedBy": "65def456...",
  "createdAt": "2025-12-27T10:00:00.000Z"
}
```

---

### 4. Delete Job (Admin Only)
**DELETE** `/api/jobs/:id`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## 📝 Applications Endpoints

### 1. Submit Application
**POST** `/api/applications/submit`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Body Type:** `form-data`

**Form Data:**
```
jobId: 65abc123def456
studentName: Divyanshu Sharma
email: divyanshu@jecrc.ac.in
phone: 9876543210
rollNumber: 21EJCCS001
resume: [FILE] (PDF/DOC)
```

**Response:**
```json
{
  "message": "Application submitted successfully",
  "application": {
    "_id": "65xyz789...",
    "jobId": "65abc123...",
    "studentId": "65def456...",
    "studentName": "Divyanshu Sharma",
    "email": "divyanshu@jecrc.ac.in",
    "phone": "9876543210",
    "rollNumber": "21EJCCS001",
    "resumeUrl": "/uploads/resume-1234567890.pdf",
    "appliedAt": "2025-12-27T10:00:00.000Z"
  }
}
```

---

### 2. Get Admin Stats
**GET** `/api/applications/admin/stats`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Response:**
```json
{
  "totalApplications": 150,
  "collegeStats": [
    {
      "collegeName": "JECRC",
      "count": 45
    },
    {
      "collegeName": "IIT Roorkee",
      "count": 35
    }
  ],
  "bulkUploads": [
    {
      "uploadedBy": {
        "_id": "65def456...",
        "name": "Dr. Rajesh Kumar",
        "collegeName": "JECRC"
      },
      "applications": [...]
    }
  ]
}
```

---

### 3. Export Applications (CSV)
**GET** `/api/applications/export/:jobId?token={{token}}`

Downloads CSV file with all applications for a specific job.

---

### 4. Export All Applications (CSV)
**GET** `/api/applications/export-all?token={{token}}`

Downloads CSV file with all applications across all jobs.

---

## 👥 Users Endpoints (Admin Only)

### 1. Get All Users
**GET** `/api/users`

**Headers:**
```
Authorization: Bearer {{token}}
```

**Response:**
```json
[
  {
    "_id": "65abc123...",
    "name": "Divyanshu Sharma",
    "email": "divyanshu@jecrc.ac.in",
    "collegeName": "JECRC",
    "role": "student",
    "isActive": true,
    "createdAt": "2025-12-27T10:00:00.000Z"
  }
]
```

---

### 2. Toggle User Status
**PATCH** `/api/users/:userId/toggle-status`

**Headers:**
```
Authorization: Bearer {{token}}
```

Activates/Deactivates a user account.

---

### 3. Delete User
**DELETE** `/api/users/:userId`

**Headers:**
```
Authorization: Bearer {{token}}
```

---

## 🧪 Testing Workflow

### Step 1: Register & Login
1. **Register Student** - Create a student account
2. **Login** - Get authentication token
3. Token is auto-saved to `{{token}}` variable

### Step 2: Create Job (Admin)
1. **Admin Login** - Use admin key
2. **Create Job** - Post a new job
3. Copy the job ID from response

### Step 3: Apply to Job
1. **Login as Student** - Get student token
2. **Submit Application** - Use job ID from Step 2
3. Upload resume file

### Step 4: View Applications (Admin)
1. **Admin Login** - Get admin token
2. **Get Admin Stats** - View all applications
3. **Export Applications** - Download CSV

---

## 📌 Important Notes

### Authorization Header
All protected endpoints require:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

The Postman collection automatically uses `{{token}}` variable.

### File Uploads
For endpoints with file uploads (resume):
- Use **form-data** body type
- Select **File** type for resume field
- Supported formats: PDF, DOC, DOCX

### Error Responses
```json
{
  "message": "Error description here"
}
```

or

```json
{
  "error": "Detailed error message"
}
```

---

## 🔄 Environment Variables

### Local Development
```
base_url: http://localhost:5000
```

### Production
```
base_url: http://campushb.hiringbazaar.in
```

### Change Environment
1. Click collection name
2. Variables tab
3. Update `base_url` value
4. Save

---

## 📝 Sample Test Data

### Colleges List
- IIT Roorkee
- JECRC
- Manipal Institute of Technology
- Global Institute of Technology
- BITS Mesra
- Poornima
- Gyan Vihar
- Jaipur National University

### Sample Users
```json
// Student
{
  "name": "Rahul Verma",
  "email": "rahul@jecrc.ac.in",
  "password": "student123",
  "collegeName": "JECRC",
  "role": "student"
}

// Staff
{
  "name": "Prof. Sharma",
  "email": "tpo@iitroorkee.ac.in",
  "password": "staff123",
  "collegeName": "IIT Roorkee",
  "role": "staff"
}
```

---

## ✅ Quick Test Checklist

- [ ] Import Postman collection
- [ ] Set base_url variable
- [ ] Register a student
- [ ] Login and verify token
- [ ] Admin login
- [ ] Create a job
- [ ] Apply to job (with resume)
- [ ] View admin stats
- [ ] Export applications
- [ ] Test user management

---

**Happy Testing!** 🚀
