const express = require('express');
const router = express.Router();
const {
  getMarks,
  saveMarks,
  updateMark,
} = require('../controllers/markController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getMarks)
  .post(authorize('admin'), saveMarks);

router.route('/:id')
  .put(authorize('admin'), updateMark);

module.exports = router;
