const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
    },
    date: {
      type: String, // Stored as YYYY-MM-DD for precise daily unique checks and queries
      required: [true, 'Attendance date is required (YYYY-MM-DD)'],
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Leave'],
      required: [true, 'Attendance status is required'],
      default: 'Present',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate attendance entries for the same student, subject, and date
attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });
attendanceSchema.index({ course: 1, semester: 1, subject: 1, date: 1 });
attendanceSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
