const Announcement = require('../models/Announcement');

exports.getAnnouncements = async (req, res) => {
  try {
    const query = {
      publishDate: { $lte: new Date() },
      $and: [{ $or: [{ expiryDate: null }, { expiryDate: { $gte: new Date() } }] }],
    };

    if (req.user.role === 'student') {
      query.audience = { $in: ['all', 'students'] };
    } else if (req.user.role === 'admin') {
      query.audience = { $in: ['all', 'students', 'admins'] };
    }

    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name email role')
      .sort({ publishDate: -1, createdAt: -1 });

    res.json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, audience, priority, publishDate, expiryDate } = req.body;
    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({ success: false, message: 'Title and announcement message are required' });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      audience: audience || 'students',
      priority: priority || 'normal',
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: announcement, message: 'Announcement published successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAnnouncement = async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.title) update.title = update.title.trim();
    if (update.message) update.message = update.message.trim();
    if (update.publishDate) update.publishDate = new Date(update.publishDate);
    update.expiryDate = update.expiryDate ? new Date(update.expiryDate) : null;

    const announcement = await Announcement.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, data: announcement, message: 'Announcement updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
