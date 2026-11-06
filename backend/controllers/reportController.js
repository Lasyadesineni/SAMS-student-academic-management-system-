const Student = require('../models/Student');
const Mark = require('../models/Mark');
const Attendance = require('../models/Attendance');
const Subject = require('../models/Subject');
const Course = require('../models/Course');

// @desc   Get attendance reports with filters
// @route  GET /api/reports/attendance
// @access Private (Admin)
exports.getAttendanceReport = async (req, res) => {
  try {
    const { course, semester, subject, startDate, endDate } = req.query;
    const matchQuery = {};

    if (course) matchQuery.course = course;
    if (semester) matchQuery.semester = Number(semester);
    if (subject) matchQuery.subject = subject;
    if (startDate && endDate) {
      matchQuery.date = { $gte: startDate, $lte: endDate };
    }

    const report = await Attendance.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$student',
          totalClasses: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] } },
          leave: { $sum: { $cond: [{ $eq: ['$status', 'Leave'] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      { $unwind: '$studentInfo' },
      {
        $lookup: {
          from: 'courses',
          localField: 'studentInfo.course',
          foreignField: '_id',
          as: 'courseInfo',
        },
      },
      { $unwind: { path: '$courseInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          studentId: '$_id',
          name: '$studentInfo.fullName',
          registrationNumber: '$studentInfo.registrationNumber',
          department: '$studentInfo.department',
          courseName: '$courseInfo.courseName',
          totalClasses: 1,
          present: 1,
          absent: 1,
          leave: 1,
          attendancePercentage: {
            $round: [{ $multiply: [{ $divide: ['$present', '$totalClasses'] }, 100] }, 2],
          },
        },
      },
      { $sort: { attendancePercentage: -1 } },
    ]);

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get academic performance reports
// @route  GET /api/reports/performance
// @access Private (Admin)
exports.getPerformanceReport = async (req, res) => {
  try {
    const { course, semester, subject, examType } = req.query;
    const matchQuery = {};

    if (course) matchQuery.course = course;
    if (semester) matchQuery.semester = Number(semester);
    if (subject) matchQuery.subject = subject;
    if (examType) matchQuery.examType = examType;

    const report = await Mark.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo',
        },
      },
      { $unwind: '$studentInfo' },
      {
        $lookup: {
          from: 'subjects',
          localField: 'subject',
          foreignField: '_id',
          as: 'subjectInfo',
        },
      },
      { $unwind: '$subjectInfo' },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'courseInfo',
        },
      },
      { $unwind: { path: '$courseInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          studentName: '$studentInfo.fullName',
          registrationNumber: '$studentInfo.registrationNumber',
          courseName: '$courseInfo.courseName',
          subjectName: '$subjectInfo.subjectName',
          subjectCode: '$subjectInfo.subjectCode',
          examType: '$examType',
          obtainedMarks: '$obtainedMarks',
          maxMarks: '$maxMarks',
          percentage: '$percentage',
          grade: '$grade',
          academicYear: '$academicYear',
        },
      },
      { $sort: { percentage: -1 } },
    ]);

    // Summary calculations
    const subjectAverages = await Mark.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$subject',
          avgPercentage: { $avg: '$percentage' },
          highest: { $max: '$obtainedMarks' },
          lowest: { $min: '$obtainedMarks' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'subjects',
          localField: '_id',
          foreignField: '_id',
          as: 'subjectInfo',
        },
      },
      { $unwind: '$subjectInfo' },
      {
        $project: {
          subjectName: '$subjectInfo.subjectName',
          subjectCode: '$subjectInfo.subjectCode',
          avgPercentage: { $round: ['$avgPercentage', 2] },
          highest: 1,
          lowest: 1,
          count: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: report,
      subjectAverages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
