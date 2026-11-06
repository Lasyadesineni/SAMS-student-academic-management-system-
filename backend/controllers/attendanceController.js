const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Activity = require('../models/Activity');

// @desc   Get attendance records / sheet
// @route  GET /api/attendance
// @access Private
exports.getAttendance = async (req, res) => {
  try {
    const { course, semester, subject, date, student } = req.query;
    const query = {};

    if (course) query.course = course;
    if (semester) query.semester = Number(semester);
    if (subject) query.subject = subject;
    if (date) query.date = date;
    if (student) query.student = student;

    // If logged in as student, enforce their student ID
    if (req.user && req.user.role === 'student') {
      query.student = req.user.student;
    }

    const records = await Attendance.find(query)
      .populate('student', 'fullName registrationNumber email department')
      .populate('subject', 'subjectName subjectCode')
      .populate('course', 'courseName courseCode')
      .sort({ date: -1, createdAt: -1 });

    // Aggregate overall statistics
    const statsQuery = {};
    if (course) statsQuery.course = course;
    if (subject) statsQuery.subject = subject;
    if (student) statsQuery.student = student;
    if (req.user && req.user.role === 'student') statsQuery.student = req.user.student;

    const [totalRecords, presentCount, absentCount, leaveCount] = await Promise.all([
      Attendance.countDocuments(statsQuery),
      Attendance.countDocuments({ ...statsQuery, status: 'Present' }),
      Attendance.countDocuments({ ...statsQuery, status: 'Absent' }),
      Attendance.countDocuments({ ...statsQuery, status: 'Leave' }),
    ]);

    const percentage = totalRecords > 0
      ? parseFloat(((presentCount / totalRecords) * 100).toFixed(2))
      : 0;

    res.json({
      success: true,
      data: records,
      summary: {
        totalClasses: totalRecords,
        classesAttended: presentCount,
        classesMissed: absentCount,
        classesLeave: leaveCount,
        attendancePercentage: percentage,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Save / Bulk mark attendance for a class
// @route  POST /api/attendance
// @access Private (Admin)
exports.saveAttendance = async (req, res) => {
  try {
    const { course, semester, subject, date, attendanceList } = req.body;

    if (!course || !subject || !date || !Array.isArray(attendanceList) || attendanceList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide course, subject, date, and student attendance list',
      });
    }

    const operations = attendanceList.map((item) => ({
      updateOne: {
        filter: {
          student: item.studentId,
          subject: subject,
          date: date,
        },
        update: {
          $set: {
            course: course,
            semester: Number(semester) || 1,
            subject: subject,
            date: date,
            status: item.status || 'Present',
            remarks: item.remarks || '',
            markedBy: req.user ? req.user._id : null,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(operations);

    // Fetch subject info for activity log
    const subjectDoc = await Subject.findById(subject);
    await Activity.create({
      action: 'UPDATE_ATTENDANCE',
      description: `Attendance recorded for ${attendanceList.length} students in ${subjectDoc?.subjectName || 'Subject'} on ${date}`,
      performedBy: req.user ? req.user.name : 'Admin',
      entityType: 'Attendance',
      entityId: subject,
    });

    res.json({
      success: true,
      message: `Attendance for ${attendanceList.length} students recorded successfully on ${date}`,
    });
  } catch (error) {
    console.error('Error saving attendance:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update a single attendance record
// @route  PUT /api/attendance/:id
// @access Private (Admin)
exports.updateAttendanceRecord = async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    record.status = req.body.status || record.status;
    record.remarks = req.body.remarks !== undefined ? req.body.remarks : record.remarks;
    await record.save();

    res.json({
      success: true,
      data: record,
      message: 'Attendance record updated',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
