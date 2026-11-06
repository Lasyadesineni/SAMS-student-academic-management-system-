const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    performedBy: {
      type: String,
      default: 'Admin User',
    },
    entityType: {
      type: String,
      enum: ['Student', 'Course', 'Subject', 'Enrollment', 'Attendance', 'Mark', 'System'],
      default: 'System',
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ timestamp: -1 });

module.exports = mongoose.model('Activity', activitySchema);
