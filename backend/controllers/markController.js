const Mark = require('../models/Mark');
const Subject = require('../models/Subject');
const Activity = require('../models/Activity');

function computeGrade(pct) {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
}

// @desc   Get marks with filters
// @route  GET /api/marks
// @access Private
exports.getMarks = async (req, res) => {
  try {
    const { course, semester, subject, examType, student } = req.query;
    const query = {};

    if (course) query.course = course;
    if (semester) query.semester = Number(semester);
    if (subject) query.subject = subject;
    if (examType) query.examType = examType;
    if (student) query.student = student;

    // Student role isolation
    if (req.user && req.user.role === 'student') {
      query.student = req.user.student;
    }

    const marks = await Mark.find(query)
      .populate('student', 'fullName registrationNumber email department')
      .populate('subject', 'subjectName subjectCode credits')
      .populate('course', 'courseName courseCode')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: marks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Batch save/update examination marks
// @route  POST /api/marks
// @access Private (Admin)
exports.saveMarks = async (req, res) => {
  try {
    const { course, semester, subject, examType, maxMarks, marksList, academicYear } = req.body;

    if (!course || !subject || !examType || !Array.isArray(marksList) || marksList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide course, subject, exam type, and marks entries',
      });
    }

    const max = Number(maxMarks);
    if (!Number.isFinite(max) || max <= 0) {
      return res.status(400).json({ success: false, message: 'Maximum marks must be greater than zero' });
    }

    const operations = marksList.map((item) => {
      const obtained = Number(item.obtainedMarks);
      if (!Number.isFinite(obtained) || obtained < 0 || obtained > max) {
        throw new Error(`Obtained marks must be between 0 and ${max}`);
      }

      const percentage = parseFloat(((obtained / max) * 100).toFixed(2));
      const grade = computeGrade(percentage);

      return {
        updateOne: {
          filter: {
            student: item.studentId,
            subject: subject,
            examType: examType,
            semester: Number(semester) || 1,
            academicYear: academicYear || '2025-2026',
          },
          update: {
            $set: {
              course: course,
              semester: Number(semester) || 1,
              subject: subject,
              examType: examType,
              obtainedMarks: obtained,
              maxMarks: max,
              percentage: percentage,
              grade: grade,
              academicYear: academicYear || '2025-2026',
              remarks: item.remarks || '',
            },
          },
          upsert: true,
        },
      };
    });

    await Mark.bulkWrite(operations);

    const subjectDoc = await Subject.findById(subject);
    await Activity.create({
      action: 'UPLOAD_MARKS',
      description: `${examType} marks uploaded for ${marksList.length} students in ${subjectDoc?.subjectName || 'Subject'}`,
      performedBy: req.user ? req.user.name : 'Admin',
      entityType: 'Mark',
      entityId: subject,
    });

    res.json({
      success: true,
      message: `Marks for ${marksList.length} students saved successfully`,
    });
  } catch (error) {
    console.error('Error saving marks:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update single mark record
// @route  PUT /api/marks/:id
// @access Private (Admin)
exports.updateMark = async (req, res) => {
  try {
    const mark = await Mark.findById(req.params.id);
    if (!mark) {
      return res.status(404).json({ success: false, message: 'Marks record not found' });
    }

    if (req.body.obtainedMarks !== undefined) {
      mark.obtainedMarks = Number(req.body.obtainedMarks);
    }
    if (req.body.maxMarks !== undefined) {
      mark.maxMarks = Number(req.body.maxMarks);
    }
    if (req.body.remarks !== undefined) {
      mark.remarks = req.body.remarks;
    }

    mark.percentage = parseFloat(((mark.obtainedMarks / mark.maxMarks) * 100).toFixed(2));
    mark.grade = computeGrade(mark.percentage);

    await mark.save();

    res.json({
      success: true,
      data: mark,
      message: 'Marks updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
