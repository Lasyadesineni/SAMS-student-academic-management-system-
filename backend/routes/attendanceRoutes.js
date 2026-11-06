const express = require('express');
const router = express.Router();
const {
  getAttendance,
  saveAttendance,
  updateAttendanceRecord,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getAttendance)
  .post(authorize('admin'), saveAttendance);

router.route('/:id')
  .put(authorize('admin'), updateAttendanceRecord);

module.exports = router;
