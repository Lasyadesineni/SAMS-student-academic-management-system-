require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Student = require('./models/Student');
const Course = require('./models/Course');
const Subject = require('./models/Subject');
const Enrollment = require('./models/Enrollment');
const Attendance = require('./models/Attendance');
const Mark = require('./models/Mark');
const Activity = require('./models/Activity');
const Setting = require('./models/Setting');

const seedData = async () => {
  try {
    const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sams_db';
    console.log(`Connecting to MongoDB for seeding: ${connUri}...`);
    await mongoose.connect(connUri);
    console.log('Connected to MongoDB successfully.');

    // Clear existing data cleanly
    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Course.deleteMany({}),
      Subject.deleteMany({}),
      Enrollment.deleteMany({}),
      Attendance.deleteMany({}),
      Mark.deleteMany({}),
      Activity.deleteMany({}),
      Setting.deleteMany({}),
    ]);

    // 1. Seed Settings
    console.log('Creating institutional settings...');
    await Setting.create({
      institutionName: 'Apex Institute of Technology & Science',
      institutionCode: 'AITS-UNIV',
      contactEmail: 'administration@aits.edu',
      contactPhone: '+1 (800) 555-0199',
      currentAcademicYear: '2025-2026',
      currentSemester: 'Semester 4',
      minimumAttendancePercentage: 75,
      gradingRules: [
        { grade: 'A+', minPercentage: 90, description: 'Outstanding' },
        { grade: 'A', minPercentage: 80, description: 'Excellent' },
        { grade: 'B', minPercentage: 70, description: 'Very Good' },
        { grade: 'C', minPercentage: 60, description: 'Good' },
        { grade: 'D', minPercentage: 50, description: 'Pass' },
        { grade: 'F', minPercentage: 0, description: 'Fail' },
      ],
    });

    // 2. Seed Admin User
    console.log('Creating Admin Account...');
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const adminUser = await User.create({
      name: 'Dr. Arthur Vance',
      email: 'admin@sams.edu',
      password: 'Admin@123', // Will be hashed by pre-save or pre-hashed
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    });

    // 3. Seed 3 Courses
    console.log('Creating 3 Courses...');
    const courses = await Course.insertMany([
      {
        courseCode: 'CS101',
        courseName: 'B.Tech in Computer Science & Engineering',
        department: 'School of Computing',
        duration: '4 Years',
        totalSemesters: 8,
        description: 'Comprehensive curriculum covering core computer science, software engineering, and AI.',
        status: 'Active',
      },
      {
        courseCode: 'IT201',
        courseName: 'B.Tech in Information Technology',
        department: 'School of Information Sciences',
        duration: '4 Years',
        totalSemesters: 8,
        description: 'Applied computing, distributed cloud infrastructure, cyber security, and enterprise systems.',
        status: 'Active',
      },
      {
        courseCode: 'EC301',
        courseName: 'B.Tech in Electronics & Communication',
        department: 'School of Electrical Sciences',
        duration: '4 Years',
        totalSemesters: 8,
        description: 'Digital electronics, signal processing, embedded systems, and telecommunications.',
        status: 'Active',
      },
    ]);

    // 4. Seed 6 Subjects (2 for each course)
    console.log('Creating 6 Subjects...');
    const subjects = await Subject.insertMany([
      {
        subjectCode: 'CS401',
        subjectName: 'Data Structures and Algorithms',
        course: courses[0]._id,
        semester: 4,
        credits: 4,
        facultyName: 'Prof. Alan Turing',
        status: 'Active',
      },
      {
        subjectCode: 'CS402',
        subjectName: 'Database Management Systems',
        course: courses[0]._id,
        semester: 4,
        credits: 4,
        facultyName: 'Dr. Edgar Codd',
        status: 'Active',
      },
      {
        subjectCode: 'IT401',
        subjectName: 'Cloud Computing Architecture',
        course: courses[1]._id,
        semester: 4,
        credits: 3,
        facultyName: 'Dr. Grace Hopper',
        status: 'Active',
      },
      {
        subjectCode: 'IT402',
        subjectName: 'Web & Distributed Systems',
        course: courses[1]._id,
        semester: 4,
        credits: 3,
        facultyName: 'Prof. Tim Berners-Lee',
        status: 'Active',
      },
      {
        subjectCode: 'EC401',
        subjectName: 'Digital Signal Processing',
        course: courses[2]._id,
        semester: 4,
        credits: 4,
        facultyName: 'Dr. Claude Shannon',
        status: 'Active',
      },
      {
        subjectCode: 'EC402',
        subjectName: 'Microcontrollers & Embedded Systems',
        course: courses[2]._id,
        semester: 4,
        credits: 3,
        facultyName: 'Prof. Dennis Ritchie',
        status: 'Active',
      },
    ]);

    // 5. Seed 15 Students
    console.log('Creating 15 Students & Student Portal User Accounts...');
    const rawStudentData = [
      { name: 'Alex Harrison', email: 'student1@sams.edu', reg: 'REG2025001', gender: 'Male', courseIdx: 0, dept: 'School of Computing' },
      { name: 'Sophia Chen', email: 'student2@sams.edu', reg: 'REG2025002', gender: 'Female', courseIdx: 0, dept: 'School of Computing' },
      { name: 'Liam Patel', email: 'student3@sams.edu', reg: 'REG2025003', gender: 'Male', courseIdx: 0, dept: 'School of Computing' },
      { name: 'Emma Watson', email: 'student4@sams.edu', reg: 'REG2025004', gender: 'Female', courseIdx: 0, dept: 'School of Computing' },
      { name: 'Noah Davis', email: 'student5@sams.edu', reg: 'REG2025005', gender: 'Male', courseIdx: 0, dept: 'School of Computing' },
      { name: 'Olivia Martin', email: 'student6@sams.edu', reg: 'REG2025006', gender: 'Female', courseIdx: 0, dept: 'School of Computing' },
      
      { name: 'Ethan Miller', email: 'student7@sams.edu', reg: 'REG2025007', gender: 'Male', courseIdx: 1, dept: 'School of Information Sciences' },
      { name: 'Ava Taylor', email: 'student8@sams.edu', reg: 'REG2025008', gender: 'Female', courseIdx: 1, dept: 'School of Information Sciences' },
      { name: 'Lucas Anderson', email: 'student9@sams.edu', reg: 'REG2025009', gender: 'Male', courseIdx: 1, dept: 'School of Information Sciences' },
      { name: 'Mia Thomas', email: 'student10@sams.edu', reg: 'REG2025010', gender: 'Female', courseIdx: 1, dept: 'School of Information Sciences' },
      { name: 'Benjamin Jackson', email: 'student11@sams.edu', reg: 'REG2025011', gender: 'Male', courseIdx: 1, dept: 'School of Information Sciences' },

      { name: 'Charlotte White', email: 'student12@sams.edu', reg: 'REG2025012', gender: 'Female', courseIdx: 2, dept: 'School of Electrical Sciences' },
      { name: 'Mason Harris', email: 'student13@sams.edu', reg: 'REG2025013', gender: 'Male', courseIdx: 2, dept: 'School of Electrical Sciences' },
      { name: 'Amelia Clark', email: 'student14@sams.edu', reg: 'REG2025014', gender: 'Female', courseIdx: 2, dept: 'School of Electrical Sciences' },
      { name: 'Oliver Lewis', email: 'student15@sams.edu', reg: 'REG2025015', gender: 'Male', courseIdx: 2, dept: 'School of Electrical Sciences' },
    ];

    const studentDocs = [];

    for (let i = 0; i < rawStudentData.length; i++) {
      const s = rawStudentData[i];
      const assignedCourse = courses[s.courseIdx];

      const student = await Student.create({
        registrationNumber: s.reg,
        fullName: s.name,
        email: s.email,
        phone: `+1 (555) 010-${(100 + i).toString()}`,
        gender: s.gender,
        dob: new Date(2003, i % 12, (i + 5) % 28 + 1),
        department: s.dept,
        course: assignedCourse._id,
        semester: 4,
        address: `${100 + i * 12} University Campus Avenue, Suite ${i + 1}, Metro City`,
        status: 'Active',
      });

      studentDocs.push(student);

      // Create linked user login account
      await User.create({
        name: s.name,
        email: s.email,
        password: 'Student@123',
        role: 'student',
        student: student._id,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name.replace(' ', '')}`,
      });

      // Find subjects for this course
      const courseSubjects = subjects.filter(
        (sub) => sub.course.toString() === assignedCourse._id.toString()
      );

      // Create Enrollment
      await Enrollment.create({
        student: student._id,
        course: assignedCourse._id,
        semester: 4,
        subjects: courseSubjects.map((sub) => sub._id),
        status: 'Active',
        academicYear: '2025-2026',
      });
    }

    // 6. Seed Attendance Records for the last 5 school days
    console.log('Generating realistic Attendance Records...');
    const attendanceDates = [
      '2026-10-27',
      '2026-10-28',
      '2026-10-29',
      '2026-10-30',
      '2026-11-02',
    ];

    const attendanceRecords = [];

    for (const student of studentDocs) {
      // Find course subjects
      const relevantSubjects = subjects.filter(
        (sub) => sub.course.toString() === student.course.toString()
      );

      for (const subject of relevantSubjects) {
        for (const date of attendanceDates) {
          // Realistic attendance probability: 85% Present, 10% Absent, 5% Leave
          const rand = Math.random();
          let status = 'Present';
          if (rand > 0.90) {
            status = 'Leave';
          } else if (rand > 0.82) {
            status = 'Absent';
          }

          attendanceRecords.push({
            student: student._id,
            course: student.course,
            subject: subject._id,
            semester: 4,
            date: date,
            status: status,
            markedBy: adminUser._id,
            remarks: status === 'Leave' ? 'Approved medical slip' : '',
          });
        }
      }
    }

    await Attendance.insertMany(attendanceRecords);

    // 7. Seed Examination Marks across multiple exam types
    console.log('Generating Examination Marks...');
    const examTypes = ['Internal Assessment', 'Assignment', 'Mid-Semester'];
    const markRecords = [];

    function computeGrade(pct) {
      if (pct >= 90) return 'A+';
      if (pct >= 80) return 'A';
      if (pct >= 70) return 'B';
      if (pct >= 60) return 'C';
      if (pct >= 50) return 'D';
      return 'F';
    }

    for (const student of studentDocs) {
      const relevantSubjects = subjects.filter(
        (sub) => sub.course.toString() === student.course.toString()
      );

      for (const subject of relevantSubjects) {
        for (const exam of examTypes) {
          const maxMarks = exam === 'Internal Assessment' ? 25 : exam === 'Assignment' ? 20 : 50;
          // Generate score between 65% and 98%
          const baseRatio = 0.65 + Math.random() * 0.32;
          const obtainedMarks = Math.round(maxMarks * baseRatio);
          const percentage = parseFloat(((obtainedMarks / maxMarks) * 100).toFixed(2));
          const grade = computeGrade(percentage);

          markRecords.push({
            student: student._id,
            course: student.course,
            subject: subject._id,
            semester: 4,
            examType: exam,
            obtainedMarks,
            maxMarks,
            percentage,
            grade,
            academicYear: '2025-2026',
            remarks: percentage >= 85 ? 'Outstanding effort' : 'Consistent performance',
          });
        }
      }
    }

    await Mark.insertMany(markRecords);

    // 8. Seed Audit Activity Logs
    console.log('Seeding administrative activities...');
    await Activity.insertMany([
      {
        action: 'SYSTEM_INIT',
        description: 'Student Academic Management System initialized with default campus database',
        performedBy: 'Dr. Arthur Vance',
        entityType: 'System',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        action: 'ADD_COURSE',
        description: 'New course approved: B.Tech in Computer Science & Engineering (CS101)',
        performedBy: 'Dr. Arthur Vance',
        entityType: 'Course',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        action: 'REGISTER_STUDENT',
        description: 'Batch enrollment processed: 15 students registered for Semester 4',
        performedBy: 'Dr. Arthur Vance',
        entityType: 'Student',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        action: 'UPDATE_ATTENDANCE',
        description: 'Daily attendance registered for CS401 & CS402',
        performedBy: 'Dr. Arthur Vance',
        entityType: 'Attendance',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        action: 'UPLOAD_MARKS',
        description: 'Mid-Semester examination scores published for all departments',
        performedBy: 'Dr. Arthur Vance',
        entityType: 'Mark',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    ]);

    console.log('\n======================================================');
    console.log('  SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Admin Account:');
    console.log('  Email:    admin@sams.edu');
    console.log('  Password: Admin@123\n');
    console.log('Sample Student Accounts:');
    console.log('  Email:    student1@sams.edu ... student15@sams.edu');
    console.log('  Password: Student@123\n');
    console.log('Data Created:');
    console.log(`  - 1 Admin User + 15 Student Users`);
    console.log(`  - ${studentDocs.length} Student Profiles`);
    console.log(`  - ${courses.length} Courses`);
    console.log(`  - ${subjects.length} Subjects`);
    console.log(`  - ${attendanceRecords.length} Attendance records`);
    console.log(`  - ${markRecords.length} Examination Mark records`);
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
