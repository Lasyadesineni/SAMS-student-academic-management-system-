const express = require('express');
const router = express.Router();
const {
  getEnrollments,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getEnrollments)
  .post(authorize('admin'), createEnrollment);

router.route('/:id')
  .put(authorize('admin'), updateEnrollment)
  .delete(authorize('admin'), deleteEnrollment);

module.exports = router;
