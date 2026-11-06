const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sams_super_secret_jwt_key_2025');
      
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      // If user is a student, ensure studentId and student are populated & linked
      if (user.role === 'student') {
        let studentRecord = null;
        const currentRef = user.studentId || user.student;
        if (currentRef) {
          studentRecord = await Student.findById(currentRef);
        }

        if (!studentRecord) {
          studentRecord = await Student.findOne({
            $or: [{ userId: user._id }, { email: user.email.toLowerCase().trim() }],
          });
        }

        if (studentRecord) {
          let userNeedsSave = false;
          let studentNeedsSave = false;

          if (!user.studentId || !user.student) {
            user.studentId = studentRecord._id;
            user.student = studentRecord._id;
            userNeedsSave = true;
          }
          if (!studentRecord.userId || !studentRecord.user) {
            studentRecord.userId = user._id;
            studentRecord.user = user._id;
            studentNeedsSave = true;
          }

          if (userNeedsSave) {
            await User.findByIdAndUpdate(user._id, {
              studentId: studentRecord._id,
              student: studentRecord._id,
            });
          }
          if (studentNeedsSave) {
            await Student.findByIdAndUpdate(studentRecord._id, {
              userId: user._id,
              user: user._id,
            });
          }
        }
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Ensure a student can only view their own information
const ensureStudentSelfOrAdmin = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next();
  }

  const requestedStudentId = req.params.studentId || req.params.id || req.query.studentId;
  const userStudentRef = req.user.studentId || req.user.student;
  
  if (!userStudentRef || (requestedStudentId && userStudentRef.toString() !== requestedStudentId.toString())) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: You can only view your own student academic records',
    });
  }

  next();
};

module.exports = {
  protect,
  authorize,
  ensureStudentSelfOrAdmin,
};
