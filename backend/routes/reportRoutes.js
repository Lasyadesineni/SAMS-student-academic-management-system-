const express = require('express');
const router = express.Router();
const {
  getAttendanceReport,
  getPerformanceReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/attendance', getAttendanceReport);
router.get('/performance', getPerformanceReport);

module.exports = router;
