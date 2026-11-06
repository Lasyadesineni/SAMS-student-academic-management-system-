const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Activity = require('../models/Activity');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'sams_super_secret_jwt_key_2025', {
    expiresIn: '30d',
  });
};

// @desc   Login user & get token
// @route  POST /api/auth/login
// @access Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Bidirectional link verification for students
    let studentProfile = null;
    if (user.role === 'student') {
      const studentRef = user.studentId || user.student;
      if (studentRef) {
        studentProfile = await Student.findById(studentRef).populate('course', 'courseName courseCode department');
      }

      if (!studentProfile) {
        studentProfile = await Student.findOne({
          $or: [{ userId: user._id }, { email: normalizedEmail }],
        }).populate('course', 'courseName courseCode department');
      }

      if (studentProfile) {
        let userUpdated = false;
        if (!user.studentId || !user.student) {
          user.studentId = studentProfile._id;
          user.student = studentProfile._id;
          userUpdated = true;
        }
        if (!studentProfile.userId || !studentProfile.user) {
          studentProfile.userId = user._id;
          studentProfile.user = user._id;
          await studentProfile.save();
        }
        if (userUpdated) {
          await User.findByIdAndUpdate(user._id, {
            studentId: studentProfile._id,
            student: studentProfile._id,
          });
        }
      }
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        studentId: user.studentId || user.student || studentProfile?._id || null,
        student: studentProfile || user.student || user.studentId || null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Register user
// @route  POST /api/auth/register
// @access Public / Admin
exports.register = async (req, res) => {
  let createdUser = null;
  let createdStudent = null;
  let createdEnrollment = null;

  try {
    const {
      name,
      email,
      password,
      role,
      adminCode,
      registrationNumber,
      department,
      course,
      semester,
      phone,
      address,
    } = req.body;
    const normalizedEmail = String(email || '').toLowerCase().trim();

    if (!name?.trim() || !normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Check if a Student record already exists with this email or reg number
    let student = null;
    if (registrationNumber?.trim()) {
      student = await Student.findOne({
        registrationNumber: registrationNumber.toUpperCase().trim(),
      });
    }
    if (!student) {
      student = await Student.findOne({ email: normalizedEmail });
    }

    if (student) {
      // Connect existing student to new user account
      createdUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: 'student',
        studentId: student._id,
        student: student._id,
      });

      student.userId = createdUser._id;
      student.user = createdUser._id;
      await student.save();
      createdStudent = student;
    } else {
      // Find course or fallback to first available active course
      let assignedCourse = course;
      if (!assignedCourse) {
        const firstCourse = await Course.findOne({ status: 'Active' });
        assignedCourse = firstCourse?._id;
      }

      const regNum = registrationNumber?.trim()
        ? registrationNumber.toUpperCase().trim()
        : `REG${Date.now().toString().slice(-7)}`;

      // Create User first
      createdUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: 'student',
      });

      // Create Student profile connected to user
      createdStudent = await Student.create({
        userId: createdUser._id,
        user: createdUser._id,
        registrationNumber: regNum,
        fullName: name.trim(),
        name: name.trim(),
        email: normalizedEmail,
        phone: phone || '+1 (555) 000-0000',
        gender: 'Other',
        dob: new Date('2003-01-01'),
        dateOfBirth: new Date('2003-01-01'),
        department: department || 'General Academics',
        course: assignedCourse,
        semester: Number(semester) || 1,
        address: address || 'Campus Residence',
        status: 'Active',
      });

      // Link User to Student
      createdUser.studentId = createdStudent._id;
      createdUser.student = createdStudent._id;
      await createdUser.save();

      // Create default enrollment if course exists
      if (assignedCourse) {
        createdEnrollment = await Enrollment.create({
          student: createdStudent._id,
          course: assignedCourse,
          semester: Number(semester) || 1,
          status: 'Active',
        });
      }
    }

    const token = generateToken(createdUser._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        studentId: createdStudent?._id || createdUser.studentId,
        student: createdStudent || createdUser.student,
      },
    });
  } catch (error) {
    // Safe Rollback logic: Clean up any partially created documents
    if (createdEnrollment && createdEnrollment._id) {
      await Enrollment.findByIdAndDelete(createdEnrollment._id).catch(() => {});
    }
    if (createdStudent && createdStudent._id && !student) {
      await Student.findByIdAndDelete(createdStudent._id).catch(() => {});
    }
    if (createdUser && createdUser._id) {
      await User.findByIdAndDelete(createdUser._id).catch(() => {});
    }

    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Account or registration number already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get current logged in user
// @route  GET /api/auth/me
// @access Private
exports.getMe = async (req, res) => {
  try {
    let user = await User.findById(req.user._id)
      .select('-password')
      .populate({
        path: 'student',
        populate: { path: 'course', select: 'courseName courseCode department' },
      })
      .populate({
        path: 'studentId',
        populate: { path: 'course', select: 'courseName courseCode department' },
      });

    if (user && user.role === 'student' && !user.student && !user.studentId) {
      const student = await Student.findOne({
        $or: [{ userId: user._id }, { email: user.email.toLowerCase().trim() }],
      }).populate('course', 'courseName courseCode department');
      if (student) {
        user.student = student._id;
        user.studentId = student._id;
        await User.findByIdAndUpdate(user._id, { student: student._id, studentId: student._id });
        if (!student.userId || !student.user) {
          student.userId = user._id;
          student.user = user._id;
          await student.save();
        }
        user = await User.findById(req.user._id)
          .select('-password')
          .populate({
            path: 'student',
            populate: { path: 'course', select: 'courseName courseCode department' },
          })
          .populate({
            path: 'studentId',
            populate: { path: 'course', select: 'courseName courseCode department' },
          });
      }
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update user profile
// @route  PUT /api/auth/profile
// @access Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email.toLowerCase().trim();
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar;
    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Create admin user
// @route  POST /api/auth/admin
// @access Public / Admin
exports.createAdmin = async (req, res) => {
  const { name, email, password, adminCode, phone } = req.body;
  const normalizedEmail = String(email || '').toLowerCase().trim();

  if (!name?.trim() || !normalizedEmail || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'User already exists with this email' });
  }

  const selectedRole = role === 'admin' ? 'admin' : 'student';
  if (selectedRole === 'admin') {
    const expectedAdminCode = process.env.ADMIN_REGISTRATION_CODE || 'ADMIN123';
    if (!adminCode || adminCode !== expectedAdminCode) {
      return res.status(403).json({ success: false, message: 'Invalid administrator authorization code' });
    }
    if (!phone?.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required for administrator accounts' });
    }

    createdUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'admin',
      phone: phone.trim(),
    });

    const token = generateToken(createdUser._id);
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        phone: createdUser.phone,
        studentId: null,
        student: null,
      },
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current password, new password, and confirmation' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'Account not found' });

    const valid = await user.comparePassword(currentPassword);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully. Use the new password for your next login.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
