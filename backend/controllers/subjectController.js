const Subject = require('../models/Subject');
const Activity = require('../models/Activity');

// @desc   Get all subjects (supports filter by course, semester)
// @route  GET /api/subjects
// @access Private
exports.getSubjects = async (req, res) => {
  try {
    const { course, semester, search } = req.query;
    const query = {};

    if (course) query.course = course;
    if (semester) query.semester = Number(semester);
    if (search) {
      query.$or = [
        { subjectName: { $regex: search, $options: 'i' } },
        { subjectCode: { $regex: search, $options: 'i' } },
        { facultyName: { $regex: search, $options: 'i' } },
      ];
    }

    const subjects = await Subject.find(query)
      .populate('course', 'courseName courseCode department')
      .sort({ semester: 1, subjectName: 1 });

    res.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get subject by ID
// @route  GET /api/subjects/:id
// @access Private
exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id).populate('course');
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Create subject
// @route  POST /api/subjects
// @access Private (Admin)
exports.createSubject = async (req, res) => {
  try {
    const { subjectCode, subjectName, course, semester, credits, facultyName, status } = req.body;

    const existing = await Subject.findOne({ subjectCode: subjectCode.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Subject code already exists' });
    }

    const subject = await Subject.create({
      subjectCode: subjectCode.toUpperCase().trim(),
      subjectName,
      course,
      semester: Number(semester),
      credits: Number(credits) || 3,
      facultyName,
      status: status || 'Active',
    });

    await Activity.create({
      action: 'ADD_SUBJECT',
      description: `New subject added: ${subject.subjectName} (${subject.subjectCode})`,
      performedBy: req.user ? req.user.name : 'Admin',
      entityType: 'Subject',
      entityId: subject._id,
    });

    res.status(201).json({
      success: true,
      data: subject,
      message: 'Subject created successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update subject
// @route  PUT /api/subjects/:id
// @access Private (Admin)
exports.updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    if (req.body.subjectCode && req.body.subjectCode.toUpperCase() !== subject.subjectCode) {
      const exists = await Subject.findOne({ subjectCode: req.body.subjectCode.toUpperCase() });
      if (exists) {
        return res.status(400).json({ success: false, message: 'Subject code already exists' });
      }
    }

    const updated = await Subject.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        subjectCode: req.body.subjectCode ? req.body.subjectCode.toUpperCase().trim() : subject.subjectCode,
      },
      { new: true, runValidators: true }
    ).populate('course');

    await Activity.create({
      action: 'UPDATE_SUBJECT',
      description: `Subject updated: ${updated.subjectName} (${updated.subjectCode})`,
      performedBy: req.user ? req.user.name : 'Admin',
      entityType: 'Subject',
      entityId: updated._id,
    });

    res.json({
      success: true,
      data: updated,
      message: 'Subject updated successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete subject
// @route  DELETE /api/subjects/:id
// @access Private (Admin)
exports.deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    await Subject.findByIdAndDelete(req.params.id);

    await Activity.create({
      action: 'DELETE_SUBJECT',
      description: `Subject removed: ${subject.subjectName} (${subject.subjectCode})`,
      performedBy: req.user ? req.user.name : 'Admin',
      entityType: 'Subject',
      entityId: subject._id,
    });

    res.json({
      success: true,
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
