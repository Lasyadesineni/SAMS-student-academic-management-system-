const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Enrollment = require('../models/Enrollment');
const Activity = require('../models/Activity');

// @desc   Get all courses with enrolled student count
// @route  GET /api/courses
// @access Private
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });

    // Aggregate enrolled student counts per course
    const enrollmentCounts = await Enrollment.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    enrollmentCounts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const coursesWithCount = courses.map((course) => {
      return {
        ...course.toObject(),
        enrolledStudentsCount: countMap[course._id.toString()] || 0,
      };
    });

    res.json({
      success: true,
      data: coursesWithCount,
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get single course details
// @route  GET /api/courses/:id
// @access Private
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const [subjects, enrolledCount] = await Promise.all([
      Subject.find({ course: course._id }),
      Enrollment.countDocuments({ course: course._id, status: 'Active' }),
    ]);

    res.json({
      success: true,
      data: {
        ...course.toObject(),
        subjects,
        enrolledStudentsCount: enrolledCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Create course
// @route  POST /api/courses
// @access Private (Admin)
exports.createCourse = async (req, res) => {
  try {
    const { courseCode, courseName, department, duration, totalSemesters, description, status } = req.body;

    const existing = await Course.findOne({ courseCode: courseCode.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Course code already exists' });
    }

    const course = await Course.create({
      courseCode: courseCode.toUpperCase().trim(),
      courseName,
      department,
      duration,
      totalSemesters: Number(totalSemesters) || 8,
      description,
      status: status || 'Active',
    });

    await Activity.create({
      action: 'ADD_COURSE',
      description: `New course created: ${course.courseName} (${course.courseCode})`,
      performedBy: req.user ? req.user.name : 'Admin',
      entityType: 'Course',
      entityId: course._id,
    });

    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update course
// @route  PUT /api/courses/:id
// @access Private (Admin)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (req.body.courseCode && req.body.courseCode.toUpperCase() !== course.courseCode) {
      const exists = await Course.findOne({ courseCode: req.body.courseCode.toUpperCase() });
      if (exists) {
        return res.status(400).json({ success: false, message: 'Course code already exists' });
      }
    }

    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        courseCode: req.body.courseCode ? req.body.courseCode.toUpperCase().trim() : course.courseCode,
      },
      { new: true, runValidators: true }
    );

    await Activity.create({
      action: 'UPDATE_COURSE',
      description: `Course updated: ${updated.courseName} (${updated.courseCode})`,
      performedBy: req.user ? req.user.name : 'Admin',
      entityType: 'Course',
      entityId: updated._id,
    });

    res.json({
      success: true,
      data: updated,
      message: 'Course updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete course
// @route  DELETE /api/courses/:id
// @access Private (Admin)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const activeEnrollments = await Enrollment.countDocuments({ course: course._id });
    if (activeEnrollments > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete course with ${activeEnrollments} active enrolled students. Archive or reassign students first.`,
      });
    }

    await Course.findByIdAndDelete(req.params.id);
    await Subject.deleteMany({ course: req.params.id });

    await Activity.create({
      action: 'DELETE_COURSE',
      description: `Course deleted: ${course.courseName} (${course.courseCode})`,
      performedBy: req.user ? req.user.name : 'Admin',
      entityType: 'Course',
      entityId: course._id,
    });

    res.json({
      success: true,
      message: 'Course and associated subjects deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
