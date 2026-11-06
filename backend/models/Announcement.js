const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    audience: { type: String, enum: ['all', 'students', 'admins'], default: 'students' },
    priority: { type: String, enum: ['normal', 'important', 'urgent'], default: 'normal' },
    publishDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

announcementSchema.index({ audience: 1, publishDate: -1 });
announcementSchema.index({ expiryDate: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
