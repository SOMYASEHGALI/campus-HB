# CampusHB - MERN Stack Hiring Portal

A premium hiring portal for colleges and admins.

## Features
- **College Auth**: Register/Login for college placement cells.
- **Admin Dashboard**: Post job openings and export student data.
- **Student Data Upload**: Colleges can upload student details for specific jobs.
- **Data Export**: Export student applications to CSV (spreadsheet format).
- **Security**: JWT authentication and role-based access.

## Tech Stack
- **Frontend**: React + Vite + Framer Motion + Lucide React
- **Backend**: Node.js + Express
- **Database**: MongoDB

## How to Run

### 1. Prerequisites
- Node.js installed
- MongoDB installed and running

### 2. Setup Backend
```bash
cd server
npm install
node server.js
```

### 3. Setup Frontend
```bash
cd CampusHb
npm install
npm run dev
```

### 4. Admin Setup
To create an admin account, register on the website and use the secret key: `admin123` (configured in `server/.env`).
