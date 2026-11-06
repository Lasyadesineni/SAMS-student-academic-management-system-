const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    institutionName: {
      type: String,
      default: 'National Institute of Academic Excellence',
    },
    institutionCode: {
      type: String,
      default: 'NIAE-EDU',
    },
    contactEmail: {
      type: String,
      default: 'contact@sams.edu',
    },
    contactPhone: {
      type: String,
      default: '+1 (555) 019-2834',
    },
    currentAcademicYear: {
      type: String,
      default: '2025-2026',
    },
    currentSemester: {
      type: String,
      default: 'Fall 2025',
    },
    minimumAttendancePercentage: {
      type: Number,
      default: 75,
    },
    gradingRules: [
      {
        grade: String,
        minPercentage: Number,
        description: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Setting', settingSchema);
