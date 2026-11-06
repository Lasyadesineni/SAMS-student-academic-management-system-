const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getStudentDashboard,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/admin', authorize('admin'), getAdminDashboard);
router.get('/student', authorize('student', 'admin'), getStudentDashboard);

module.exports = router;
