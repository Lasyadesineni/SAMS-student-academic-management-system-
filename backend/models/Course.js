const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required (e.g. 4 Years)'],
      trim: true,
    },
    totalSemesters: {
      type: Number,
      required: true,
      default: 8,
      min: 1,
      max: 16,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Archived'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

courseSchema.index({ department: 1 });

module.exports = mongoose.model('Course', courseSchema);
