const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');

router.use(protect);
router.get('/', getAnnouncements);
router.post('/', authorize('admin'), createAnnouncement);
router.put('/:id', authorize('admin'), updateAnnouncement);
router.delete('/:id', authorize('admin'), deleteAnnouncement);

module.exports = router;
