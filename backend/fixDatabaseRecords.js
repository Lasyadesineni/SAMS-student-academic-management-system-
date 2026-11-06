require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sams_db';

function computeGrade(pct) {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
}

async function fixRecords() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB sams_db');

    const User = require('./models/User');
    const Student = require('./models/Student');
    const Course = require('./models/Course');
    const Subject = require('./models/Subject');
    const Enrollment = require('./models/Enrollment');
    const Attendance = require('./models/Attendance');
    const Mark = require('./models/Mark');

    // 1. Link all existing demo users and students bidirectionally
    console.log('\n--- 1. Linking existing users and students ---');
    const allUsers = await User.find({ role: 'student' });
    let linkedCount = 0;

    for (const u of allUsers) {
      let student = null;
      if (u.student || u.studentId) {
        student = await Student.findById(u.student || u.studentId);
      }
      if (!student) {
        student = await Student.findOne({ email: u.email.toLowerCase().trim() });
      }

      if (student) {
        // Update User
        u.studentId = student._id;
        u.student = student._id;
        await u.save();

        // Update Student
        student.userId = u._id;
        student.user = u._id;
        if (!student.name) student.name = student.fullName;
        if (!student.dateOfBirth) student.dateOfBirth = student.dob;
        await student.save();

        linkedCount++;
        console.log(`Linked User <${u.email}> <-> Student [${student.registrationNumber}] (${student.fullName})`);
      }
    }
    console.log(`Successfully linked ${linkedCount} existing user-student pairs.`);

    // 2. Fix the logged-in student account (lasya@gmail.com)
    console.log('\n--- 2. Checking / Creating Student Profile for lasya@gmail.com ---');
    const lasyaUser = await User.findOne({ email: 'lasya@gmail.com' });

    if (lasyaUser) {
      let lasyaStudent = await Student.findOne({
        $or: [{ userId: lasyaUser._id }, { email: 'lasya@gmail.com' }],
      });

      const csCourse = await Course.findOne({ courseCode: 'CS101' });
      const csSubjects = await Subject.find({ course: csCourse._id });

      if (!lasyaStudent) {
        console.log('Student profile is MISSING for lasya@gmail.com. Creating it now...');
        lasyaStudent = await Student.create({
          userId: lasyaUser._id,
          user: lasyaUser._id,
          registrationNumber: 'REG2025016',
          fullName: 'Lasya',
          name: 'Lasya',
          email: 'lasya@gmail.com',
          phone: '+1 (555) 010-116',
          gender: 'Female',
          dob: new Date('2003-08-15'),
          dateOfBirth: new Date('2003-08-15'),
          department: 'School of Computing',
          course: csCourse._id,
          semester: 4,
          address: '100 University Campus Avenue, Suite 16, Metro City',
          status: 'Active',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Lasya`,
        });
        console.log(`Created Student Profile: ID ${lasyaStudent._id}, RegNo: ${lasyaStudent.registrationNumber}`);
      } else {
        lasyaStudent.userId = lasyaUser._id;
        lasyaStudent.user = lasyaUser._id;
        await lasyaStudent.save();
        console.log(`Existing Student profile found and linked to lasya@gmail.com.`);
      }

      // Link User to Student
      lasyaUser.studentId = lasyaStudent._id;
      lasyaUser.student = lasyaStudent._id;
      await lasyaUser.save();
      console.log(`Linked lasyaUser.studentId -> ${lasyaStudent._id}`);

      // 3. Ensure enrollment exists
      let enrollment = await Enrollment.findOne({ student: lasyaStudent._id, course: csCourse._id });
      if (!enrollment) {
        enrollment = await Enrollment.create({
          student: lasyaStudent._id,
          course: csCourse._id,
          semester: 4,
          subjects: csSubjects.map((s) => s._id),
          status: 'Active',
          academicYear: '2025-2026',
        });
        console.log(`Created active enrollment for lasya in ${csCourse.courseName}`);
      }

      // 4. Ensure Attendance Records exist
      const attendanceCount = await Attendance.countDocuments({ student: lasyaStudent._id });
      if (attendanceCount === 0) {
        console.log('Generating realistic attendance records for Lasya...');
        const dates = ['2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-11-02'];
        const attRecords = [];

        for (const sub of csSubjects) {
          for (const d of dates) {
            const status = d === '2026-10-29' ? 'Absent' : 'Present';
            attRecords.push({
              student: lasyaStudent._id,
              course: csCourse._id,
              subject: sub._id,
              semester: 4,
              date: d,
              status: status,
              remarks: status === 'Present' ? 'Regular lecture' : 'Leave granted',
            });
          }
        }
        await Attendance.insertMany(attRecords);
        console.log(`Inserted ${attRecords.length} attendance records for Lasya.`);
      }

      // 5. Ensure Examination Marks exist
      const marksCount = await Mark.countDocuments({ student: lasyaStudent._id });
      if (marksCount === 0) {
        console.log('Generating realistic examination marks for Lasya...');
        const exams = [
          { type: 'Internal Assessment', max: 25, score: 23 },
          { type: 'Assignment', max: 20, score: 19 },
          { type: 'Mid-Semester', max: 50, score: 44 },
        ];
        const markRecords = [];

        for (const sub of csSubjects) {
          for (const exam of exams) {
            const pct = parseFloat(((exam.score / exam.max) * 100).toFixed(2));
            markRecords.push({
              student: lasyaStudent._id,
              course: csCourse._id,
              subject: sub._id,
              semester: 4,
              examType: exam.type,
              obtainedMarks: exam.score,
              maxMarks: exam.max,
              percentage: pct,
              grade: computeGrade(pct),
              academicYear: '2025-2026',
              remarks: 'Excellent academic performance',
            });
          }
        }
        await Mark.insertMany(markRecords);
        console.log(`Inserted ${markRecords.length} examination mark records for Lasya.`);
      }
    } else {
      console.log('lasyaUser not found in users collection.');
    }

    console.log('\n--- 3. Verification check of all student profiles ---');
    const finalStudents = await Student.find().populate('userId', 'email name');
    console.log(`Total Student Profiles now: ${finalStudents.length}`);
    finalStudents.forEach((s) => {
      console.log(` - [${s.registrationNumber}] ${s.fullName} (${s.email}) -> userId: ${s.userId?._id} (${s.userId?.email})`);
    });

    console.log('\nDATABASE REPAIR & RELATIONSHIP FIX COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('Error during database repair:', err);
    process.exit(1);
  }
}

fixRecords();
