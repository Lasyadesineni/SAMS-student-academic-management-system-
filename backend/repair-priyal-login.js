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
  if (!user) throw new Error('Login account not found');

  let student = await Student.findOne({ email });
  if (!student) throw new Error('Student profile not found');

  await User.findByIdAndUpdate(user._id, {
    student: student._id,
    studentId: student._id,
  });

  student.user = user._id;
  student.userId = user._id;
  await student.save();

  console.log(JSON.stringify({
    repaired: true,
    email: user.email,
    userId: String(user._id),
    studentId: String(student._id),
    registrationNumber: student.registrationNumber,
  }, null, 2));

  await mongoose.disconnect();
})().catch(async (error) => {
  console.error(error.message || error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
