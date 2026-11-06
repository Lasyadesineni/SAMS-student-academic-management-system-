const mongoose = require('mongoose');

const markSchema = new mongoose.Schema(
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
    examType: {
      type: String,
      enum: ['Internal Assessment', 'Assignment', 'Mid-Semester', 'End-Semester'],
      required: [true, 'Examination type is required'],
    },
    obtainedMarks: {
      type: Number,
      required: [true, 'Obtained marks are required'],
      min: 0,
    },
    maxMarks: {
      type: Number,
      required: [true, 'Maximum marks are required'],
      min: 1,
      default: 100,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'B', 'C', 'D', 'F'],
      default: 'F',
    },
    academicYear: {
      type: String,
      default: '2025-2026',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Calculate percentage and grade helper
function computeGrade(pct) {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
}

markSchema.pre('save', function (next) {
  if (this.maxMarks && this.maxMarks > 0) {
    this.percentage = parseFloat(((this.obtainedMarks / this.maxMarks) * 100).toFixed(2));
    this.grade = computeGrade(this.percentage);
  }
  next();
});

markSchema.index({ student: 1, subject: 1, examType: 1, academicYear: 1 }, { unique: true });
markSchema.index({ course: 1, semester: 1, examType: 1 });
markSchema.index({ student: 1 });

module.exports = mongoose.model('Mark', markSchema);
