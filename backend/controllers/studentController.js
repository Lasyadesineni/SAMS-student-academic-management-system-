const Student = require('../models/Student');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const Activity = require('../models/Activity');

// @desc   Get all students with search, filters, pagination, and stats
// @route  GET /api/students
// @access Private (Admin)
exports.getStudents = async (req, res) => {
  try {
    const { search, course, semester, department, status, page = 1, limit = 10 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (course) query.course = course;
    if (semester) query.semester = Number(semester);
    if (department) query.department = department;
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [students, total] = await Promise.all([
      Student.find(query)
        .populate('course', 'courseName courseCode department')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Student.countDocuments(query),
    ]);

    // Compute department stats and counts
    const departmentStats = await Student.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $project: { department: '$_id', count: 1, _id: 0 } },
    ]);

    const activeCount = await Student.countDocuments({ status: 'Active' });
    const totalAll = await Student.countDocuments();

    res.json({
      success: true,
      data: students,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
      stats: {
        totalStudents: totalAll,
        activeStudents: activeCount,
        departmentStats,
      },
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get single student by ID
// @route  GET /api/students/:id
// @access Private
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('course');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Also fetch their active enrollments, recent marks, and attendance overview
    const [enrollments, marks, attendanceTotal, attendancePresent] = await Promise.all([
      Enrollment.find({ student: student._id }).populate('course').populate('subjects'),
      Mark.find({ student: student._id }).populate('subject').sort({ createdAt: -1 }),
      Attendance.countDocuments({ student: student._id }),
      Attendance.countDocuments({ student: student._id, status: 'Present' }),
    ]);

    const attendancePct = attendanceTotal > 0
      ? parseFloat(((attendancePresent / attendanceTotal) * 100).toFixed(2))
      : 0;

    res.json({
      success: true,
      data: {
        ...student.toObject(),
        enrollments,
        marks,
        attendanceStats: {
          totalClasses: attendanceTotal,
          classesAttended: attendancePresent,
          classesMissed: attendanceTotal - attendancePresent,
          attendancePercentage: attendancePct,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Create new student
// @route  POST /api/students
// @access Private (Admin)
exports.createStudent = async (req, res) => {
  let student = null;
  let studentUser = null;
  let enrollment = null;

  try {
    const {
      registrationNumber,
      fullName,
      email,
      phone,
      gender,
      dob,
      department,
      course,
      semester,
      address,
      status,
      password,
    } = req.body;

    if (!registrationNumber || !fullName || !email || !phone || !gender || !dob || !department || !course || !semester || !address) {
      return res.status(400).json({ success: false, message: 'Please provide all required student details' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedReg = registrationNumber.toUpperCase().trim();

    const existingStudent = await Student.findOne({
      $or: [{ registrationNumber: normalizedReg }, { email: normalizedEmail }],
    });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'A student with this registration number or email already exists',
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user account already exists with this email',
      });
    }

    studentUser = await User.create({
      name: fullName.trim(),
      email: normalizedEmail,
      password: password || 'Student@123',
      role: 'student',
    });

    student = await Student.create({
      userId: studentUser._id,
      user: studentUser._id,
      registrationNumber: normalizedReg,
      fullName: fullName.trim(),
      name: fullName.trim(),
      email: normalizedEmail,
      phone,
      gender,
      dob,
      dateOfBirth: dob,
      department,
      course,
      semester: Number(semester) || 1,
      address,
      status: status || 'Active',
    });

    studentUser.studentId = student._id;
    studentUser.student = student._id;
    await studentUser.save();

    enrollment = await Enrollment.create({
      student: student._id,
      course,
      semester: Number(semester) || 1,
      subjects: [],
      status: 'Active',
    });

    await Activity.create({
      action: 'REGISTER_STUDENT',
      description: `New student registered: ${fullName} (${student.registrationNumber})`,
      performedBy: req.user ? req.user.name : 'Admin',
      entityType: 'Student',
      entityId: student._id,
    });

    res.status(201).json({
      success: true,
      data: student,
      loginCreated: true,
      loginEmail: normalizedEmail,
      loginPassword: password || 'Student@123',
      enrollmentId: enrollment._id,
      message: 'Student and portal login account registered successfully',
    });
  } catch (error) {
    if (enrollment) await Enrollment.findByIdAndDelete(enrollment._id).catch(() => {});
    if (student) await Student.findByIdAndDelete(student._id).catch(() => {});
    if (studentUser) await User.findByIdAndDelete(studentUser._id).catch(() => {});

    console.error('Error creating student:', error);
    res.status(error.code === 11000 ? 400 : 500).json({
      success: false,
      message: error.code === 11000 ? 'Duplicate student registration number or email' : error.message,
    });
  }
};

// @desc   Update student
// @route  PUT /api/students/:id
// @access Private (Admin)
exports.updateStudent = async (req, res) => {
  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check for duplicate reg number or email if modified
    if (req.body.registrationNumber && req.body.registrationNumber.toUpperCase() !== student.registrationNumber) {
      const regExists = await Student.findOne({ registrationNumber: req.body.registrationNumber.toUpperCase() });
      if (regExists) {
        return res.status(400).json({ success: false, message: 'Registration number already in use' });
      }
    }

    if (req.body.email && req.body.email.toLowerCase() !== student.email) {
      const emailExists = await Student.findOne({ email: req.body.email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email address already in use' });
      }
    }

    const previousEmail = student.email;

    student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        registrationNumber: req.body.registrationNumber ? req.body.registrationNumber.toUpperCase().trim() : student.registrationNumber,
        email: req.body.email ? req.body.email.toLowerCase().trim() : student.email,
      },
      { new: true, runValidators: true }
    ).populate('course');

    // Sync corresponding user record if email or name changed
    const loginUser = await User.findOne({ $or: [{ student: student._id }, { email: previousEmail }] });
    if (loginUser) {
      loginUser.name = student.fullName;
      loginUser.email = student.email;
      if (req.body.password?.trim()) {
        if (req.body.password.trim().length < 6) {
          return res.status(400).json({ success: false, message: 'Login password must be at least 6 characters' });
        }
        loginUser.password = req.body.password.trim();
      }
      await loginUser.save();
    }

    // Log Activity
    await Activity.create({
      action: 'UPDATE_STUDENT',
      description: `Student details updated: ${student.fullName} (${student.registrationNumber})`,
      performedBy: req.user ? req.user.name : 'Admin',
      entityType: 'Student',
      entityId: student._id,
    });

    res.json({
      success: true,
      data: student,
      message: 'Student profile updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete student
// @route  DELETE /api/students/:id
// @access Private (Admin)
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Clean up related records
    await Promise.all([
      Student.findByIdAndDelete(req.params.id),
      User.findOneAndDelete({ student: req.params.id }),
      Enrollment.deleteMany({ student: req.params.id }),
      Attendance.deleteMany({ student: req.params.id }),
      Mark.deleteMany({ student: req.params.id }),
    ]);

    // Log Activity
    await Activity.create({
      action: 'DELETE_STUDENT',
      description: `Student record removed: ${student.fullName} (${student.registrationNumber})`,
      performedBy: req.user ? req.user.name : 'Admin',
      entityType: 'Student',
      entityId: student._id,
    });

    res.json({
      success: true,
      message: 'Student record and associated records deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
