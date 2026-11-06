import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
} from 'lucide-react';
import api from '../../api/axiosClient';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { LoadingSpinner, EmptyState } from '../../components/ui/Feedback';

const Enrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const initialForm = {
    student: '',
    course: '',
    semester: 4,
    subjects: [],
    status: 'Active',
    academicYear: '2025-2026',
  };
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [courseFilter, statusFilter, search]);

  const fetchMetadata = async () => {
    try {
      const [resC, resSt, resSub] = await Promise.all([
        api.get('/courses'),
        api.get('/students?limit=100'),
        api.get('/subjects'),
      ]);
      if (resC.data.success) setCourses(resC.data.data);
      if (resSt.data.success) setStudents(resSt.data.data);
      if (resSub.data.success) setSubjects(resSub.data.data);
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const params = {
        course: courseFilter,
        status: statusFilter,
        search,
      };
      const res = await api.get('/enrollments', { params });
      if (res.data.success) {
        setEnrollments(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    const defaultCourse = courses[0]?._id || '';
    const relevantSubs = subjects.filter((s) => s.course?._id === defaultCourse || s.course === defaultCourse);
    setFormData({
      ...initialForm,
      student: students[0]?._id || '',
      course: defaultCourse,
      subjects: relevantSubs.map((s) => s._id),
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCourseChangeInForm = (courseId) => {
    const relevantSubs = subjects.filter((s) => s.course?._id === courseId || s.course === courseId);
    setFormData({
      ...formData,
      course: courseId,
      subjects: relevantSubs.map((s) => s._id),
    });
  };

  const handleOpenEdit = (en) => {
    setIsEditing(true);
    setSelectedEnrollment(en);
    setFormData({
      student: en.student?._id || en.student,
      course: en.course?._id || en.course,
      semester: en.semester,
      subjects: en.subjects ? en.subjects.map((s) => s._id || s) : [],
      status: en.status,
      academicYear: en.academicYear || '2025-2026',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (isEditing) {
        await api.put(`/enrollments/${selectedEnrollment._id}`, formData);
      } else {
        await api.post('/enrollments', formData);
      }
      setIsModalOpen(false);
      fetchEnrollments();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/enrollments/${id}`);
      setDeleteConfirmId(null);
      fetchEnrollments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete enrollment');
    }
  };

  const handleToggleSubject = (subId) => {
    const current = [...formData.subjects];
    const index = current.indexOf(subId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(subId);
    }
    setFormData({ ...formData, subjects: current });
  };

  // Filter available subjects based on chosen course
  const availableSubjects = subjects.filter(
    (s) => s.course?._id === formData.course || s.course === formData.course
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Enrollment Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Link students to academic degree programs and configure subject enrollments
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-primary hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Enrollment</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or registration number..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full md:w-48 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.courseCode} - {c.courseName}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-36 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Dropped">Dropped</option>
          </select>
        </div>
      </div>

      {/* Enrollment Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving enrollments..." />
        ) : enrollments.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No enrollments found"
            description="No student enrollment records match your search criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Course Enrolled</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Assigned Subjects</th>
                  <th className="py-3 px-4">Academic Year</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {enrollments.map((en) => (
                  <tr key={en._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {en.student?.registrationNumber || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{en.student?.fullName || 'N/A'}</div>
                      <div className="text-[11px] text-slate-400">{en.student?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {en.course?.courseCode} - {en.course?.courseName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">Sem {en.semester}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                        {en.subjects?.length || 0} Subjects
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{en.academicYear}</td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          en.status === 'Active'
                            ? 'success'
                            : en.status === 'Completed'
                            ? 'primary'
                            : 'warning'
                        }
                      >
                        {en.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(en)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Enrollment"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(en._id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Enrollment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Enrollment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Modify Student Enrollment' : 'Enroll Student in Course'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Student *</label>
              <select
                disabled={isEditing}
                required
                value={formData.student}
                onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-60"
              >
                <option value="">Choose Student</option>
                {students.map((st) => (
                  <option key={st._id} value={st._id}>
                    {st.registrationNumber} - {st.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Course *</label>
              <select
                disabled={isEditing}
                required
                value={formData.course}
                onChange={(e) => handleCourseChangeInForm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-60"
              >
                <option value="">Choose Course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.courseCode} - {c.courseName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Semester *</label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Enrollment Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Dropped">Dropped</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Subject Assignments */}
          <div>
            <label className="block font-semibold text-slate-700 mb-2">
              Assign Curriculum Subjects ({formData.subjects.length} selected)
            </label>
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
              {availableSubjects.length === 0 ? (
                <p className="text-slate-400 text-center py-2">No subjects available for this course</p>
              ) : (
                availableSubjects.map((sub) => {
                  const isChecked = formData.subjects.includes(sub._id);
                  return (
                    <label
                      key={sub._id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        isChecked ? 'bg-blue-50 border border-blue-200' : 'bg-white hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSubject(sub._id)}
                          className="rounded text-primary focus:ring-blue-500"
                        />
                        <span className="font-semibold text-slate-800">{sub.subjectName}</span>
                        <span className="text-slate-400 font-mono">({sub.subjectCode})</span>
                      </div>
                      <span className="text-slate-500">{sub.credits} Credits</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-primary hover:bg-blue-800 text-white rounded-xl font-semibold shadow disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Enrollment' : 'Confirm Enrollment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Enrollment Removal"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to remove this enrollment record?
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteConfirmId)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow"
            >
              Confirm Remove
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Enrollments;
