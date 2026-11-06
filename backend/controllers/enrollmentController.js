const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Activity = require('../models/Activity');

// @desc   Get all enrollments with search & filters
// @route  GET /api/enrollments
// @access Private
exports.getEnrollments = async (req, res) => {
  try {
    const { course, semester, status, search } = req.query;
    const query = {};

    if (course) query.course = course;
    if (semester) query.semester = Number(semester);
    if (status) query.status = status;

    let enrollments = await Enrollment.find(query)
      .populate({
        path: 'student',
        select: 'fullName registrationNumber email department phone',
      })
      .populate('course', 'courseName courseCode department')
      .populate('subjects', 'subjectName subjectCode credits')
      .sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      enrollments = enrollments.filter(
        (e) =>
          e.student?.fullName?.toLowerCase().includes(s) ||
          e.student?.registrationNumber?.toLowerCase().includes(s) ||
          e.student?.email?.toLowerCase().includes(s)
      );
    }

    res.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Create or update enrollment
// @route  POST /api/enrollments
// @access Private (Admin)
exports.createEnrollment = async (req, res) => {
  try {
    const { student, course, semester, subjects, status, academicYear } = req.body;

    // Check duplicate active enrollment
    const existing = await Enrollment.findOne({
      student,
      course,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This student is already enrolled in the selected course',
      });
    }

    const enrollment = await Enrollment.create({
      student,
      course,
      semester: Number(semester) || 1,
      subjects: subjects || [],
      status: status || 'Active',
      academicYear: academicYear || '2025-2026',
    });

    const populated = await Enrollment.findById(enrollment._id)
      .populate('student', 'fullName registrationNumber')
      .populate('course', 'courseName courseCode');

    await Activity.create({
      action: 'ENROLL_STUDENT',
      description: `Student enrolled: ${populated.student?.fullName} into ${populated.course?.courseName}`,
      performedBy: req.user ? req.user.name : 'Admin',
      entityType: 'Enrollment',
      entityId: enrollment._id,
    });

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Student enrolled successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update enrollment (status, subjects, semester)
// @route  PUT /api/enrollments/:id
// @access Private (Admin)
exports.updateEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    const updated = await Enrollment.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        semester: req.body.semester ? Number(req.body.semester) : enrollment.semester,
      },
      { new: true }
    )
      .populate('student', 'fullName registrationNumber')
      .populate('course', 'courseName courseCode')
      .populate('subjects');

    await Activity.create({
      action: 'UPDATE_ENROLLMENT',
      description: `Enrollment status updated for ${updated.student?.fullName}: ${updated.status}`,
      performedBy: req.user ? req.user.name : 'Admin',
      entityType: 'Enrollment',
      entityId: updated._id,
    });

    res.json({
      success: true,
      data: updated,
      message: 'Enrollment updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete enrollment
// @route  DELETE /api/enrollments/:id
// @access Private (Admin)
exports.deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    await Enrollment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Enrollment record deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
