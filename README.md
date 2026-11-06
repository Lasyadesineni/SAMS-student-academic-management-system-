# SAMS – Student Academic Management System

A modern, production-grade, full-stack educational management platform built with **React (Vite)**, **Tailwind CSS**, **Node.js**, **Express**, and **MongoDB (Mongoose)**.

SAMS is designed for higher-education colleges and universities to manage institutional records, academic curriculums, daily lecture attendance, examination mark ledgers, and student performance analytics with real-time MongoDB aggregation pipelines.

---

## 📸 Key Highlights & Demonstration Credentials

Both roles are pre-seeded in the database with realistic sample datasets:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@sams.edu` | `Admin@123` | Full institution-wide CRUD, analytics, attendance & marks recording |
| **Sample Student 1** | `student1@sams.edu` | `Student@123` | Isolated academic portal: own courses, marks, attendance & transcript |
| **Sample Student 2..15** | `student2@sams.edu` ... `student15@sams.edu` | `Student@123` | Individual student accounts with isolated records |

> **Quick Demo**: The login page features **"Admin Demo"** and **"Student Demo"** one-click autofill buttons for immediate presentation.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js 18 with Vite
- **Styling**: Tailwind CSS with custom academic palette
- **Icons**: Lucide React
- **Data Visualizations**: Recharts (Line, Bar, Donut charts)
- **HTTP Client**: Axios with JWT request/response interceptors

### Backend & Database
- **Runtime**: Node.js (v20+)
- **Framework**: Express.js REST API
- **Database**: MongoDB (Atlas or Local MongoDB `127.0.0.1:27017`)
- **Object Modeling (ODM)**: Mongoose 8 with schema validation and compound unique indexes
- **Authentication**: JWT (JSON Web Tokens) with 30-day expiry
- **Password Security**: bcryptjs 10-round salted hashing
- **Audit Logging**: Morgan logger & administrative activity logs

---

## 🎨 Design System & Theme

Designed according to premium SaaS university portals:
- **Primary**: Navy Blue (`#1E3A8A`)
- **Secondary**: Royal Blue (`#3B82F6`)
- **Surface & Cards**: Pure White (`#FFFFFF`) with soft drop shadows (`shadow-card`)
- **Background**: Light Grey (`#F8FAFC`)
- **Dark Typography**: Slate Navy (`#0F172A`)
- **Status Accents**: Emerald Green (Present / Grade A), Amber (Leave / Warning), Rose Red (Absent / Fail)

---

## 🚀 Application Modules

### 1. Executive Admin Dashboard
- **Welcome Section**: Dynamic daily greeting and localized date.
- **6 Real-time KPI Cards**:
  1. *Total Students*: Count of registered students with cohort trend.
  2. *Total Courses*: Active degree programs.
  3. *Total Subjects*: Curriculum modules.
  4. *Average Attendance*: Institutional attendance % calculated across all sessions.
  5. *Average Academic Score*: Institution-wide examination mark percentage.
  6. *Total Enrollments*: Active student-to-course links.
- **4 Interactive Recharts**:
  - *Student Enrollment Overview*: Monthly registration line graph.
  - *Attendance Overview*: Daily stacked bar chart comparing Present, Absent, and Leave.
  - *Academic Performance*: Average mark percentage across individual subjects.
  - *Course Distribution*: Donut chart illustrating student enrollment density per course.
- **Recently Registered Students Table**: Displays the 5 latest students with quick profile modal.
- **Recent Activities Feed**: Real audit trail from the MongoDB `activities` collection.

### 2. Student Management Directory
- Add new students with comprehensive validation (Registration No, Name, Email, Phone, Gender, DOB, Department, Course, Semester, Address).
- Automatically provisions a linked student login portal user account.
- Search by student name, registration number, or email.
- Filter by Course and Semester with server-side pagination.
- Full CRUD: View student academic dossier, Edit details, and Safe Delete with confirmation.

### 3. Degree Course Management
- Configure degree curriculums (e.g. B.Tech Computer Science, B.Tech IT, B.Tech ECE).
- Track course duration, total semesters, and dynamic active enrolled student counts.
- Add, Edit, and Delete courses with safety checks preventing accidental deletion of courses with enrolled students.

### 4. Curriculum Subject Management
- Create subjects linked to specific courses, semesters, and credit weights (1 to 10 credits).
- Assign faculty instructors (e.g., Prof. Alan Turing, Dr. Edgar Codd).
- Filter subjects by course and semester.

### 5. Student Enrollment Management
- Enroll students into degree courses and select specific curriculum subjects.
- **Duplicate Prevention**: Compound unique MongoDB index `{ student: 1, course: 1 }` prevents double enrollments.
- Track enrollment lifecycle status: `Active`, `Completed`, `Dropped`, `Suspended`.

### 6. Daily Attendance Ledger
- Select Course, Semester, Subject, and Date.
- Displays enrolled class roster with instant one-click toggle buttons: **Present**, **Absent**, or **Leave**.
- "Quick Mark All Present" and "Quick Mark All Absent" productivity shortcuts.
- **Duplicate Protection**: Compound index `{ student: 1, subject: 1, date: 1 }` guarantees no duplicate records for the same day.
- Real-time statistics summary:
  $$\text{Attendance Percentage} = \left(\frac{\text{Classes Present}}{\text{Total Classes}}\right) \times 100$$

### 7. Examination & Marks Ledger
- Record scores for:
  - Internal Assessment
  - Assignment
  - Mid-Semester Examination
  - End-Semester Final Examination
- Dynamic maximum marks scaling (e.g., 25, 50, 100).
- **Automated Grading Matrix**: Computes percentage and letter grades ($A+$, $A$, $B$, $C$, $D$, $F$) automatically.

### 8. Academic Reports & Analytics
- **Performance Dossier**: Student-wise and subject-wise examination scores and grade distributions.
- **Attendance Audit**: Institutional eligibility check verifying students who satisfy the $\ge 75\%$ attendance mandate.
- **CSV Data Export**: One-click export downloading actual MongoDB records into `.csv` files.
- **Print / PDF Ready**: Clean print stylesheet for generating physical or digital grade sheets.

### 9. Institutional & System Settings
- Configure University Name, Institutional Code, Contact Email, and Phone.
- Adjust Academic Calendar Year and current Term.
- Preview and modify institutional minimum attendance thresholds and grading scale.

### 10. Student Academic Portal
- **Strict Role Isolation**: Students are strictly authenticated via JWT and can only view their own records.
- **Personal Metrics**: Enrolled courses count, individual attendance %, overall percentage, and current semester.
- **My Curriculum Subjects**: List of assigned subjects and credits.
- **Subject-wise Performance Chart**: Personal bar chart of scores across examinations.
- **Attendance Breakdown**: Pie chart displaying personal Present, Absent, and Leave distribution.
- **Official Transcript View**: Complete score sheet with grades and faculty remarks.
- **Student Profile Dossier**: Contact info, registered address, department, and DOB.

---

## 📁 Project Directory Structure

```
student-management/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & reconnection handler
│   ├── controllers/
│   │   ├── authController.js     # JWT Login, registration, profile
│   │   ├── studentController.js  # Student CRUD & statistics
│   │   ├── courseController.js   # Courses & enrolled student aggregates
│   │   ├── subjectController.js  # Subjects & faculty linkages
│   │   ├── enrollmentController.js # Course enrollments & duplicate guard
│   │   ├── attendanceController.js # Daily bulk marking & percentage metrics
│   │   ├── markController.js     # Exam marks entry & auto-grading
│   │   ├── dashboardController.js# Aggregated analytics for Admin & Student
│   │   ├── reportController.js   # Dossier exports & summary metrics
│   │   └── settingController.js  # System & grading configuration
│   ├── middleware/
│   │   └── auth.js               # JWT verification & role authorization (RBAC)
│   ├── models/
│   │   ├── User.js               # Auth credentials & role (Admin/Student)
│   │   ├── Student.js            # Student profile with unique reg number
│   │   ├── Course.js             # Degree programs & duration
│   │   ├── Subject.js            # Subjects, credits & faculty
│   │   ├── Enrollment.js         # Student course enrollments (compound index)
│   │   ├── Attendance.js         # Daily attendance logs (compound index)
│   │   ├── Mark.js               # Exam scores & calculated grades
│   │   ├── Activity.js           # Administrative audit trails
│   │   └── Setting.js            # Institutional identity & grading matrix
│   ├── routes/                   # RESTful Express route definitions
│   ├── .env                      # Environment variables
│   ├── package.json
│   ├── seed.js                   # Comprehensive database seeder
│   └── server.js                 # Express server bootstrap
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axiosClient.js    # Axios client with JWT interceptor
    │   ├── components/
    │   │   ├── charts/
    │   │   │   └── DashboardCharts.jsx # Recharts line, bar, and donut charts
    │   │   ├── layout/
    │   │   │   ├── Layout.jsx
    │   │   │   ├── Sidebar.jsx   # Role-adaptive sidebar navigation
    │   │   │   └── TopNavbar.jsx # Breadcrumbs, notifications & profile
    │   │   └── ui/
    │   │       ├── Badge.jsx     # Semantic status badges
    │   │       ├── Feedback.jsx  # Spinners and empty states
    │   │       ├── Modal.jsx     # Accessible dialogs
    │   │       └── StatCard.jsx  # Trend-supported metric cards
    │   ├── context/
    │   │   └── AuthContext.jsx   # Persistent auth state & user sessions
    │   ├── pages/
    │   │   ├── admin/            # 9 Admin management and reporting modules
    │   │   ├── student/          # 4 Student personal academic views
    │   │   └── Login.jsx         # Auth portal with demo buttons
    │   ├── App.jsx               # App routing and view switcher
    │   ├── index.css             # Tailwind base & custom scrollbars
    │   └── main.jsx
    ├── index.html
    ├── tailwind.config.js
    ├── vite.config.js            # Vite setup with /api proxy to backend
    └── package.json
```

---

## 💻 Installation & Setup Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (Local MongoDB Server running on port `27017` or a MongoDB Atlas URI)

---

### Step 1: Backend Setup & Environment Variables

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Verify or edit `backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/sams_db
   JWT_SECRET=sams_super_secure_academic_management_jwt_secret_key_2025
   NODE_ENV=development
   ```
   *(For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string `mongodb+srv://<username>:<password>@cluster0.mongodb.net/sams_db`)*.

4. Seed the database with realistic sample records:
   ```bash
   node seed.js
   ```
   *(This creates 1 Admin, 15 Students with user logins, 3 Courses, 6 Subjects, 150 Attendance logs, 90 Exam marks, and initial settings).*

5. Start the backend API server:
   ```bash
   npm start
   # Server runs on http://localhost:5000
   ```

---

### Step 2: Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   # Frontend runs on http://localhost:3000
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `POST` | `/api/auth/register` | Admin | Register new student or administrator |
| `GET` | `/api/auth/me` | Private | Fetch current user session profile |
| `GET` | `/api/dashboard/admin` | Admin | Aggregated metrics, 4 charts & recent logs |
| `GET` | `/api/dashboard/student` | Student | Scoped personal metrics, courses & results |
| `GET` | `/api/students` | Admin | List students (search, filter, pagination) |
| `POST` | `/api/students` | Admin | Register student & auto-create login user |
| `GET` | `/api/students/:id` | Private | Retrieve single student profile & dossier |
| `PUT` | `/api/students/:id` | Admin | Update student information |
| `DELETE` | `/api/students/:id` | Admin | Delete student and clean up dependencies |
| `GET` | `/api/courses` | Private | List all degree courses with student counts |
| `POST` | `/api/courses` | Admin | Create a new degree course |
| `PUT` | `/api/courses/:id` | Admin | Modify course metadata |
| `DELETE` | `/api/courses/:id` | Admin | Remove course (guarded against active students) |
| `GET` | `/api/subjects` | Private | List subjects with course/semester filter |
| `POST` | `/api/subjects` | Admin | Create new curriculum subject |
| `PUT` | `/api/subjects/:id` | Admin | Update subject credits & assigned faculty |
| `DELETE` | `/api/subjects/:id` | Admin | Remove subject |
| `GET` | `/api/enrollments` | Private | List student course enrollments |
| `POST` | `/api/enrollments` | Admin | Enroll student with duplicate guard |
| `PUT` | `/api/enrollments/:id` | Admin | Update enrollment status or subjects |
| `DELETE` | `/api/enrollments/:id` | Admin | Delete enrollment record |
| `GET` | `/api/attendance` | Private | Get daily attendance logs and stats |
| `POST` | `/api/attendance` | Admin | Bulk record attendance for a class |
| `GET` | `/api/marks` | Private | Query marks by subject, exam type, or student |
| `POST` | `/api/marks` | Admin | Batch save examination marks with auto-grades |
| `GET` | `/api/reports/performance`| Admin | Academic performance dossier |
| `GET` | `/api/reports/attendance` | Admin | Institutional attendance audit & eligibility |
| `GET` | `/api/settings` | Private | View institutional branding & grading rules |
| `PUT` | `/api/settings` | Admin | Update institutional configuration |

---

## 🔒 Security & Data Integrity

1. **Role-Based Access Control (RBAC)**: Distinct permissions for `admin` and `student`. Students cannot query administrator endpoints or modify academic records.
2. **Strict Identity Isolation**: The backend validates student requests using the JWT claims attached to `req.user.student`. Attempting to access another student's record returns `403 Forbidden`.
3. **Compound Unique Indexes**:
   - `Enrollment`: `{ student: 1, course: 1 }` prevents double active registrations.
   - `Attendance`: `{ student: 1, subject: 1, date: 1 }` guarantees idempotent daily entries.
   - `Mark`: `{ student: 1, subject: 1, examType: 1, academicYear: 1 }` prevents duplicate exam entries.
4. **Data Sanitization**: Passwords hashed with bcrypt; stripped from all API outputs.

---

## 🎓 Academic Demonstration Checklist

- [x] MongoDB database properly connected with Mongoose
- [x] Schema models with validation, indexes, and timestamps
- [x] MongoDB aggregation pipelines used for dashboard metrics & charts
- [x] Full CRUD operations on Students, Courses, Subjects, and Enrollments
- [x] Bulk attendance ledger with real-time percentage calculation
- [x] Automated grading matrix ($A+$ to $F$) with configurable thresholds
- [x] Dynamic Recharts data visualizations (Line, Bar, Donut)
- [x] CSV report generation & Print/PDF stylesheet
- [x] Two distinct roles: Administrator & Isolated Student Portal
- [x] Seed script with 1 admin, 15 students, courses, subjects, attendance & marks
- [x] Responsive educational SaaS dashboard UI with Tailwind CSS

---

**Developed for the Student Academic Management System (SAMS) Project Demonstration.**
