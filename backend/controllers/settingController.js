const Setting = require('../models/Setting');
const Activity = require('../models/Activity');

// @desc   Get system settings
// @route  GET /api/settings
// @access Private
exports.getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({
        institutionName: 'National Institute of Academic Excellence',
        institutionCode: 'NIAE-EDU',
        contactEmail: 'contact@sams.edu',
        contactPhone: '+1 (555) 019-2834',
        currentAcademicYear: '2025-2026',
        currentSemester: 'Fall 2025',
        minimumAttendancePercentage: 75,
        gradingRules: [
          { grade: 'A+', minPercentage: 90, description: 'Outstanding / Exceptional' },
          { grade: 'A', minPercentage: 80, description: 'Excellent' },
          { grade: 'B', minPercentage: 70, description: 'Very Good' },
          { grade: 'C', minPercentage: 60, description: 'Good / Satisfactory' },
          { grade: 'D', minPercentage: 50, description: 'Pass' },
          { grade: 'F', minPercentage: 0, description: 'Fail' },
        ],
      });
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update system settings
// @route  PUT /api/settings
// @access Private (Admin)
exports.updateSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create(req.body);
    } else {
      settings = await Setting.findByIdAndUpdate(settings._id, req.body, {
        new: true,
        runValidators: true,
      });
    }

    await Activity.create({
      action: 'UPDATE_SETTINGS',
      description: 'Institutional settings and configuration updated',
      performedBy: req.user ? req.user.name : 'Admin',
      entityType: 'System',
    });

    res.json({
      success: true,
      data: settings,
      message: 'System settings updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
