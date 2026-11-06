require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sams_db', {
    serverSelectionTimeoutMS: 5000,
  });

  const email = 'priyal@gmail.com';
  const user = await User.findOne({ email });
  let student = null;

  if (user) {
    student = await Student.findOne({
      $or: [{ userId: user._id }, { user: user._id }, { email }],
    });
  }

  const linked = Boolean(
    user && student &&
    String(student._id) === String(user.student || user.studentId) &&
    String(user._id) === String(student.user || student.userId)
  );

  console.log(JSON.stringify({
    emailExists: Boolean(user),
    user: user ? {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId ? String(user.studentId) : null,
      student: user.student ? String(user.student) : null,
    } : null,
    studentExists: Boolean(student),
    student: student ? {
      id: String(student._id),
      registrationNumber: student.registrationNumber,
      name: student.fullName || student.name,
      email: student.email,
      userId: student.userId ? String(student.userId) : null,
      user: student.user ? String(student.user) : null,
    } : null,
    linked,
  }, null, 2));

  await mongoose.disconnect();
})().catch(async (error) => {
  console.error(error.message || error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
