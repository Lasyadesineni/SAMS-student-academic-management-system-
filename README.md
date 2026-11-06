# 🎓 Student Academic Management System (SAMS)

A full-stack web application designed to simplify student administration, academic record management, attendance tracking, examination management, and student performance analysis.

SAMS provides separate interfaces for administrators and students, allowing institutions to manage academic information efficiently while giving students access to their personal academic records.

The application is built using **React.js, Vite, Tailwind CSS, Node.js, Express.js, and MongoDB**.

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Application Modules](#-application-modules)
- [MongoDB Concepts Demonstrated](#-mongodb-concepts-demonstrated)
- [Project Structure](#-project-structure)
- [System Requirements](#-system-requirements)
- [Installation and Setup](#-installation-and-setup)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [API Reference](#-api-reference)
- [Security and Data Integrity](#-security-and-data-integrity)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)

---

## 📖 Project Overview

Managing student academic information manually can be time-consuming and difficult, especially when handling large amounts of student records, attendance information, examination results, and course details.

The **Student Academic Management System (SAMS)** addresses these challenges through a centralized web-based platform.

It enables administrators to manage students, courses, subjects, enrollments, attendance, and examination marks. Students can log in to view their individual academic performance, attendance records, and profiles.

The system also uses MongoDB queries and aggregation operations to generate academic statistics and performance reports.

### Project Objectives

- Centralize student and academic information.
- Simplify student, course, and subject management.
- Maintain attendance and examination records.
- Generate academic performance statistics.
- Provide role-based access for administrators and students.
- Demonstrate practical MongoDB database operations and aggregation.

---

## ✨ Key Features

- **Role-Based Login:** Separate administrator and student access.
- **Student Management:** Create, view, update, search, and delete student records.
- **Course Management:** Manage academic courses and their details.
- **Subject Management:** Organize subjects according to courses and semesters.
- **Enrollment Management:** Manage student course enrollments.
- **Attendance Management:** Record and monitor student attendance.
- **Marks Management:** Maintain examination marks and calculate grades.
- **Performance Analytics:** Display academic statistics using interactive charts.
- **Academic Reports:** Generate student performance and attendance reports.
- **Student Portal:** Allow students to view their own academic information.
- **Dashboard:** Display important institutional statistics and recent activities.

---

## 🛠️ Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React.js | Building the user interface |
| Vite | Frontend development and build tool |
| Tailwind CSS | Responsive styling |
| Recharts | Interactive data visualization |
| Lucide React | Icons |
| Axios | API communication |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API development |
| Mongoose | MongoDB object modeling |
| JWT | User authentication |
| bcryptjs | Password hashing |
| Morgan | HTTP request logging |

### Database and Development Tools

| Tool | Purpose |
|---|---|
| MongoDB | Database management |
| MongoDB Compass | Visual database inspection |
| mongosh | MongoDB shell operations |
| Postman | API testing |
| Git and GitHub | Version control and project hosting |
| Visual Studio Code | Code editing |

---

## 📊 Application Modules

### 1. Administrator Dashboard

The administrator dashboard provides an overview of institutional academic information.

Features include:

- Total registered students.
- Total courses and subjects.
- Average attendance percentage.
- Average academic performance.
- Total student enrollments.
- Student enrollment charts.
- Attendance statistics.
- Subject-wise academic performance.
- Course distribution.
- Recently registered students.
- Recent administrative activities.

### 2. Student Management

Administrators can manage student information through a centralized directory.

Features include:

- Add new student records.
- View individual student profiles.
- Update student information.
- Delete student records.
- Search by name, registration number, or email.
- Filter students by course and semester.
- Manage student login accounts.

### 3. Course Management

This module manages the academic courses offered by the institution.

Features include:

- Add new courses.
- View available courses.
- Edit course information.
- Delete courses.
- Manage course duration and semester details.
- View enrolled student counts.

### 4. Subject Management

This module organizes subjects according to academic courses.

Features include:

- Create and manage subjects.
- Associate subjects with courses.
- Assign semester information.
- Manage subject credits.
- Maintain faculty information.
- Filter subjects by course and semester.

### 5. Student Enrollment Management

This module handles student enrollment into academic courses.

Features include:

- Enroll students into courses.
- Select curriculum subjects.
- View enrollment records.
- Update enrollment status.
- Prevent duplicate enrollments through database constraints.

### 6. Attendance Management

The attendance module allows administrators to maintain daily attendance records.

Features include:

- Select course, semester, subject, and date.
- Record student attendance.
- Mark students as Present, Absent, or Leave.
- View attendance summaries.
- Calculate individual attendance percentages.
- Identify students with attendance below the required threshold.

Attendance percentage:

\[
\text{Attendance Percentage} =
\frac{\text{Classes Present}}{\text{Total Classes}} \times 100
\]

### 7. Examination and Marks Management

This module maintains student examination records.

Features include:

- Record internal assessment marks.
- Record assignment marks.
- Maintain mid-semester examination results.
- Maintain end-semester examination results.
- Configure maximum marks.
- Calculate percentages.
- Assign grades based on grading rules.

### 8. Academic Reports and Analytics

The reporting module provides insights into student academic performance.

Features include:

- Student-wise performance reports.
- Subject-wise marks analysis.
- Grade distribution.
- Attendance eligibility reports.
- Academic performance summaries.
- CSV export.
- Print-friendly reports.

### 9. Institutional Settings

Administrators can manage institutional configuration details.

Features include:

- University name.
- Institutional code.
- Contact information.
- Academic year.
- Current academic term.
- Attendance threshold.
- Grading configuration.

### 10. Student Academic Portal

Students have access to their own academic information.

Features include:

- Personal dashboard.
- Enrolled course information.
- Subject details.
- Examination marks.
- Academic performance charts.
- Attendance summaries.
- Student profile.
- Academic transcript.

Students can only access records associated with their authenticated accounts.

---

## 🍃 MongoDB Concepts Demonstrated

This project demonstrates practical MongoDB operations through academic record management.

### 1. Database and Collections

The application uses MongoDB to store institutional and academic information in collections such as:

- `users`
- `students`
- `courses`
- `subjects`
- `enrollments`
- `attendance`
- `marks`
- `activities`
- `settings`

### 2. CRUD Operations

The system uses the following operations:

| Operation | MongoDB/Mongoose Usage |
|---|---|
| Create | Insert student, course, and marks records |
| Read | Retrieve student and academic information |
| Update | Modify student, attendance, and course records |
| Delete | Remove records when permitted |

### 3. Query Operators

MongoDB query operators can be used to filter and retrieve academic records.

Examples:

- `$eq` – Equality comparison.
- `$gt` – Greater than.
- `$gte` – Greater than or equal to.
- `$lt` – Less than.
- `$lte` – Less than or equal to.
- `$in` – Match values in an array.
- `$and` – Combine conditions.
- `$or` – Match alternative conditions.

### 4. Aggregation Framework

Aggregation pipelines help calculate academic statistics.

Important aggregation stages include:

| Operator | Purpose |
|---|---|
| `$match` | Filter records |
| `$group` | Group records and calculate statistics |
| `$avg` | Calculate average marks |
| `$sum` | Calculate totals |
| `$max` | Find maximum values |
| `$min` | Find minimum values |
| `$sort` | Sort records |
| `$project` | Select or transform fields |
| `$lookup` | Combine related collections |
| `$cond` | Apply conditional logic |

### 5. Indexing and Validation

The application uses Mongoose schemas and database indexes to support data consistency and efficient queries.

Examples include:

- Unique student registration numbers.
- Unique email addresses where configured.
- Compound indexes to prevent duplicate academic records.
- Schema validation for required fields and data types.

---

## 📁 Project Structure

```text
student-management/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── announcementController.js
│   │   ├── attendanceController.js
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── dashboardController.js
│   │   ├── enrollmentController.js
│   │   ├── markController.js
│   │   ├── reportController.js
│   │   ├── settingController.js
│   │   ├── studentController.js
│   │   └── subjectController.js
│   │
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── models/
│   │   ├── Activity.js
│   │   ├── Announcement.js
│   │   ├── Attendance.js
│   │   ├── Course.js
│   │   ├── Enrollment.js
│   │   ├── Mark.js
│   │   ├── Setting.js
│   │   ├── Student.js
│   │   ├── Subject.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── announcementRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── enrollmentRoutes.js
│   │   ├── markRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── settingRoutes.js
│   │   ├── studentRoutes.js
│   │   └── subjectRoutes.js
│   │
│   ├── .env.example
│   ├── package.json
│   ├── seed.js
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosClient.js
│   │   │
│   │   ├── components/
│   │   │   ├── charts/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── student/
│   │   │   └── Login.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .gitignore
├── README.md
└── render.yaml
```

---

## 💻 System Requirements

Before running the application, install:

- Node.js (18 or later recommended).
- npm.
- MongoDB local server or MongoDB Atlas account.
- MongoDB Compass (optional).
- Git.
- Postman (optional, for API testing).

---

## 🚀 Installation and Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/Lasyadesineni/SAMS-student-academic-management-system-.git
```

Navigate into the project:

```bash
cd SAMS-student-academic-management-system-
```

### Step 2: Backend Setup

Open a terminal and navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file using the provided `.env.example` as a reference.

Configure the environment variables according to the backend configuration.

### Step 3: Database Configuration

Make sure MongoDB is running locally or configure a MongoDB Atlas connection string.

Example local connection:

```env
MONGO_URI=mongodb://127.0.0.1:27017/sams_db
```

### Step 4: Seed Sample Data

From the backend directory, run:

```bash
node seed.js
```

Run this only when you intend to initialize or reset the sample database. Check the seed script before running it against an existing database, as it may modify existing records.

### Step 5: Start the Backend Server

```bash
npm start
```

The backend is expected to run on:

```text
http://localhost:5000
```

Use the actual port configured in your backend environment if it differs.

### Step 6: Frontend Setup

Open a **second terminal** and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the frontend in your browser:

```text
http://localhost:3000
```

The frontend and backend must both be running for API-dependent features to work.

---

## 🔐 Environment Variables

Do not commit actual `.env` files, passwords, database credentials, or JWT secrets to GitHub.

Example backend environment configuration:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
NODE_ENV=development
```

Use the exact variable names required by your backend code. Keep real credentials in your local `.env` file or deployment provider's environment settings.

---

## 🌱 Database Setup

The project uses MongoDB as its primary database.

Example database:

```text
sams_db
```

The database contains collections for:

- Users
- Students
- Courses
- Subjects
- Enrollments
- Attendance
- Marks
- Activities
- Settings

MongoDB Compass or mongosh can be used to inspect collections and verify database records.

---

## 📡 REST API Reference

The application exposes REST API endpoints through the Express backend.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | Register a user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/dashboard/admin` | Administrator dashboard |
| GET | `/api/dashboard/student` | Student dashboard |
| GET | `/api/students` | Retrieve students |
| POST | `/api/students` | Add a student |
| GET | `/api/students/:id` | Get student details |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |
| GET | `/api/courses` | Retrieve courses |
| POST | `/api/courses` | Add a course |
| PUT | `/api/courses/:id` | Update a course |
| DELETE | `/api/courses/:id` | Delete a course |
| GET | `/api/subjects` | Retrieve subjects |
| POST | `/api/subjects` | Add a subject |
| PUT | `/api/subjects/:id` | Update a subject |
| DELETE | `/api/subjects/:id` | Delete a subject |
| GET | `/api/enrollments` | Retrieve enrollments |
| POST | `/api/enrollments` | Create enrollment |
| PUT | `/api/enrollments/:id` | Update enrollment |
| DELETE | `/api/enrollments/:id` | Delete enrollment |
| GET | `/api/attendance` | Retrieve attendance |
| POST | `/api/attendance` | Record attendance |
| GET | `/api/marks` | Retrieve examination marks |
| POST | `/api/marks` | Record marks |
| GET | `/api/reports/performance` | Performance reports |
| GET | `/api/reports/attendance` | Attendance reports |
| GET | `/api/settings` | Retrieve settings |
| PUT | `/api/settings` | Update settings |

*Note: Confirm endpoint availability and access permissions in the backend route files. This table documents the intended API structure.*

---

## 🔒 Security and Data Integrity

The application incorporates security and data integrity mechanisms, including:

- JWT-based authentication.
- Role-based access for administrators and students.
- Password hashing using bcryptjs.
- Protected backend routes.
- Mongoose schema validation.
- Unique and compound database indexes where configured.
- Separation of student-specific academic records.
- Environment variables for sensitive configuration.

---

## 🔮 Future Enhancements

Potential improvements for future versions include:

- Email notifications for attendance shortages.
- Automated examination result notifications.
- Advanced student performance prediction.
- AI-based academic recommendations.
- Parent login portal.
- Downloadable academic report cards.
- Mobile-friendly student application.
- Advanced analytics and visualization.
- Integration with institutional ERP systems.

---

## 🤝 Contributing

Contributions and suggestions are welcome.

To contribute:

1. Fork the repository.
2. Create a new feature branch.
3. Make your changes.
4. Test the application.
5. Submit a pull request.

---

## 👩‍💻 Project Information

**Project Name:** Student Academic Management System (SAMS)  
**Project Type:** Full-Stack Web Application  
**Frontend:** React.js and Vite  
**Backend:** Node.js and Express.js  
**Database:** MongoDB  
**Version Control:** Git and GitHub

---

## 📄 License

This project is intended for academic and educational purposes. A formal open-source license can be added if the project is intended for public reuse.

---

**Student Academic Management System — Simplifying Academic Management Through Technology.**
 
